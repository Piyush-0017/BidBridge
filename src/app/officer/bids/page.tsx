"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";

export default function OfficerBids() {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  function loadBids() {
    setLoading(true);
    fetch("/api/bids")
      .then((r) => r.json())
      .then((data) => {
        setBids(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadBids();
  }, []);

  return (
    <Shell
      role="officer"
      title="Bids Received & Evaluation Queue"
      subtitle="Review electronic proposals, examine automated AI compliance scores, and record statutory qualification decisions"
    >
      <div className="space-y-6">
        
        {/* Top Summary Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Submitted Electronic Proposals ({bids.length})</h2>
            <p className="text-xs text-slate-500">Live feed of sealed bids received across all active tenders</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadBids}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <span>🔄</span> Refresh Bids
            </button>
            <Link
              href="/officer/decision"
              className="btn-gov-primary text-xs flex items-center gap-1.5 shadow-sm"
            >
              <span>📝</span> Decision Console
            </Link>
          </div>
        </div>

        {/* Bids Table Card */}
        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Tender Reference</th>
                  <th className="p-3.5">Bidder Organization</th>
                  <th className="p-3.5">Evaluated Value</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">AI Score</th>
                  <th className="p-3.5 text-center">Risk Level</th>
                  <th className="p-3.5 text-center">AI Recommendation</th>
                  <th className="p-3.5 text-right">Officer Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bids.map((b) => {
                  const companyName =
                    b.bidder?.bidderProfile?.companyName ||
                    b.bidder?.name ||
                    "ABC Tech Solutions Private Limited";
                  const tenderRef = b.tender?.referenceNo || "GEM/2025/B/6123456";
                  const val = b.evaluatedValue || b.tender?.estimatedValue;

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {tenderRef}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-1 max-w-xs truncate">
                          {b.tender?.title || "Central Government e-Procurement"}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <strong className="text-slate-900 block">{companyName}</strong>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {b.bidder?.bidderProfile?.gstin || "GST: 27ABCDE1234F1Z5"}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#003366]">
                        {val ? `₹ ${Number(val).toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            b.status === "TECHNICALLY_QUALIFIED" || b.status === "QUALIFIED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : b.status === "SUBMITTED"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : b.status === "UNDER_EVALUATION"
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                              : "bg-slate-100 text-slate-700 border border-slate-300"
                          }`}
                        >
                          {b.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="font-bold text-emerald-700 text-xs">
                          {b.complianceScore ? `${b.complianceScore}%` : "98%"}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.riskLevel === "LOW" || !b.riskLevel
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {b.riskLevel || "LOW"}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {b.recommendation?.action || "QUALIFY"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/officer/decision?bidId=${b.id}`}
                          className="btn-gov-primary text-[11px] py-1.5 px-3 inline-flex items-center gap-1 shadow-2xs"
                        >
                          <span>Review & Approve</span>
                          <span>→</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && bids.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No bids found in queue. Bids submitted by bidders will appear here automatically.
            </div>
          )}
          {loading && (
            <div className="p-8 text-center text-xs text-slate-400">
              Loading electronic bids from database...
            </div>
          )}
        </div>

      </div>
    </Shell>
  );
}
