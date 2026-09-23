import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { BidStatus, TenderStatus, Role } from "@prisma/client";
import { validateTenderTransition } from "@/lib/stateMachines";

const awardSchema = z.object({
  tenderId: z.string().min(1),
  winningBidId: z.string().min(1),
  remarks: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth([Role.OFFICER, Role.ADMIN]);
    const body = await req.json();
    const { tenderId, winningBidId, remarks } = awardSchema.parse(body);

    // Resolve tender by ID or reference number
    const tender = await prisma.tender.findFirst({
      where: {
        OR: [{ id: tenderId }, { referenceNo: tenderId }],
      },
    });

    if (!tender) {
      return NextResponse.json({ error: "Tender not found" }, { status: 404 });
    }

    // ── State Machine Enforcement ──────────────────────────────────────────
    // Tender must be CLOSED before it can be AWARDED
    const transitionError = validateTenderTransition(
      tender.status,
      TenderStatus.AWARDED
    );
    if (transitionError) {
      return NextResponse.json(
        {
          error: transitionError,
          code: "INVALID_STATE_TRANSITION",
          hint: "Tender must be in CLOSED status before awarding. Transition: OPEN → CLOSED → AWARDED",
        },
        { status: 422 }
      );
    }

    // Verify the winning bid exists and belongs to this tender
    const winningBid = await prisma.bid.findFirst({
      where: { id: winningBidId, tenderId: tender.id },
      include: { bidder: true },
    });

    if (!winningBid) {
      return NextResponse.json(
        {
          error: "Winning bid not found or does not belong to this tender.",
        },
        { status: 404 }
      );
    }

    // Verify winning bid is technically qualified (must be TECHNICALLY_QUALIFIED or FINANCIAL_EVALUATION)
    if (
      winningBid.status !== BidStatus.TECHNICALLY_QUALIFIED &&
      winningBid.status !== BidStatus.FINANCIAL_EVALUATION
    ) {
      return NextResponse.json(
        {
          error: `Bid cannot be awarded. Current bid status: ${winningBid.status}. Bid must be TECHNICALLY_QUALIFIED or in FINANCIAL_EVALUATION.`,
          code: "BID_NOT_QUALIFIED_FOR_AWARD",
        },
        { status: 422 }
      );
    }

    // 1. Award the winning bid
    await prisma.bid.update({
      where: { id: winningBid.id },
      data: { status: BidStatus.AWARDED },
    });

    // 2. Mark all other bids for this tender as NOT_AWARDED
    await prisma.bid.updateMany({
      where: {
        tenderId: tender.id,
        id: { not: winningBid.id },
        status: {
          notIn: [BidStatus.TECHNICALLY_DISQUALIFIED, BidStatus.NOT_AWARDED],
        },
      },
      data: { status: BidStatus.NOT_AWARDED },
    });

    // 3. Mark tender as AWARDED
    await prisma.tender.update({
      where: { id: tender.id },
      data: { status: TenderStatus.AWARDED },
    });

    // 4. Audit log (critical compliance record)
    await logAudit(user.id, "TENDER_AWARD", "Tender", tender.id, {
      winningBidId: winningBid.id,
      winningBidder: winningBid.bidder.name,
      tenderRef: tender.referenceNo,
      remarks: remarks ?? "Contract awarded to lowest evaluated responsive bidder (L1) per GFR 2017.",
    });

    // 5. Notify winning bidder with in-app notification and official email dispatch (non-blocking)
    import("@/lib/notifier")
      .then(({ dispatchStatutoryEmail, createUserNotification }) => {
        createUserNotification({
          userId: winningBid.bidderId,
          title: `🏆 Tender Awarded: ${tender.referenceNo}`,
          message: `Congratulations! Your bid has been selected as L1 and awarded the contract. Letter of Award (LOA) will be issued within 7 working days.`,
          link: "/bidder/my-bids",
        });

        if (winningBid.bidder?.email) {
          dispatchStatutoryEmail({
            to: winningBid.bidder.email,
            recipientName: winningBid.bidder.name || "Authorized Signatory",
            subject: `🏆 Letter of Award Notice: ${tender.referenceNo}`,
            title: `Contract Awarded for Tender ${tender.referenceNo}`,
            tenderRef: tender.referenceNo,
            bodyHtml: `<h2>Official Letter of Award (LOA) Notification</h2><p>Dear ${winningBid.bidder.name},</p><p>We are pleased to inform you that your bid has been evaluated as the lowest responsive bid (L1) and has been <strong>AWARDED</strong> the contract for tender <strong>${tender.referenceNo}</strong> (${tender.title}).</p><p>Please access the portal to view the Letter of Award and submit the required Performance Bank Guarantee (PBG) within the stipulated timeframe.</p>`,
          });
        }
      })
      .catch((err) =>
        console.error("[NOTIFICATION] Award notification failed:", err)
      );

    return NextResponse.json({
      success: true,
      tenderId: tender.id,
      referenceNo: tender.referenceNo,
      winningBidId: winningBid.id,
      winningBidder: winningBid.bidder.name,
      status: TenderStatus.AWARDED,
    });
  } catch (e: any) {
    if (e.name === "ZodError")
      return NextResponse.json(
        { error: "Validation failed", details: e.errors },
        { status: 400 }
      );
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Award handler error:", e);
    return NextResponse.json({ error: "Failed to award tender" }, { status: 500 });
  }
}
