import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { BidStatus, Role } from "@prisma/client";
import { isTenderAcceptingBids } from "@/lib/stateMachines";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const tenderId = searchParams.get("tenderId");
    const my = searchParams.get("my") === "true";

    const where: any = {};
    if (tenderId) where.tenderId = tenderId;

    // If ?my=true, return only the authenticated user's bids (resource-level ownership check)
    if (my) {
      if (user.role !== Role.BIDDER) {
        return NextResponse.json(
          { error: "Forbidden: only bidders can use ?my=true" },
          { status: 403 }
        );
      }
      where.bidderId = user.id;
    }

    // Officers can see all bids; bidders can only see their own
    if (user.role === Role.BIDDER && !my) {
      where.bidderId = user.id;
    }

    const bids = await prisma.bid.findMany({
      where,
      include: {
        tender: {
          select: {
            id: true,
            referenceNo: true,
            title: true,
            status: true,
            bidEndAt: true,
            estimatedValue: true,
          },
        },
        bidder: {
          select: { id: true, name: true, email: true, bidderProfile: true },
        },
        recommendation: true,
        decision: {
          include: { officer: { select: { name: true, email: true } } },
        },
        riskResult: true,
        compliance: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bids);
  } catch (e: any) {
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Bids GET failed:", e);
    return NextResponse.json({ error: "Failed to fetch bids" }, { status: 500 });
  }
}

const createSchema = z.object({
  tenderId: z.string().min(1),
  tenderRef: z.string().optional(),
  tenderTitle: z.string().optional(),
  status: z.string().optional(),
  totalAmount: z.union([z.number(), z.string()]).optional(),
  evaluatedValue: z.union([z.number(), z.string()]).optional(),
  complianceScore: z.number().optional(),
  hash: z.string().optional(),
  ackNumber: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth([Role.BIDDER]);
    const body = await req.json();
    const parsed = createSchema.parse(body);

    const totalVal = parsed.totalAmount
      ? Number(parsed.totalAmount)
      : parsed.evaluatedValue
      ? Number(parsed.evaluatedValue)
      : undefined;

    // Resolve tender by ID or reference number
    const tender = await prisma.tender.findFirst({
      where: {
        OR: [
          { id: parsed.tenderId },
          { referenceNo: parsed.tenderRef || parsed.tenderId },
        ],
      },
    });

    if (!tender) {
      return NextResponse.json(
        { error: "Tender not found. Ensure the tender ID or reference number is correct." },
        { status: 404 }
      );
    }

    // Enforce tender status — only OPEN tenders accept bids (state machine)
    if (!isTenderAcceptingBids(tender.status)) {
      return NextResponse.json(
        {
          error: `This tender is not accepting bids. Current tender status: ${tender.status}. Only OPEN tenders accept bid submissions.`,
          code: "TENDER_NOT_OPEN",
        },
        { status: 422 }
      );
    }

    // Enforce bid deadline — server-side check (browser deadline cannot be trusted)
    if (new Date() > new Date(tender.bidEndAt)) {
      return NextResponse.json(
        { error: "Bid submission deadline has passed. This tender is closed." },
        { status: 422 }
      );
    }

    // Upsert bid — create if not exists, update if previously drafted
    const existing = await prisma.bid.findUnique({
      where: { tenderId_bidderId: { tenderId: tender.id, bidderId: user.id } },
    });

    let bid;
    if (existing) {
      // Prevent re-submission of an already submitted bid
      if (existing.status !== BidStatus.DRAFT) {
        return NextResponse.json(
          { error: `Bid cannot be modified. Current status: ${existing.status}` },
          { status: 409 }
        );
      }
      bid = await prisma.bid.update({
        where: { id: existing.id },
        data: {
          status: (parsed.status as BidStatus) || BidStatus.SUBMITTED,
          complianceScore: parsed.complianceScore ?? undefined,
          submittedAt: new Date(),
        },
        include: {
          tender: true,
          bidder: { include: { bidderProfile: true } },
        },
      });
    } else {
      bid = await prisma.bid.create({
        data: {
          tenderId: tender.id,
          bidderId: user.id,
          status: (parsed.status as BidStatus) || BidStatus.SUBMITTED,
          complianceScore: parsed.complianceScore ?? undefined,
          submittedAt: new Date(),
        },
        include: {
          tender: true,
          bidder: { include: { bidderProfile: true } },
        },
      });
    }

    await logAudit(user.id, "BID_SUBMIT", "Bid", bid.id, {
      tenderId: tender.id,
      tenderRef: tender.referenceNo,
      totalAmount: totalVal,
    });

    // Statutory notification & email dispatch (non-blocking)
    import("@/lib/notifier")
      .then(({ dispatchStatutoryEmail, createUserNotification }) => {
        createUserNotification({
          userId: user.id,
          title: `Bid Submitted: ${tender.referenceNo}`,
          message: `Your bid for "${tender.title}" has been cryptographically sealed and submitted for committee evaluation.`,
          link: "/bidder/my-bids",
        });
        if (user.email) {
          dispatchStatutoryEmail({
            to: user.email,
            recipientName: user.name || "Authorized Signatory",
            subject: `[CPPP/GeM] Bid Submission Acknowledgment: ${tender.referenceNo}`,
            title: `Your bid for "${tender.title}" has been successfully recorded.`,
            tenderRef: tender.referenceNo,
            bodyHtml: `<h3>Bid Submission Acknowledgment</h3><p>Dear ${user.name},</p><p>Your electronic bid for Tender Reference <strong>${tender.referenceNo}</strong> has been received and cryptographically vaulted.</p><p>Status: <strong>SUBMITTED</strong></p>`,
          });
        }
      })
      .catch((err) => console.warn("[NOTIFICATION-DISPATCH-NOTICE]", err.message));

    return NextResponse.json(bid, { status: 201 });
  } catch (e: any) {
    if (e.name === "ZodError")
      return NextResponse.json(
        { error: "Invalid input", details: e.errors },
        { status: 400 }
      );
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Bid creation failed:", e);
    return NextResponse.json({ error: "Failed to create bid" }, { status: 500 });
  }
}
