"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";

export default function ShortlistingPage() {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewTab, setViewTab] = useState<"QUALIFIED" | "DISQUALIFIED">("QUALIFIED");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/bids")
      .then((r) => r.json())
      .then((d) => {
        setBids(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const qualifiedBids = bids.filter(
    (b) => b.status === "TECHNICALLY_QUALIFIED" || b.recommendation?.action === "QUALIFY"
  );
  const disqualifiedBids = bids.filter(
    (b) => b.status === "TECHNICALLY_DISQUALIFIED" || b.recommendation?.action === "DISQUALIFY"
  );

  const displayedBids = viewTab === "QUALIFIED" ? qualifiedBids : disqualifiedBids;

  const exportSummary = () => {
    setExporting(true);
    setTimeout(() => {
      const rows = [
        ["Tender NIT", "Bidder Name", "Compliance Score", "Risk Level", "Packet B Status", "GFR Rule Justification"],
        ...qualifiedBids.map((b) => [
          b.tender?.referenceNo || "TND-REF",
          b.bidder?.bidderProfile?.companyName || b.bidder?.name || "Bidder",
          `${b.complianceScore ?? 85}%`,
          b.riskLevel || "LOW",
          "APPROVED_FOR_OPENING",
          "Satisfies all technical eligibility under GFR Rule 173",
        ]),
      ];
      const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
      const encoded = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encoded);
      link.setAttribute("download", `Technically_Qualified_Shortlist_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExporting(false);
    }, 700);
  };

  return (
    <Shell
      role="officer"
      title="Technical Shortlisting & Packet B Opening Clearance"
      subtitle="Final list of technically responsive bidders approved by the Committee for commercial financial envelope opening"
    >
      <div className="space-y-6">
        {/* Top Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Eligible for Packet B Opening</span>
            <span className="text-2xl font-black text-emerald-800 mt-1 block flex items-center gap-1.5">
              <span>✓</span> {qualifiedBids.length} Bidders
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">Technically Responsive under GFR 173</span>
          </div>

          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Technically Ineligible / Rejected</span>
            <span className="text-2xl font-black text-rose-800 mt-1 block">
              {disqualifiedBids.length} Bidders
            </span>
            <span className="text-[10px] text-rose-700 font-medium">Recorded with statutory reasons</span>
          </div>

          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Committee Scrutiny Status</span>
            <span className="text-2xl font-black text-purple-900 mt-1 block">Completed</span>
            <span className="text-[10px] text-purple-700 font-medium">Ready for Comparative Statement</span>
          </div>
        </div>

        {/* Action Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewTab("QUALIFIED")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewTab === "QUALIFIED"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>✓</span> Qualified Shortlist ({qualifiedBids.length})
            </button>
            <button
              onClick={() => setViewTab("DISQUALIFIED")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                viewTab === "DISQUALIFIED"
                  ? "bg-rose-700 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>✕</span> Disqualified ({disqualifiedBids.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportSummary}
              disabled={exporting}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
            >
              <span>{exporting ? "⏳" : "📥"}</span>
              <span>{exporting ? "Exporting..." : "Export Shortlist CSV"}</span>
            </button>

            <Link
              href="/officer/evaluation/financial"
              className="btn-gov-primary text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <span>💰</span> Open Financial Bids →
            </Link>
          </div>
        </div>

        {/* Shortlist Table */}
        <div className="gov-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {viewTab === "QUALIFIED" ? "Technically Qualified Bidders (Packet A Passed)" : "Technically Non-Responsive Submissions"}
              </h3>
              <p className="text-xs text-slate-500">
                {viewTab === "QUALIFIED"
                  ? "Bidders meeting all turnover, past experience, and statutory credentials required by NIT."
                  : "Proposals rejected due to statutory deficiencies or failure to meet minimum qualifying criteria."}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Tender Reference</th>
                  <th className="p-3.5">Bidder Legal Name</th>
                  <th className="p-3.5 text-center">AI Compliance Score</th>
                  <th className="p-3.5 text-center">Risk Assessment</th>
                  <th className="p-3.5 text-center">Envelope Status</th>
                  <th className="p-3.5 text-right">Committee Disposition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedBids.map((b) => {
                  const company = b.bidder?.bidderProfile?.companyName || b.bidder?.name || "Bidder";
                  const score = Number(b.complianceScore ?? 85);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 font-mono text-[11px] block">
                          {b.tender?.referenceNo || "TND-REF-001"}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[180px] block">
                          {b.tender?.title || "e-Procurement Tender"}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{company}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          GST: {b.bidder?.bidderProfile?.gstin || "27AABCU9603R1ZM"}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-mono font-bold">
                        <span className={score >= 80 ? "text-emerald-700" : "text-amber-700"}>
                          {score}%
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.riskLevel === "LOW"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {b.riskLevel || "LOW"}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            viewTab === "QUALIFIED"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-rose-100 text-rose-900 border border-rose-300"
                          }`}
                        >
                          {viewTab === "QUALIFIED" ? "PACKET_B_UNLOCKED" : "REJECTED"}
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-medium text-slate-600">
                        {viewTab === "QUALIFIED" ? (
                          <span className="text-emerald-700 font-bold text-[11px]">Approved for Financial Evaluation ✓</span>
                        ) : (
                          <span className="text-rose-700 font-bold text-[11px]">Disqualified under GFR 173 ✕</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {displayedBids.length === 0 && !loading && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No bids found in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
