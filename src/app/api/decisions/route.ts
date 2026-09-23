import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { DecisionType, Role, BidStatus } from "@prisma/client";

const schema = z.object({
  bidId: z.string().min(1),
  decision: z.nativeEnum(DecisionType),
  reason: z.string().min(3),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth([Role.OFFICER, Role.ADMIN]);
    const body = await req.json();
    const data = schema.parse(body);

    const bid = await prisma.bid.findUnique({
      where: { id: data.bidId },
      include: { bidder: true },
    });

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Upsert the officer decision
    const decision = await prisma.officerDecision.upsert({
      where: { bidId: bid.id },
      create: {
        bidId: bid.id,
        officerId: user.id,
        decision: data.decision,
        reason: data.reason,
      },
      update: {
        officerId: user.id,
        decision: data.decision,
        reason: data.reason,
      },
    });

    // Update bid status based on decision type
    const statusMap: Record<DecisionType, BidStatus> = {
      [DecisionType.QUALIFY]: BidStatus.TECHNICALLY_QUALIFIED,
      [DecisionType.DISQUALIFY]: BidStatus.TECHNICALLY_DISQUALIFIED,
      [DecisionType.REQUEST_CLARIFICATION]: BidStatus.UNDER_EVALUATION,
    };

    await prisma.bid.update({
      where: { id: bid.id },
      data: { status: statusMap[data.decision] },
    });

    await logAudit(user.id, "OFFICER_DECISION", "Bid", bid.id, {
      decision: data.decision,
      reason: data.reason,
    });

    // Fire notification and email to the bidder (non-blocking)
    import("@/lib/notifier")
      .then(({ dispatchStatutoryEmail, createUserNotification }) => {
        createUserNotification({
          userId: bid.bidderId,
          title: `Decision on your bid: ${data.decision}`,
          message: data.reason,
          link: "/bidder/my-bids",
        });

        if (bid.bidder?.email) {
          dispatchStatutoryEmail({
            to: bid.bidder.email,
            recipientName: bid.bidder.name || "Authorized Signatory",
            subject: `[CPPP/GeM] Evaluation Decision: ${data.decision}`,
            title: `Tender Committee Decision: ${data.decision}`,
            tenderRef: bid.tenderId,
            bodyHtml: `<h3>Procurement Committee Decision Update</h3><p>Dear ${bid.bidder.name},</p><p>A formal decision has been recorded on your bid:</p><p><strong>Status:</strong> ${data.decision}</p><p><strong>Remarks:</strong> ${data.reason}</p>`,
          });
        }
      })
      .catch((err) =>
        console.error("[NOTIFICATION] Failed to create decision notification:", err)
      );

    return NextResponse.json(decision, { status: 201 });
  } catch (e: any) {
    if (e.name === "ZodError")
      return NextResponse.json(
        { error: "Validation failed", details: e.errors },
        { status: 400 }
      );
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Decision POST failed:", e);
    return NextResponse.json({ error: "Decision failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAuth([Role.OFFICER, Role.ADMIN]);

    const decisions = await prisma.officerDecision.findMany({
      include: {
        bid: {
          include: {
            tender: true,
            bidder: { include: { bidderProfile: true } },
          },
        },
        officer: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(decisions);
  } catch (e: any) {
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Decisions GET failed:", e);
    return NextResponse.json({ error: "Failed to fetch decisions" }, { status: 500 });
  }
}
