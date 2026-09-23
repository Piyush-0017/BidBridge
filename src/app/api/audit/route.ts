import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function GET() {
  try {
    await requireAuth([Role.OFFICER, Role.ADMIN]);

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    });

    const { verifyAuditChainIntegrity } = await import("@/lib/auditChain");
    const chainVerification = verifyAuditChainIntegrity(logs);

    return NextResponse.json({
      logs,
      chainVerification,
    });
  } catch (e: any) {
    if (e.name === "UnauthorizedError" || e.name === "ForbiddenError")
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    console.error("Audit GET failed:", e);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
