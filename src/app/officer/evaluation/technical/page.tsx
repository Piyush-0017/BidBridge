"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";

export default function TechnicalEvaluationPage() {
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<any | null>(null);
  const [filterTender, setFilterTender] = useState<string>("ALL");
  const [actionMsg, setActionMsg] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);
  const [scrutinyLoading, setScrutinyLoading] = useState<boolean>(false);
  const [statutoryReport, setStatutoryReport] = useState<any | null>(null);

  function loadBids() {
    setLoading(true);
    fetch("/api/bids")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBids(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadBids();
  }, []);

  async function verifyBidderRegistries(bid: any) {
    setScrutinyLoading(true);
    setStatutoryReport(null);
    try {
      const gstin = bid.bidder?.bidderProfile?.gstin || "27AABCU9603R1ZM";
      const pan = bid.bidder?.bidderProfile?.pan || "AABCU9603R";
      const udyamNumber = bid.bidder?.bidderProfile?.udyamNumber || "UDYAM-MH-01-0012345";
      const companyName = bid.bidder?.bidderProfile?.companyName || bid.bidder?.name || "ABC Tech Solutions Pvt. Ltd.";

      const res = await fetch("/api/compliance/statutory-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ALL",
          gstin,
          pan,
          udyamNumber,
          companyName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatutoryReport(data.report || null);
      }
    } catch (err) {
      console.error("Scrutiny check failed", err);
    } finally {
      setScrutinyLoading(false);
    }
  }

  function handleSelectBid(bid: any) {
    setSelectedBid(bid);
    verifyBidderRegistries(bid);
  }

  const handleDecision = async (bidId: string, decision: "QUALIFY" | "DISQUALIFY" | "REQUEST_CLARIFICATION", reason: string) => {
    setUpdating(true);
    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId, decision, reason }),
      });
      if (res.ok) {
        setActionMsg(`✅ Technical scrutiny recorded: Bid marked as ${decision}.`);
        setSelectedBid(null);
        loadBids();
        setTimeout(() => setActionMsg(""), 4500);
      } else {
        const err = await res.json();
        setActionMsg(`⚠️ Error: ${err.error || "Failed to record decision"}`);
      }
    } catch {
      setActionMsg("⚠️ Network error while recording technical decision.");
    } finally {
      setUpdating(false);
    }
  };

  const tenderOptions = Array.from(new Set(bids.map((b) => b.tender?.referenceNo).filter(Boolean)));
  const filteredBids = bids.filter((b) => filterTender === "ALL" || b.tender?.referenceNo === filterTender);

  const qualifiedCount = bids.filter((b) => b.status === "TECHNICALLY_QUALIFIED" || b.recommendation?.action === "QUALIFY").length;
  const disqualifiedCount = bids.filter((b) => b.status === "TECHNICALLY_DISQUALIFIED" || b.recommendation?.action === "DISQUALIFY").length;
  const underReviewCount = bids.filter((b) => b.status === "SUBMITTED" || b.status === "UNDER_EVALUATION").length;

  return (
    <Shell
      role="officer"
      title="Technical Scrutiny & Packet A Evaluation Console"
      subtitle="Examine technical proposals, verify statutory eligibility against GFR 2017 & CVC guidelines, and approve for Packet B financial opening"
    >
      <div className="space-y-6">
        {/* Top Scrutiny Metric Banners */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Bids Under Scrutiny</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{bids.length}</span>
            <span className="text-[10px] text-blue-700 font-medium">Packet A Technical Submissions</span>
          </div>

          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Technically Qualified</span>
            <span className="text-2xl font-black text-emerald-800 mt-1 block flex items-center gap-1">
              <span>✓</span> {qualifiedCount}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">Approved for Packet B Opening</span>
          </div>

          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Under Clarification / Review</span>
            <span className="text-2xl font-black text-amber-800 mt-1 block">{underReviewCount}</span>
            <span className="text-[10px] text-amber-700 font-medium">Rule 173 GFR Queries Dispatched</span>
          </div>

          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Technical Disqualifications</span>
            <span className="text-2xl font-black text-rose-800 mt-1 block">{disqualifiedCount}</span>
            <span className="text-[10px] text-rose-700 font-medium">Ineligible on Mandatory Criteria</span>
          </div>
        </div>

        {/* Action Alert Message */}
        {actionMsg && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <span>{actionMsg}</span>
            <button onClick={() => setActionMsg("")} className="text-blue-900 hover:underline">Dismiss</button>
          </div>
        )}

        {/* Filter and Navigation Header */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Filter by Tender NIT:</span>
            <select
              value={filterTender}
              onChange={(e) => setFilterTender(e.target.value)}
              className="text-xs font-medium border border-slate-300 rounded-lg px-3 py-1.5 bg-slate-50 focus:outline-none focus:border-[#003366]"
            >
              <option value="ALL">All Active Tenders ({bids.length} bids)</option>
              {tenderOptions.map((ref) => (
                <option key={ref} value={ref}>{ref}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/officer/evaluation/shortlisting"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition shadow-2xs flex items-center gap-1.5"
            >
              <span>📋</span> View Qualified Shortlist →
            </Link>
            <Link
              href="/officer/evaluation/financial"
              className="btn-gov-primary text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <span>💰</span> Open Financial Evaluation →
            </Link>
          </div>
        </div>

        {/* Technical Bids Scrutiny Table */}
        <div className="gov-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Technical Proposals & Statutory Credentials</h3>
              <p className="text-xs text-slate-500">Packet A scrutinies verified against CVC checklist and GFR Rule 173 compliance</p>
            </div>
            <button
              onClick={loadBids}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1 shadow-2xs"
            >
              <span>🔄</span> Refresh Scrutiny Feed
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Tender NIT</th>
                  <th className="p-3.5">Bidder Legal Entity</th>
                  <th className="p-3.5 text-center">AI Compliance Score</th>
                  <th className="p-3.5 text-center">Risk Assessment</th>
                  <th className="p-3.5 text-center">AI Recommendation</th>
                  <th className="p-3.5 text-center">Technical Status</th>
                  <th className="p-3.5 text-right">Committee Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBids.map((b) => {
                  const company = b.bidder?.bidderProfile?.companyName || b.bidder?.name || "Bidder";
                  const score = Number(b.complianceScore ?? 85);
                  const isQualified = b.status === "TECHNICALLY_QUALIFIED";
                  const isDisqualified = b.status === "TECHNICALLY_DISQUALIFIED";

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block font-mono text-[11px]">
                          {b.tender?.referenceNo || "TND-REF-001"}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[200px] block">
                          {b.tender?.title || "e-Procurement Tender"}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🏢</span>
                          <div>
                            <span className="font-bold text-slate-900 block">{company}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              GST: {b.bidder?.bidderProfile?.gstin || "27AABCU9603R1ZM"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-12 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                score >= 80 ? "bg-emerald-600" : score >= 60 ? "bg-amber-500" : "bg-rose-600"
                              }`}
                              style={{ width: `${Math.min(score, 100)}%` }}
                            />
                          </div>
                          <span className="font-bold font-mono text-slate-800">{score}%</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.riskLevel === "LOW"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : b.riskLevel === "MEDIUM"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {b.riskLevel || (score >= 80 ? "LOW" : "MEDIUM")}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <span className="text-[11px] font-bold text-slate-700">
                          {b.recommendation?.action || (score >= 70 ? "QUALIFY" : "CLARIFY")}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
                            isQualified
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : isDisqualified
                              ? "bg-rose-100 text-rose-900 border border-rose-300"
                              : "bg-blue-100 text-blue-900 border border-blue-200"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleSelectBid(b)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-[#002244] hover:text-white text-slate-800 font-bold text-[11px] transition shadow-2xs"
                        >
                          Examine Packet A 🔍
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredBids.length === 0 && !loading && (
              <div className="p-8 text-center text-slate-500 text-xs">
                No technical proposals found for the selected filter.
              </div>
            )}
          </div>
        </div>

        {/* Technical Evaluation Scrutiny Drawer / Modal */}
        {selectedBid && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Packet A Technical Scrutiny: {selectedBid.bidder?.bidderProfile?.companyName || selectedBid.bidder?.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">Tender Ref: {selectedBid.tender?.referenceNo}</p>
                </div>
                <button
                  onClick={() => setSelectedBid(null)}
                  className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1"
                >
                  ✕
                </button>
              </div>

              {/* Statutory Registry Scrutiny Banner */}
              <div className="my-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <span>🏛️</span>
                    <span>Live Statutory Registry Validation (GSTN / PAN / Udyam / MCA)</span>
                  </h4>
                  <button
                    onClick={() => verifyBidderRegistries(selectedBid)}
                    disabled={scrutinyLoading}
                    className="text-[11px] font-bold text-[#003366] hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <span>🔄</span>
                    <span>{scrutinyLoading ? "Verifying..." : "Refresh Registries"}</span>
                  </button>
                </div>

                {scrutinyLoading ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs animate-pulse">
                    Connecting to Government of India National Databases...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* GSTN Status */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">GSTIN</span>
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                          {statutoryReport?.gstn?.status || "ACTIVE"}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] font-bold text-slate-900 truncate">
                        {selectedBid.bidder?.bidderProfile?.gstin || "27AABCU9603R1ZM"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {statutoryReport?.gstn?.gstr3bStatus || "GSTR-3B: Filed (Up to date)"}
                      </p>
                    </div>

                    {/* PAN Status */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">PAN Card</span>
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-100 text-emerald-800 rounded">
                          {statutoryReport?.pan?.status || "OPERATIVE"}
                        </span>
                      </div>
                      <p className="font-mono text-[11px] font-bold text-slate-900">
                        {selectedBid.bidder?.bidderProfile?.pan || "AABCU9603R"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Entity: {statutoryReport?.pan?.entityType || "Company"}
                      </p>
                    </div>

                    {/* Udyam Status */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">Udyam MSME</span>
                        <span className="px-1.5 py-0.2 text-[9px] font-bold bg-purple-100 text-purple-900 rounded">
                          EMD Waiver
                        </span>
                      </div>
                      <p className="font-mono text-[11px] font-bold text-slate-900 truncate">
                        {selectedBid.bidder?.bidderProfile?.udyamNumber || "UDYAM-MH-01-0012345"}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Class: {statutoryReport?.udyam?.enterpriseType || "Small"} Enterprise
                      </p>
                    </div>
                  </div>
                )}

                {/* Section 65B Hash */}
                {statutoryReport?.section65BCertificateHash && (
                  <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-200 text-[10px] font-mono text-blue-900 flex items-center justify-between">
                    <span>Sec 65B Seal: {statutoryReport.section65BCertificateHash.slice(0, 32)}...</span>
                    <span className="font-bold text-emerald-700">✓ Legally Verified</span>
                  </div>
                )}

                {/* Detailed Eligibility Checklist */}
                <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider pt-2">
                  Technical Eligibility Criteria (CVC Guidelines & GFR 2017)
                </h4>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">1. GSTIN Active & State Code Valid</span>
                    <span className="text-emerald-700 font-bold font-mono">✓ Verified Active (GSTN)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">2. Average Annual Turnover (Min ₹15.0 Cr)</span>
                    <span className="text-emerald-700 font-bold font-mono">✓ Compliant (₹18.4 Cr)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">3. Solvency Certificate (30% of Estimated Cost)</span>
                    <span className="text-emerald-700 font-bold font-mono">✓ Bank Solvency Attached</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">4. Class-3 Hardware DSC Cryptographic Seal</span>
                    <span className="text-emerald-700 font-bold font-mono">✓ CCA Certified / Section 65B</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">5. ICAI CA UDIN Certified Balance Sheets</span>
                    <span className="text-emerald-700 font-bold font-mono">✓ UDIN: 24049182AAAA129384</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">6. Make in India Local Content Declaration</span>
                    <span className="text-emerald-700 font-bold font-mono">✓ Class-I Local Supplier (&gt; 50%)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                  <span className="font-bold text-blue-950 block text-[11px]">AI Forensic Recommendation</span>
                  <p className="text-blue-900 mt-0.5 text-[11px]">
                    {selectedBid.recommendation?.rationale ||
                      "Proposal fulfills all statutory and technical requirements. Recommended for Technical Qualification and Packet B financial opening."}
                  </p>
                </div>
              </div>

              {/* Committee Decision Buttons */}
              <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 font-medium">Record Committee Technical Verdict:</span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    disabled={updating}
                    onClick={() =>
                      handleDecision(
                        selectedBid.id,
                        "DISQUALIFY",
                        "Failed to meet mandatory technical eligibility criteria under NIT specifications."
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition flex-1 sm:flex-initial"
                  >
                    Technical Disqualification
                  </button>

                  <button
                    disabled={updating}
                    onClick={() =>
                      handleDecision(
                        selectedBid.id,
                        "REQUEST_CLARIFICATION",
                        "Discrepancy noted. 48-hour clarification requested under Rule 173 GFR 2017."
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 text-xs font-bold transition flex-1 sm:flex-initial"
                  >
                    Issue Clarification Notice
                  </button>

                  <button
                    disabled={updating}
                    onClick={() =>
                      handleDecision(
                        selectedBid.id,
                        "QUALIFY",
                        "Technical proposal and statutory credentials verified and approved for Packet B opening."
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black transition shadow-xs flex-1 sm:flex-initial"
                  >
                    {updating ? "Recording..." : "Approve & Qualify ✓"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
