import { NextRequest, NextResponse } from "next/server";
import { complianceOrchestrator } from "@/lib/integrations/complianceOrchestrator";
import { requireAuth, logAudit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));

    const report = await complianceOrchestrator.evaluateBidder({
      requirementCode: body.requirementCode || "BIDDER_EVAL_ALL",
      companyName: body.companyName || "ABC Technology Private Limited",
      gstin: body.gstin || "27AABCU9603R1ZM",
      pan: body.pan || "AABCU9603R",
      udyam: body.udyam || "UDYAM-MH-01-0048291",
      tenderRef: body.tenderRef || "GEM/2026/B/89104",
      category: body.category || "IT & Networking Solutions",
    });

    await logAudit(
      user.id,
      "COMPLIANCE_ORCHESTRATOR_EVALUATION",
      "BidderCompliance",
      report.bidderId,
      {
        complianceScore: report.overallComplianceScore,
        riskScore: report.riskScore,
        recommendation: report.aiRecommendation,
      }
    );

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("Compliance Orchestrator error:", error);
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Failed to evaluate compliance" }, { status });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const report = await complianceOrchestrator.evaluateBidder({
      requirementCode: searchParams.get("requirementCode") || "BIDDER_EVAL_ALL",
      companyName: searchParams.get("companyName") || "ABC Technology Private Limited",
      gstin: searchParams.get("gstin") || "27AABCU9603R1ZM",
      pan: searchParams.get("pan") || "AABCU9603R",
      udyam: searchParams.get("udyam") || "UDYAM-MH-01-0048291",
      tenderRef: searchParams.get("tenderRef") || "GEM/2026/B/89104",
      category: searchParams.get("category") || "IT & Networking Solutions",
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || "Failed to fetch evaluation" }, { status });
  }
}
