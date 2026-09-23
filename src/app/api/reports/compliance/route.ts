import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    await requireAuth([Role.OFFICER, Role.ADMIN]);
    const bids = await prisma.bid.findMany({
      include: {
        tender: { select: { referenceNo: true, title: true } },
        bidder: { select: { name: true, email: true, bidderProfile: true } },
        recommendation: true,
        decision: true,
        riskResult: true,
        compliance: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bids);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Login required" }, { status: 401 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
