import { NextRequest, NextResponse } from "next/server";
import { generateStatutoryReport, verifyGSTN, verifyPAN, verifyUdyam, verifyCIN } from "@/lib/statutoryVerification";
import { requireAuth, logAudit } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const { type, gstin, pan, udyamNumber, cin, companyName } = body;

    if (type === "GSTN" && gstin) {
      const result = verifyGSTN(gstin, companyName);
      return NextResponse.json({ success: true, result });
    }

    if (type === "PAN" && pan) {
      const result = verifyPAN(pan, companyName);
      return NextResponse.json({ success: true, result });
    }

    if (type === "UDYAM" && udyamNumber) {
      const result = verifyUdyam(udyamNumber, companyName);
      return NextResponse.json({ success: true, result });
    }

    if (type === "CIN" && cin) {
      const result = verifyCIN(cin, companyName);
      return NextResponse.json({ success: true, result });
    }

    // Comprehensive report
    const report = generateStatutoryReport({
      gstin,
      pan,
      udyamNumber,
      cin,
      companyName,
    });

    await logAudit(
      user.id,
      "STATUTORY_REGISTRY_VERIFICATION",
      "StatutoryCompliance",
      report.verificationId,
      {
        overallStatus: report.overallStatus,
        hash: report.section65BCertificateHash,
      }
    );

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify statutory credentials" }, { status: 500 });
  }
}
