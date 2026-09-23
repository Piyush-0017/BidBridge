import { NextRequest, NextResponse } from "next/server";
import { requireAuth, logAudit } from "@/lib/auth";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dataStore } from "@/lib/dataStore";

export interface ClarificationItem {
  id: string;
  bidId: string;
  tenderRef: string;
  bidderId: string;
  bidderName: string;
  query: string;
  clauseRef: string;
  deadlineHours: number;
  deadlineAt: string;
  status: "PENDING_BIDDER" | "RESOLVED" | "REJECTED";
  officerName: string;
  response?: {
    explanation: string;
    submittedAt: string;
    documentUrl?: string;
    documentName?: string;
  };
  createdAt: string;
}

// In-memory persistent store fallback for instant resilience
let clarificationsStore: ClarificationItem[] = [
  {
    id: "CLR-2025-001",
    bidId: "bid-2",
    tenderRef: "GEM/2025/B/902184",
    bidderId: "bidder-1",
    bidderName: "SecureIT Solutions LLP",
    query: "Discrepancy noted between Trade Name on GST certificate ('SecureIT Cyber Systems') and PAN ('SecureIT Solutions LLP'). Also, submitted OEM MAF validity expires in 45 days. Please upload valid extended MAF and partnership trade name resolution.",
    clauseRef: "NIT Clause 4.3 (Commercial Standing) & Clause 7.1 (OEM Authorization)",
    deadlineHours: 48,
    deadlineAt: new Date(Date.now() + 38 * 60 * 60 * 1000).toISOString(),
    status: "PENDING_BIDDER",
    officerName: "Rajesh Kumar, Deputy Secretary (Procurement)",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "CLR-2025-002",
    bidId: "bid-3",
    tenderRef: "NIT/RAIL/2025/CCTV-AMC",
    bidderId: "bidder-1",
    bidderName: "ABC Technology Private Limited",
    query: "Clarify whether local content percentage includes third-party software licensing or only hardware components.",
    clauseRef: "DPIIT MII Public Procurement Order Clause 5",
    deadlineHours: 72,
    deadlineAt: new Date(Date.now() + 60 * 60 * 60 * 1000).toISOString(),
    status: "RESOLVED",
    officerName: "Dr. S. K. Verma, Director (Finance)",
    response: {
      explanation: "Local content computation is certified by our Statutory Auditor (UDIN: 24049182AAAA129384) covering only hardware fabrication and local software development in Bengaluru R&D facility. All third-party proprietary licenses have been excluded.",
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      documentName: "Auditor_BOM_Local_Content_Breakup.pdf",
    },
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const bidId = searchParams.get("bidId");

    let list = clarificationsStore;
    if (user.role === Role.BIDDER) {
      list = list.filter((c) => c.bidderId === user.id || c.bidderName.includes("ABC") || c.bidderName.includes("SecureIT"));
    }
    if (bidId) {
      list = list.filter((c) => c.bidId === bidId);
    }

    return NextResponse.json(list);
  } catch (err: any) {
    console.error("Clarifications GET error:", err);
    return NextResponse.json(clarificationsStore);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth([Role.OFFICER, Role.ADMIN]);
    const body = await req.json();
    const { bidId, tenderRef, bidderId, bidderName, query, clauseRef, deadlineHours = 48 } = body;

    if (!query || !tenderRef) {
      return NextResponse.json({ error: "Query text and tender reference are required" }, { status: 400 });
    }

    const deadlineAt = new Date(Date.now() + Number(deadlineHours) * 60 * 60 * 1000).toISOString();
    const newClarification: ClarificationItem = {
      id: `CLR-${Date.now()}`,
      bidId: bidId || "bid-1",
      tenderRef,
      bidderId: bidderId || "bidder-1",
      bidderName: bidderName || "Bidder Organization",
      query,
      clauseRef: clauseRef || "Rule 173 GFR 2017",
      deadlineHours: Number(deadlineHours),
      deadlineAt,
      status: "PENDING_BIDDER",
      officerName: user.name || "Rajesh Kumar (Deputy Secretary)",
      createdAt: new Date().toISOString(),
    };

    clarificationsStore.unshift(newClarification);

    // Notify Bidder (PostgreSQL in-app notification, Statutory Email, and TRAI DLT SMS)
    let recipientEmail = "procurement@abctech.in";
    let recipientName = bidderName || "Authorized Signatory";

    if (bidderId) {
      const bidderUser = await prisma.user.findUnique({
        where: { id: bidderId },
        select: { email: true, name: true },
      });
      if (bidderUser) {
        if (bidderUser.email) recipientEmail = bidderUser.email;
        if (bidderUser.name) recipientName = bidderUser.name;
      }
    }

    const { dispatchStatutoryEmail, dispatchStatutorySMS, createUserNotification } = await import("@/lib/notifier");
    if (bidderId) {
      await createUserNotification({
        userId: bidderId,
        title: `⚠️ Action Required: Clarification Notice for ${tenderRef}`,
        message: `Tender Evaluation Committee has requested formal clarification under ${clauseRef}: "${query.slice(0, 90)}...". Deadline: ${deadlineHours} hours.`,
        link: "/bidder/notifications",
      });
    }

    await dispatchStatutoryEmail({
      to: recipientEmail,
      recipientName,
      subject: `[CPPP / GeM] Statutory Clarification Notice: ${tenderRef}`,
      title: `Official Clarification Query under ${clauseRef}`,
      tenderRef,
      bodyHtml: `<p>${query}</p>`,
      userId: bidderId || undefined,
    });
    await dispatchStatutorySMS({
      mobileNumber: "+91-9876543210",
      recipientName,
      tenderRef,
      message: `CPPP-GOV: Clarification requested for Bid Ref ${tenderRef}. Please respond within ${deadlineHours} hrs on portal. -GOVIND`,
    });

    // Audit log
    await logAudit(user.id, "CLARIFICATION_ISSUED", "Bid", bidId || "bid-1", {
      tenderRef,
      clauseRef,
      deadlineHours,
    });

    return NextResponse.json({ success: true, clarification: newClarification });
  } catch (err: any) {
    console.error("Clarifications POST error:", err);
    return NextResponse.json({ error: "Failed to issue clarification" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { id, explanation, documentName, action } = body;

    const item = clarificationsStore.find((c) => c.id === id);
    if (!item) {
      return NextResponse.json({ error: "Clarification notice not found" }, { status: 404 });
    }

    // Bidder submitting reply
    if (explanation) {
      item.response = {
        explanation,
        submittedAt: new Date().toISOString(),
        documentName: documentName || "Clarification_Response_Annexure.pdf",
      };
      item.status = "RESOLVED";

      // Notify Officer
      dataStore.createNotification({
        userId: "officer-1",
        title: `Clarification Submitted: ${item.tenderRef}`,
        message: `${item.bidderName} has submitted response for ${item.clauseRef}. Ready for committee re-evaluation.`,
        link: "/officer/decision?tab=clarifications",
      });

      await logAudit(user.id, "CLARIFICATION_RESPONDED", "Clarification", id, {
        tenderRef: item.tenderRef,
      });

      return NextResponse.json({ success: true, message: "Clarification response successfully logged." });
    }

    // Officer accepting or rejecting
    if (action === "ACCEPT" || action === "REJECT") {
      item.status = action === "ACCEPT" ? "RESOLVED" : "REJECTED";

      await logAudit(user.id, `CLARIFICATION_${action}ED`, "Clarification", id, {
        tenderRef: item.tenderRef,
      });

      return NextResponse.json({ success: true, status: item.status });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (err: any) {
    console.error("Clarifications PATCH error:", err);
    return NextResponse.json({ error: "Failed to update clarification" }, { status: 500 });
  }
}
