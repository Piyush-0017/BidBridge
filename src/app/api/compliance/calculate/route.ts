import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { VerificationStatus, RiskLevel, DecisionType, Role } from "@prisma/client";
import { score, risk } from "@/lib/compliance";
import { getAdapter } from "@/lib/integrations";

const schema = z.object({ bidId: z.string().cuid() });

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth([Role.OFFICER, Role.ADMIN, Role.BIDDER]);
    const { bidId } = schema.parse(await req.json());

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        tender: { include: { requirements: true } },
        bidder: { include: { bidderProfile: true } },
        compliance: true,
      },
    });
    if (!bid) return NextResponse.json({ error: "Bid not found" }, { status: 404 });

    const adapter = getAdapter();
    const profile = bid.bidder.bidderProfile;
    const results: { requirementId: string; status: VerificationStatus; score: number; reason: string; evidenceText?: string }[] = [];

    for (const req of bid.tender.requirements) {
      const check = await adapter.check({
        requirementCode: req.code,
        companyName: profile?.companyName || bid.bidder.name,
        gstin: profile?.gstin || undefined,
        pan: profile?.pan || undefined,
        udyam: profile?.udyamNumber || undefined,
      });

      const statusMap: Record<string, VerificationStatus> = {
        VERIFIED: VerificationStatus.VERIFIED,
        FAILED: VerificationStatus.FAILED,
        PENDING: VerificationStatus.PENDING,
        NOT_AVAILABLE: VerificationStatus.PENDING,
      };
      const status = statusMap[check.status] || VerificationStatus.PENDING;
      const sc = status === VerificationStatus.VERIFIED ? Number(req.weight || 0) : 0;

      results.push({
        requirementId: req.id,
        status,
        score: sc,
        reason: check.evidence || check.status,
        evidenceText: check.reference,
      });
    }

    for (const r of results) {
      await prisma.complianceResult.upsert({
        where: { bidId_requirementId: { bidId, requirementId: r.requirementId } },
        create: { bidId, ...r },
        update: { status: r.status, score: r.score, reason: r.reason, evidenceText: r.evidenceText },
      });
    }

    const weighted = results.map((r) => ({
      status: r.status as any,
      weight: Number(bid.tender.requirements.find((x) => x.id === r.requirementId)?.weight || 0),
    }));
    const complianceScore = score(weighted);
    const riskLevel = risk(complianceScore) as RiskLevel;

    await prisma.bid.update({
      where: { id: bidId },
      data: { complianceScore, riskLevel },
    });

    await prisma.riskResult.upsert({
      where: { bidId },
      create: {
        bidId,
        score: 100 - complianceScore,
        level: riskLevel,
        factors: { checks: results.length, verified: results.filter((r) => r.status === "VERIFIED").length },
      },
      update: {
        score: 100 - complianceScore,
        level: riskLevel,
        factors: { checks: results.length, verified: results.filter((r) => r.status === "VERIFIED").length },
      },
    });

    const action =
      complianceScore >= 80 ? DecisionType.QUALIFY : complianceScore >= 50 ? DecisionType.REQUEST_CLARIFICATION : DecisionType.DISQUALIFY;
    await prisma.aIRecommendation.upsert({
      where: { bidId },
      create: {
        bidId,
        action,
        confidence: complianceScore / 100,
        explanation: `Auto-generated from compliance score ${complianceScore}. ${results.filter((r) => r.status !== "VERIFIED").length} items pending/failed.`,
      },
      update: {
        action,
        confidence: complianceScore / 100,
        explanation: `Auto-generated from compliance score ${complianceScore}. ${results.filter((r) => r.status !== "VERIFIED").length} items pending/failed.`,
      },
    });

    await logAudit(user.id, "COMPLIANCE_CALCULATE", "Bid", bidId, { score: complianceScore, riskLevel });

    return NextResponse.json({
      complianceScore,
      riskLevel,
      results,
      recommendation: action,
    });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Login required" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ error: "Compliance calculation failed" }, { status: 500 });
  }
}
