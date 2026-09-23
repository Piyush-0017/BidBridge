import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAuth, logAudit } from "@/lib/auth";
import { Role, VerificationStatus } from "@prisma/client";
import { parsePdfBuffer, extractDocumentAI } from "@/lib/documentAI";

/**
 * POST /api/documents/ocr
 * Body: { documentId: string } or { storageKey: string, documentType?: string }
 * Performs Document AI / OCR inspection on the PDF file, extracts statutory data (GSTIN, PAN, Dates, Entity Names),
 * performs algorithmic checksum validation, and updates Neon PostgreSQL.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth([Role.OFFICER, Role.ADMIN, Role.BIDDER]);
    const body = await req.json();
    const { documentId, storageKey } = body;

    if (!documentId && !storageKey) {
      return NextResponse.json({ error: "Missing documentId or storageKey" }, { status: 400 });
    }

    let docRecord: any = null;
    let targetKey = storageKey;
    let targetType = "OTHER";

    if (documentId) {
      try {
        docRecord = await prisma.document.findUnique({
          where: { id: documentId },
          include: {
            bidderProfile: true,
            bid: { include: { bidder: { include: { bidderProfile: true } } } },
          },
        });
        if (docRecord) {
          targetKey = docRecord.storageKey;
          targetType = docRecord.documentType;
        }
      } catch (dbErr) {
        console.warn("Document query note:", dbErr);
      }
    }

    if (!targetKey) {
      return NextResponse.json({ error: "Document storage key could not be resolved" }, { status: 404 });
    }

    // Resolve disk path for public upload
    const cleanRelPath = targetKey.startsWith("/") ? targetKey.slice(1) : targetKey;
    const absPath = path.join(process.cwd(), "public", cleanRelPath);

    if (!fs.existsSync(absPath)) {
      return NextResponse.json({ error: `File not found on server: ${targetKey}` }, { status: 404 });
    }

    // Read PDF file and parse
    const buffer = fs.readFileSync(absPath);
    const { text, numPages, isScanned } = await parsePdfBuffer(buffer);

    // Get profile for cross-validation if available
    const profile = docRecord?.bidderProfile || docRecord?.bid?.bidder?.bidderProfile;
    const ocrData = extractDocumentAI(
      text,
      profile
        ? {
            gstin: profile.gstin || undefined,
            pan: profile.pan || undefined,
            companyName: profile.companyName || undefined,
          }
        : undefined,
      isScanned
    );

    ocrData.pageCount = numPages;

    const newStatus = ocrData.validation.issues.length === 0 ? VerificationStatus.VERIFIED : VerificationStatus.INCONSISTENT;

    // Save OCR extraction results to Neon PostgreSQL
    if (docRecord?.id) {
      try {
        await prisma.verificationResult.upsert({
          where: { documentId: docRecord.id },
          create: {
            documentId: docRecord.id,
            status: newStatus,
            confidence: ocrData.confidenceScore,
            extractedData: ocrData as any,
            source: "DOCUMENT_AI_OCR_V2",
            sourceReference: ocrData.entities.gstin || ocrData.entities.pan || `OCR-${Date.now()}`,
            reason: ocrData.validation.issues.length === 0
              ? `AI Verification Passed with ${Math.round(ocrData.confidenceScore * 100)}% confidence`
              : `Discrepancies flagged: ${ocrData.validation.issues.join("; ")}`,
            verifiedAt: new Date(),
          },
          update: {
            status: newStatus,
            confidence: ocrData.confidenceScore,
            extractedData: ocrData as any,
            source: "DOCUMENT_AI_OCR_V2",
            sourceReference: ocrData.entities.gstin || ocrData.entities.pan || `OCR-${Date.now()}`,
            reason: ocrData.validation.issues.length === 0
              ? `AI Verification Passed with ${Math.round(ocrData.confidenceScore * 100)}% confidence`
              : `Discrepancies flagged: ${ocrData.validation.issues.join("; ")}`,
            verifiedAt: new Date(),
          },
        });

        await prisma.document.update({
          where: { id: docRecord.id },
          data: {
            status: newStatus,
            verifiedAt: new Date(),
          },
        });

        await logAudit(user.id, "DOCUMENT_OCR_ANALYSIS", "Document", docRecord.id, {
          detectedType: ocrData.detectedType,
          confidence: ocrData.confidenceScore,
          gstin: ocrData.entities.gstin,
          pan: ocrData.entities.pan,
          issuesCount: ocrData.validation.issues.length,
        });
      } catch (dbErr) {
        console.warn("Database OCR persistence note:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      documentId: docRecord?.id || documentId,
      status: newStatus,
      ocrData,
    });
  } catch (err: any) {
    console.error("OCR API handler error:", err);
    return NextResponse.json({ error: err.message || "Failed to process OCR" }, { status: 500 });
  }
}
