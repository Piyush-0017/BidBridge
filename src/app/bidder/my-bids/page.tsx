"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { generateLetterOfAward, downloadReport } from "@/lib/reports";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Award, 
  Download, 
  FileEdit, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight
} from "lucide-react";

type Bid = {
  id: string;
  tenderRef: string;
  tenderTitle: string;
  department: string;
  evaluatedValue: number;
  status: "DRAFT" | "SUBMITTED" | "UNDER_EVALUATION" | "QUALIFIED" | "DISQUALIFIED" | "AWARDED";
  complianceScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  submittedAt: string;
  receiptNo: string;
  decisionReason?: string;
  decisionBy?: string;
};

const defaultMyBids: Bid[] = [
  {
    id: "bid-draft-1",
    tenderRef: "GEM/2025/B/6119988",
    tenderTitle: "Supply of High-Definition Night-Vision Thermal Imaging & Perimeter Security Gear",
    department: "Defence Research & Development Organisation (DRDO)",
    evaluatedValue: 87500000,
    status: "DRAFT",
    complianceScore: 88,
    riskLevel: "LOW",
    submittedAt: "2025-08-18T10:15:00.000Z",
    receiptNo: "DRAFT-PKT-00921",
  },
  {
    id: "bid-1",
    tenderRef: "GEM/2025/B/6123456",
    tenderTitle: "Supply, Installation and Commissioning of Smart IP CCTV Cameras & Command Center",
    department: "Ministry of Home Affairs • Central Armed Police Forces",
    evaluatedValue: 20558000,
    status: "SUBMITTED",
    complianceScore: 98,
    riskLevel: "LOW",
    submittedAt: "2025-08-16T14:30:00.000Z",
    receiptNo: "ACK-CPPP-2025-884129",
  },
  {
    id: "bid-2",
    tenderRef: "GEM/2025/B/6124100",
    tenderTitle: "Cloud Hosting, Disaster Recovery & High-Availability Database Cluster Services",
    department: "National Informatics Centre (NIC) • MeitY",
    evaluatedValue: 38500000,
    status: "UNDER_EVALUATION",
    complianceScore: 94,
    riskLevel: "LOW",
    submittedAt: "2025-08-04T11:20:00.000Z",
    receiptNo: "ACK-CPPP-2025-771203",
  },
  {
    id: "bid-3",
    tenderRef: "NIT/RAIL/2025/CCTV-AMC",
    tenderTitle: "Comprehensive Annual Maintenance Contract (CAMC) for Surveillance & Video Analytics",
    department: "Ministry of Railways • Northern Railway Zone",
    evaluatedValue: 4800000,
    status: "AWARDED",
    complianceScore: 96,
    riskLevel: "LOW",
    submittedAt: "2025-07-28T16:45:00.000Z",
    receiptNo: "ACK-CPPP-2025-662914",
    decisionReason: "Ranked L-1 Lowest Substantially Responsive Compliant Bidder. Approved by Tender Committee.",
    decisionBy: "Rajesh Kumar (Deputy Secretary & Committee Chairman)",
  },
];

function MyBidsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusParam = searchParams.get("status");

  const [bids, setBids] = useState<Bid[]>(defaultMyBids);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    if (statusParam === "draft") setFilter("DRAFT");
    else if (statusParam === "submitted") setFilter("SUBMITTED");
    else if (statusParam === "evaluation") setFilter("UNDER_EVALUATION");
    else if (statusParam === "awarded") setFilter("AWARDED");
    else setFilter("ALL");
  }, [statusParam]);

  const handleFilterChange = (f: string) => {
    setFilter(f);
    const params = new URLSearchParams(searchParams.toString());
    if (f === "ALL") {
      params.delete("status");
    } else if (f === "DRAFT") {
      params.set("status", "draft");
    } else if (f === "SUBMITTED") {
      params.set("status", "submitted");
    } else if (f === "UNDER_EVALUATION") {
      params.set("status", "evaluation");
    } else if (f === "AWARDED") {
      params.set("status", "awarded");
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/bidder/my-bids${query}`);
  };

  useEffect(() => {
    fetch("/api/bids?my=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Bid[] = data.map((b: any) => ({
            id: b.id,
            tenderRef: b.tender?.referenceNo || "GEM/2025/B/6123456",
            tenderTitle: b.tender?.title || "Central Government Procurement",
            department: b.tender?.department || "Ministry of Home Affairs",
            evaluatedValue: Number(b.evaluatedValue || b.tender?.estimatedValue || 20558000),
            status: (b.status === "TECHNICALLY_QUALIFIED" ? "QUALIFIED" : b.status === "TECHNICALLY_DISQUALIFIED" ? "DISQUALIFIED" : b.status || "SUBMITTED") as any,
            complianceScore: b.complianceScore || 95,
            riskLevel: (b.riskLevel || "LOW") as any,
            submittedAt: b.submittedAt || b.createdAt || new Date().toISOString(),
            receiptNo: b.receiptNo || `ACK-CPPP-2025-${b.id.slice(0, 6)}`,
            decisionReason: b.decision?.reason,
            decisionBy: b.decision?.officer?.name || "Rajesh Kumar (Deputy Secretary)",
          }));
          // Merge with default draft and awarded bids so tabs always demonstrate full lifecycle
          setBids((prev) => {
            const drafts = defaultMyBids.filter(d => d.status === "DRAFT" || d.status === "AWARDED");
            return [...mapped, ...drafts];
          });
        }
      })
      .catch(() => {});
  }, []);

  function downloadReceipt(bid: Bid) {
    const content = `CENTRAL PUBLIC PROCUREMENT PORTAL (CPPP)
OFFICIAL BID SUBMISSION ACKNOWLEDGEMENT RECEIPT
================================================================
RECEIPT NO: ${bid.receiptNo}
TENDER REF: ${bid.tenderRef}
TENDER TITLE: ${bid.tenderTitle}
BIDDER: ABC Technology Private Limited
GSTIN: 27ABCDE1234F1Z5
EVALUATED AMOUNT: INR Rs. ${bid.evaluatedValue.toLocaleString("en-IN")}
COMPLIANCE SCORE: ${bid.complianceScore}/100 (${bid.riskLevel} Risk)
SUBMISSION TIME: ${new Date(bid.submittedAt).toLocaleString("en-IN")}
STATUS: CLASS-3 CRYPTOGRAPHICALLY SEALED (SECTION 65B EVIDENCE)`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CPPP_Receipt_${bid.receiptNo}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadLOA(bid: Bid) {
    const tender = {
      referenceNo: bid.tenderRef,
      title: bid.tenderTitle,
    };
    const loaText = generateLetterOfAward(tender, {
      id: bid.id,
      evaluatedPrice: bid.evaluatedValue,
      bidder: {
        bidderProfile: {
          companyName: "ABC Technology Private Limited",
          gstin: "27ABCDE1234F1Z5",
        },
      },
    });
    downloadReport(`Letter_of_Award_${bid.tenderRef.replace(/\//g, "_")}.txt`, loaText);
  }

  const filteredBids = bids.filter((b) => {
    if (filter === "ALL") return true;
    if (filter === "AWARDED") return b.status === "AWARDED" || b.status === "QUALIFIED";
    return b.status === filter;
  });

  return (
    <Shell
      role="bidder"
      title="My Bids & Proposal Lifecycle Management"
      subtitle="Monitor status of authored proposals, digital signatures, evaluation stages, and awards"
    >
      <div className="space-y-6">

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div 
            onClick={() => handleFilterChange("DRAFT")}
            className="gov-card p-4 cursor-pointer hover:border-slate-400 transition"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Draft Proposals</span>
            <span className="text-2xl font-black text-slate-800 mt-1 block">
              {bids.filter((b) => b.status === "DRAFT").length}
            </span>
            <span className="text-[10px] text-amber-700 font-medium">In Preparation</span>
          </div>

          <div 
            onClick={() => handleFilterChange("SUBMITTED")}
            className="gov-card p-4 cursor-pointer hover:border-blue-400 transition"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Submitted & Sealed</span>
            <span className="text-2xl font-black text-blue-900 mt-1 block">
              {bids.filter((b) => b.status === "SUBMITTED").length}
            </span>
            <span className="text-[10px] text-blue-700 font-medium">Class-3 DSC Applied</span>
          </div>

          <div 
            onClick={() => handleFilterChange("UNDER_EVALUATION")}
            className="gov-card p-4 cursor-pointer hover:border-indigo-400 transition"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Under Evaluation</span>
            <span className="text-2xl font-black text-indigo-900 mt-1 block">
              {bids.filter((b) => b.status === "UNDER_EVALUATION").length}
            </span>
            <span className="text-[10px] text-indigo-700 font-medium">Committee Scrutiny</span>
          </div>

          <div 
            onClick={() => handleFilterChange("AWARDED")}
            className="gov-card p-4 cursor-pointer hover:border-emerald-400 transition"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Award Status</span>
            <span className="text-2xl font-black text-emerald-800 mt-1 block">
              {bids.filter((b) => b.status === "AWARDED" || b.status === "QUALIFIED").length}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">L-1 / LOA Issued</span>
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            {[
              { id: "ALL", label: `All Proposals (${bids.length})` },
              { id: "DRAFT", label: `Drafts (${bids.filter(b => b.status === "DRAFT").length})` },
              { id: "SUBMITTED", label: `Submitted (${bids.filter(b => b.status === "SUBMITTED").length})` },
              { id: "UNDER_EVALUATION", label: `Under Evaluation (${bids.filter(b => b.status === "UNDER_EVALUATION").length})` },
              { id: "AWARDED", label: `Award Status (${bids.filter(b => b.status === "AWARDED" || b.status === "QUALIFIED").length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleFilterChange(tab.id)}
                className={`px-3.5 py-2 rounded-lg transition cursor-pointer ${
                  filter === tab.id
                    ? "bg-white text-[#003366] font-bold shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link
            href="/bidder/tenders"
            className="btn-gov-primary text-xs flex items-center gap-1.5 self-end sm:self-auto px-4 py-2"
          >
            <span>+</span> Discover New Tenders
          </Link>
        </div>

        {/* Bids List */}
        <div className="space-y-4">
          {filteredBids.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No proposals found under this filter</p>
              <p className="text-xs text-slate-500">Explore active tenders and initiate proposal drafting.</p>
              <button
                onClick={() => handleFilterChange("ALL")}
                className="btn-primary text-xs px-4 py-2 mt-2"
              >
                View All Proposals
              </button>
            </div>
          ) : (
            filteredBids.map((b) => (
              <div
                key={b.id}
                className="gov-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-blue-300 transition"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                      {b.tenderRef}
                    </span>

                    {b.status === "DRAFT" && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Draft In-Progress
                      </span>
                    )}
                    {b.status === "SUBMITTED" && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-200">
                        ✓ Sealed & Vaulted
                      </span>
                    )}
                    {b.status === "UNDER_EVALUATION" && (
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        ⏳ Committee Scrutiny
                      </span>
                    )}
                    {(b.status === "AWARDED" || b.status === "QUALIFIED") && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        🏆 Awarded (L-1)
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400">
                      Ref #{b.receiptNo}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{b.tenderTitle}</h3>
                  <p className="text-xs text-slate-500">{b.department}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400">Evaluated Value: </span>
                      <strong className="text-slate-900 font-mono">
                        ₹ {b.evaluatedValue.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Compliance Score: </span>
                      <strong className="text-emerald-700">{b.complianceScore}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Timestamp: </span>
                      <span>{new Date(b.submittedAt).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>

                  {b.decisionReason && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <Award className="w-4 h-4 text-emerald-700" />
                        <span>Procurement Award Notice:</span>
                      </div>
                      <p className="text-emerald-800">{b.decisionReason}</p>
                      <span className="text-[10px] text-emerald-600 font-medium block">
                        Authorized by: {b.decisionBy}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 self-start md:self-auto">
                  {b.status === "DRAFT" && (
                    <Link
                      href={`/bidder/bid-preparation?ref=${encodeURIComponent(b.tenderRef)}`}
                      className="btn-primary text-xs flex items-center justify-center gap-1.5 px-4 py-2"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Continue Authoring</span>
                    </Link>
                  )}

                  {b.status === "SUBMITTED" && (
                    <>
                      <button
                        onClick={() => downloadReceipt(b)}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Receipt</span>
                      </button>
                      <Link
                        href={`/bidder/submission?ref=${encodeURIComponent(b.tenderRef)}&step=ack`}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition text-center"
                      >
                        Inspect CPPP Seal
                      </Link>
                    </>
                  )}

                  {b.status === "UNDER_EVALUATION" && (
                    <>
                      <Link
                        href={`/bidder/compliance?ref=${encodeURIComponent(b.tenderRef)}`}
                        className="btn-primary text-xs flex items-center justify-center gap-1.5 px-4 py-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Compliance Audit</span>
                      </Link>
                      <button
                        onClick={() => downloadReceipt(b)}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </>
                  )}

                  {(b.status === "AWARDED" || b.status === "QUALIFIED") && (
                    <>
                      <button
                        onClick={() => downloadLOA(b)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Download LOA</span>
                      </button>
                      <button
                        onClick={() => downloadReceipt(b)}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </Shell>
  );
}

export default function MyBidsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Bids Registry...</div>}>
      <MyBidsContent />
    </Suspense>
  );
}
