import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { verifyAuditChainIntegrity } from "@/lib/auditChain";

/**
 * GET /api/audit/verify
 * 
 * Performs an on-demand, rigorous cryptographic audit chain recalculation.
 * Recomputes SHA-256 hashes for each record and validates forward cryptographic links.
 * 
 * Supports ?simulateTamper=true for live on-stage tamper detection demonstrations.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAuth([Role.OFFICER, Role.ADMIN]);

    const { searchParams } = new URL(req.url);
    const simulateTamper = searchParams.get("simulateTamper") === "true";

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    });

    const report = verifyAuditChainIntegrity(logs, { simulateTamper });

    return NextResponse.json({
      success: true,
      report,
      databaseTarget: "Neon Cloud PostgreSQL (AuditLog WORM Ledger)",
      isSimulation: simulateTamper,
    });
  } catch (e: any) {
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError") {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    console.error("Audit verification failed:", e);
    return NextResponse.json(
      { error: "Cryptographic audit chain verification failed", details: e.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
