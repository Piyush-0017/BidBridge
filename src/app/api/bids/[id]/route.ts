import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { BidStatus, Role } from "@prisma/client";
import { z } from "zod";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const bid = await prisma.bid.findUnique({
      where: { id },
      include: {
        tender: { include: { requirements: true } },
        bidder: {
          select: { id: true, name: true, email: true, bidderProfile: true },
        },
        documents: true,
        compliance: { include: { requirement: true } },
        evidence: true,
        recommendation: true,
        decision: true,
        riskResult: true,
      },
    });

    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Resource-level ownership: bidders can only read their own bids
    if (user.role === Role.BIDDER && bid.bidderId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: you do not have access to this bid" },
        { status: 403 }
      );
    }

    return NextResponse.json(bid);
  } catch (e: any) {
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Bid GET failed:", e);
    return NextResponse.json({ error: "Failed to fetch bid" }, { status: 500 });
  }
}

const updateSchema = z.object({
  status: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const data = updateSchema.parse(body);

    const bid = await prisma.bid.findUnique({ where: { id } });
    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    // Resource-level ownership: bidders can only update their own bids
    if (user.role === Role.BIDDER && bid.bidderId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: you do not own this bid" },
        { status: 403 }
      );
    }

    // Bidders cannot modify a submitted bid — only officers can change status after submission
    if (
      user.role === Role.BIDDER &&
      bid.status !== BidStatus.DRAFT
    ) {
      return NextResponse.json(
        { error: `Bid is locked. Cannot modify bid in status: ${bid.status}` },
        { status: 409 }
      );
    }

    const updated = await prisma.bid.update({
      where: { id },
      data: {
        status: data.status as BidStatus,
        submittedAt: data.status === "SUBMITTED" ? new Date() : undefined,
      },
    });

    await logAudit(
      user.id,
      data.status === "SUBMITTED" ? "BID_SUBMIT" : "BID_UPDATE",
      "Bid",
      id,
      data
    );

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e.name === "ZodError")
      return NextResponse.json(
        { error: "Invalid input", details: e.errors },
        { status: 400 }
      );
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Bid PATCH failed:", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
