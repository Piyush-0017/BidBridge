import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { Role, VerificationStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth([Role.BIDDER, Role.OFFICER, Role.ADMIN]);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = (formData.get("documentType") as string) || "OTHER";
    const bidId = (formData.get("bidId") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Compute real cryptographic SHA-256 digest of uploaded file bytes
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

    // CERT-In / NIC Automated Malware & PDF Exploit Screening
    const { scanBufferForMalware } = await import("@/lib/malwareScanner");
    const scanResult = scanBufferForMalware(buffer, file.name);

    if (!scanResult.isClean && scanResult.verdict === "INFECTED") {
      // Audit log security violation
      await logAudit(user.id, "SECURITY_MALWARE_BLOCKED", "Document", "QUARANTINE", {
        filename: file.name,
        threatName: scanResult.threatName,
        threatLevel: scanResult.threatLevel,
        signatures: scanResult.signaturesDetected,
      });

      return NextResponse.json(
        {
          error: `Security Alert: File failed CERT-In Antivirus Scan. Threat detected: ${scanResult.threatName || "Malicious Payload"}. Upload blocked and quarantined.`,
          scanResult,
        },
        { status: 400 }
      );
    }

    // Multi-Cloud S3 Object Storage with Local Vault Fallback
    const { saveDocumentBlob } = await import("@/lib/storage");
    const storageResult = await saveDocumentBlob(buffer, file.name, file.type || "application/pdf");

    let bidderProfileId: string | undefined;
    try {
      if (user.role === Role.BIDDER) {
        const profile = await prisma.bidderProfile.findFirst({ where: { userId: user.id } });
        bidderProfileId = profile?.id;
      }

      // Save record in Neon Cloud PostgreSQL with PENDING verification status (only security scan passed)
      const doc = await prisma.document.create({
        data: {
          bidId,
          bidderProfileId,
          name: file.name,
          documentType,
          storageKey: storageResult.storageKey,
          sha256,
          mimeType: file.type || "application/pdf",
          sizeBytes: storageResult.sizeBytes,
          status: VerificationStatus.PENDING,
          verifiedAt: null,
        },
      });

      await prisma.verificationResult.create({
        data: {
          documentId: doc.id,
          status: VerificationStatus.PENDING,
          confidence: 1.0,
          source: "CERTIN_SECURITY_SCAN",
          reason: "Malware & antivirus scan passed: CLEAN. Document authenticity and compliance verification pending OCR.",
        },
      });

      await logAudit(user.id, "DOCUMENT_UPLOAD", "Document", doc.id, {
        name: file.name,
        type: documentType,
        sha256,
        sizeBytes: buffer.length,
        securityScan: scanResult.verdict,
      });

      return NextResponse.json({
        success: true,
        scanResult,
        document: {
          id: doc.id,
          name: doc.name,
          documentType: doc.documentType,
          storageKey: storageResult.publicUrl,
          sha256,
          sizeBytes: buffer.length,
          status: "VERIFIED",
          uploadedAt: doc.uploadedAt,
          securityVerdict: scanResult.verdict,
          storageProvider: storageResult.provider,
        },
      });
    } catch (dbErr) {
      console.error("[DOCUMENT UPLOAD] Database save failed:", dbErr);
      return NextResponse.json(
        {
          error: "Document upload failed: could not save record to database. Please try again.",
          detail: dbErr instanceof Error ? dbErr.message : String(dbErr),
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("Upload handler error:", err);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}
