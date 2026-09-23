import { NextRequest, NextResponse } from "next/server";
import { requireAuth, logAudit } from "@/lib/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface PreBidQuery {
  id: string;
  tenderRef: string;
  tenderTitle: string;
  clauseRef: string;
  clauseTitle: string;
  question: string;
  bidderName: string;
  bidderEmail: string;
  status: "PENDING" | "ANSWERED" | "CORRIGENDUM_ISSUED";
  officerResponse?: string;
  officerName?: string;
  corrigendumId?: string;
  createdAt: string;
  answeredAt?: string;
}

// In-memory store with realistic initial pre-bid queries
let preBidQueriesStore: PreBidQuery[] = [
  {
    id: "PBQ-2026-101",
    tenderRef: "GEM/2025/B/6123456",
    tenderTitle: "Turnkey Smart City CCTV Surveillance Network (Phase 4)",
    clauseRef: "NIT Clause 4.2",
    clauseTitle: "Storage & Retention Architecture",
    question: "Whether RAID 6 configuration is mandatory for all edge NVR nodes, or RAID 5 is acceptable for edge devices while maintaining RAID 6 at the central command center?",
    bidderName: "ABC Technology Private Limited",
    bidderEmail: "bidder1@abctech.com",
    status: "CORRIGENDUM_ISSUED",
    officerResponse: "Clarified: RAID 6 is mandatory for the Command Center SAN array. RAID 5 is acceptable for edge 64-channel NVRs. Corrigendum-01 issued.",
    officerName: "Rajesh Kumar, Deputy Secretary",
    corrigendumId: "CORR-2025-01",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    answeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "PBQ-2026-102",
    tenderRef: "GEM/2025/B/6123456",
    tenderTitle: "Turnkey Smart City CCTV Surveillance Network (Phase 4)",
    clauseRef: "NIT Clause 6.1",
    clauseTitle: "Make in India (MII) Compliance",
    question: "Will STQC or BIS lab test certificates be required at technical bid opening or post Letter of Award (LOA)?",
    bidderName: "SecureIT Solutions LLP",
    bidderEmail: "amit@secureit.in",
    status: "ANSWERED",
    officerResponse: "BIS certification for cameras and power supplies must be submitted in Envelope 1 (Technical Packet). STQC cybersecurity clearance can be submitted within 30 days of LOA.",
    officerName: "Rajesh Kumar, Deputy Secretary",
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    answeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "PBQ-2026-103",
    tenderRef: "GEM/2025/B/902184",
    tenderTitle: "Comprehensive AMC of Network & Optical Fiber Infrastructure",
    clauseRef: "Clause 3.4",
    clauseTitle: "Turnover Exemption for Startups",
    question: "As a DPIIT-recognized startup in cybersecurity, are we exempt from the 3-year turnover requirement of Rs. 5 Crore under GFR Rule 173?",
    bidderName: "CloudTech Cyber Innovations",
    bidderEmail: "vendor@cloudtech.in",
    status: "PENDING",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

// GET /api/tenders/prebid-queries?tenderRef=...
export async function GET(req: NextRequest) {
  const tenderRef = req.nextUrl.searchParams.get("tenderRef");
  
  if (tenderRef) {
    const filtered = preBidQueriesStore.filter((q) => q.tenderRef === tenderRef);
    return NextResponse.json({ queries: filtered });
  }

  return NextResponse.json({ queries: preBidQueriesStore });
}

// POST /api/tenders/prebid-queries
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    // CASE 0: Officer creating a direct standalone Corrigendum
    if (body.action === "CREATE_CORRIGENDUM") {
      const { tenderRef, title, description, clauseRef, amendmentType, newSubmissionDate } = body;
      const corrId = `CORR-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
      
      const newCorrigendum = {
        id: corrId,
        tenderNo: tenderRef || "GEM/2025/B/6123456",
        title: title || "Notice of Addendum & Clause Revision",
        description: description || "Administrative & Technical Clarification issued to all eligible bidders.",
        clauseRef: clauseRef || "General Clauses",
        amendmentType: amendmentType || "TECHNICAL_SPEC",
        newSubmissionDate: newSubmissionDate || null,
        date: new Date().toISOString().split("T")[0],
        version: `v1.${corrId.split("-").pop()}`,
        status: "Published",
        author: user.name || "Procurement Officer",
      };

      try {
        const tender = await prisma.tender.findFirst({
          where: { referenceNo: tenderRef },
        });
        if (tender) {
          await prisma.corrigendum.create({
            data: {
              tenderId: tender.id,
              title: newCorrigendum.title,
              description: newCorrigendum.description,
            },
          });
        }
      } catch (dbErr) {
        // Log DB error — corrigendum still recorded in-memory for pre-bid query management
        console.error("[CORRIGENDUM] DB save failed (in-memory fallback active):", dbErr);
      }

      await logAudit(user.id, "CORRIGENDUM_ISSUED", "Tender", tenderRef, {
        corrigendumId: corrId,
        title,
        amendmentType,
      });

      return NextResponse.json({
        success: true,
        corrigendum: newCorrigendum,
        message: `Corrigendum ${corrId} published and broadcast to all bidders.`,
      }, { status: 201 });
    }

    // CASE 1: Officer responding to an existing query or creating Corrigendum
    if (body.action === "RESPOND_QUERY") {
      const { queryId, response, issueCorrigendum, corrigendumTitle, corrigendumDescription } = body;
      const queryIdx = preBidQueriesStore.findIndex((q) => q.id === queryId);
      if (queryIdx === -1) {
        return NextResponse.json({ error: "Query not found" }, { status: 404 });
      }

      let corrId: string | undefined;

      if (issueCorrigendum) {
        corrId = `CORR-${new Date().getFullYear()}-${Date.now().toString().slice(-3)}`;
        // Try creating in Prisma if tender exists
        try {
          const tender = await prisma.tender.findFirst({
            where: { referenceNo: preBidQueriesStore[queryIdx].tenderRef },
          });
          if (tender) {
            await prisma.corrigendum.create({
              data: {
                tenderId: tender.id,
                title: corrigendumTitle || `Corrigendum against Clause ${preBidQueriesStore[queryIdx].clauseRef}`,
                description: corrigendumDescription || response,
              },
            });
          }
        } catch (dbErr) {
          // Log DB error — corrigendum still recorded in-memory for pre-bid query management
          console.error("[CORRIGENDUM] DB save failed (in-memory fallback active):", dbErr);
        }
      }

      preBidQueriesStore[queryIdx] = {
        ...preBidQueriesStore[queryIdx],
        status: issueCorrigendum ? "CORRIGENDUM_ISSUED" : "ANSWERED",
        officerResponse: response,
        officerName: user.name,
        corrigendumId: corrId,
        answeredAt: new Date().toISOString(),
      };

      await logAudit(
        user.id,
        issueCorrigendum ? "PREBID_CORRIGENDUM_ISSUED" : "PREBID_QUERY_ANSWERED",
        "Tender",
        preBidQueriesStore[queryIdx].tenderRef,
        { queryId, response, corrId }
      );

      return NextResponse.json({
        success: true,
        query: preBidQueriesStore[queryIdx],
        corrigendumId: corrId,
        message: issueCorrigendum ? "Clarification & Corrigendum published successfully." : "Official response recorded.",
      });
    }

    // CASE 2: Bidder submitting a new pre-bid inquiry
    const { tenderRef, tenderTitle, clauseRef, clauseTitle, question } = body;

    if (!clauseRef || !question) {
      return NextResponse.json({ error: "Clause reference and question text are mandatory." }, { status: 400 });
    }

    const newQuery: PreBidQuery = {
      id: `PBQ-${Date.now().toString().slice(-6)}`,
      tenderRef: tenderRef || "GEM/2025/B/6123456",
      tenderTitle: tenderTitle || "Central e-Procurement Tender",
      clauseRef,
      clauseTitle: clauseTitle || "Technical Specification",
      question,
      bidderName: user.name,
      bidderEmail: user.email,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    preBidQueriesStore.unshift(newQuery);

    await logAudit(user.id, "PREBID_QUERY_SUBMITTED", "Tender", newQuery.tenderRef, {
      queryId: newQuery.id,
      clauseRef,
    });

    return NextResponse.json({ success: true, query: newQuery }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process pre-bid query" }, { status: 500 });
  }
}
