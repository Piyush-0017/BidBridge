"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { DecryptedBidderFinancial, DecryptedBOQItem } from "@/app/api/decisions/financial-opening/route";

export default function FinancialEval() {
  const [ceremony, setCeremony] = useState<any>(null);
  const [bids, setBids] = useState<DecryptedBidderFinancial[]>([]);
  const [budget, setBudget] = useState(25000000);
  const [loading, setLoading] = useState(true);

  // Ceremony signing state
  const [pin1, setPin1] = useState("123456");
  const [pin2, setPin2] = useState("654321");
  const [isSigning1, setIsSigning1] = useState(false);
  const [isSigning2, setIsSigning2] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // BOQ Inspector modal
  const [selectedBidder, setSelectedBidder] = useState<DecryptedBidderFinancial | null>(null);

  function loadCeremonyData() {
    setLoading(true);
    fetch("/api/decisions/financial-opening")
      .then((r) => r.json())
      .then((data) => {
        setCeremony(data.ceremony);
        setBids(data.bids || []);
        if (data.budget) setBudget(data.budget);
      })
      .catch((e) => console.error("Failed to load ceremony", e))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCeremonyData();
  }, []);

  async function handleSignKeyShare(officerIndex: 1 | 2) {
    if (officerIndex === 1) setIsSigning1(true);
    if (officerIndex === 2) setIsSigning2(true);

    try {
      const res = await fetch("/api/decisions/financial-opening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SIGN_KEY_SHARE",
          officerIndex,
          pin: officerIndex === 1 ? pin1 : pin2,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCeremony(data.ceremony);
        setBids(data.bids || []);
        if (data.ceremony.isDecrypted) {
          setToastMsg("🔓 Commercial envelopes decrypted! Key shares reconstituted via dual authorization.");
        } else {
          setToastMsg(`✓ Officer ${officerIndex} key share authenticated and sealed.`);
        }
      } else {
        alert(data.error || "Failed to sign key share");
      }
    } catch {
      alert("Communication failure with Key Escrow Service");
    } finally {
      if (officerIndex === 1) setIsSigning1(false);
      if (officerIndex === 2) setIsSigning2(false);
      setTimeout(() => setToastMsg(null), 5000);
    }
  }

  async function handleResetCeremony() {
    try {
      const res = await fetch("/api/decisions/financial-opening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RESET" }),
      });
      const data = await res.json();
      if (res.ok) {
        setCeremony(data.ceremony);
        setBids([]);
        setToastMsg("🔒 Financial envelopes locked with AES-256.");
        setTimeout(() => setToastMsg(null), 4000);
      }
    } catch {}
  }

  function downloadOpeningSummaryReport() {
    const text = `========================================================================
CENTRAL PUBLIC PROCUREMENT PORTAL (CPPP) - GOVERNMENT OF INDIA
SUMMARY OF COMMERCIAL BID OPENING (FORM CPPP-FIN-01)
IN COMPLIANCE WITH GFR 2017 RULE 173 & SECTION 65B INDIAN EVIDENCE ACT
========================================================================

TENDER REFERENCE NUMBER : ${ceremony?.tenderRef || "GEM/2025/B/6123456"}
TENDER TITLE            : Supply, Installation and Commissioning of Smart IP CCTV Cameras
PROCURING AUTHORITY     : Ministry of Home Affairs • Central Armed Police Forces
ESTIMATED SANCTION      : INR Rs. ${(budget).toLocaleString("en-IN")}
OPENING DATE & TIME     : ${ceremony?.decryptedAt ? new Date(ceremony.decryptedAt).toLocaleString("en-IN") : "16-Aug-2025 15:00 IST"}
DECRYPTION ALGORITHM    : AES-256-GCM + Dual Shamir Threshold Key Reconstitution
SECTION 65B HASH SEAL   : ${ceremony?.decryptionHash || "d3810f92b740aa129031cba6819920b784918204918293aa129384918293aa12"}

------------------------------------------------------------------------
AUTHENTICATING COMMITTEE OFFICERS (DUAL-KEY CEREMONY)
------------------------------------------------------------------------
OFFICER 1 (TIA/CHAIR)   : ${ceremony?.officer1.name} (${ceremony?.officer1.designation})
DSC TOKEN SERIAL        : ${ceremony?.officer1.dscSerial}
ELECTRONIC SIGN TIMESTAMP: ${ceremony?.officer1.timestamp || "16-Aug-2025 15:01:12 IST"}

OFFICER 2 (FINANCE DIR) : ${ceremony?.officer2.name} (${ceremony?.officer2.designation})
DSC TOKEN SERIAL        : ${ceremony?.officer2.dscSerial}
ELECTRONIC SIGN TIMESTAMP: ${ceremony?.officer2.timestamp || "16-Aug-2025 15:02:44 IST"}

------------------------------------------------------------------------
OFFICIAL COMMERCIAL EVALUATION & L1 RANKINGS
------------------------------------------------------------------------
${bids.map((b, idx) => `
RANK ${b.rank}: ${b.bidderName}
GSTIN: ${b.gstin} | PAN: ${b.pan}
TECHNICAL EVALUATION SCORE : ${b.technicalScore}% (PACKET A QUALIFIED)
TOTAL EVALUATED QUOTE      : INR Rs. ${b.totalQuoteLanded.toLocaleString("en-IN")}
VARIANCE / SAVINGS TO GOVT : INR Rs. ${b.savingsVsBudget.toLocaleString("en-IN")} (${b.savingsPercent}% savings vs budget)
`).join("\n")}

------------------------------------------------------------------------
RECOMMENDATION & NEXT STEPS
------------------------------------------------------------------------
1. Lowest evaluated bidder (${bids[0]?.bidderName || "ABC Technology Pvt Ltd"}) is declared the provisional L1 winner.
2. Verified Make in India (Class-I Local Content > 50%) and MSME criteria.
3. Recommended for issuance of formal Letter of Award (LOA) and 3% Performance Bank Guarantee (PBG).

[End of Official Opening Summary]
`;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CPPP_FIN_OPENING_SUMMARY_${(ceremony?.tenderRef || "GEM_2025_B_6123456").replace(/\//g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const isDecrypted = ceremony?.isDecrypted;
  const l1Bid = bids.find((b) => b.rank === "L1") || bids[0];

  return (
    <Shell
      role="officer"
      title="Financial Bid Opening & BOQ Rate Inspection"
      subtitle="Multi-key threshold decryption ceremony, commercial unsealing, and itemized rate analysis"
    >
      <div className="space-y-6">
        {/* Toast */}
        {toastMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span>
              <span>{toastMsg}</span>
            </div>
            <button onClick={() => setToastMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Top Summary Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded border border-slate-200">
                  {ceremony?.tenderRef || "GEM/2025/B/6123456"}
                </span>
                {isDecrypted ? (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span>🔓</span> Commercial Envelopes Unsealed
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-300 flex items-center gap-1">
                    <span>🔒</span> Packet B Sealed with AES-256
                  </span>
                )}
                <span className="gov-badge neutral">Two-Packet System</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Supply, Installation and Commissioning of Smart IP CCTV Cameras & Command Center
              </h2>
              <p className="text-xs text-slate-500">
                Sanctioned Engineering Budget: <strong>₹{(budget / 10000000).toFixed(2)} Cr (₹{budget.toLocaleString("en-IN")})</strong> • Ministry of Home Affairs
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {isDecrypted ? (
                <>
                  <button
                    onClick={downloadOpeningSummaryReport}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>📄</span>
                    <span>Export Form CPPP-FIN-01</span>
                  </button>
                  <Link
                    href="/officer/evaluation/comparative"
                    className="btn-gov-primary text-xs flex items-center gap-1.5 shadow-xs px-4 py-2"
                  >
                    <span>📊</span>
                    <span>Comparative Statement →</span>
                  </Link>
                  <button
                    onClick={handleResetCeremony}
                    title="Re-lock envelopes for demonstration"
                    className="px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition"
                  >
                    🔄
                  </button>
                </>
              ) : (
                <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                  ⚠️ Complete Dual-Key Authentication Below to Unseal
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 1: Dual-Key Multi-Custody Decryption Ceremony */}
        <div className={`p-6 rounded-2xl border shadow-2xs space-y-5 transition ${
          isDecrypted ? "bg-emerald-50/40 border-emerald-200" : "bg-white border-slate-200"
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>🔐</span>
                <span>Cryptographic Multi-Party Threshold Decryption Ceremony</span>
              </h3>
              <p className="text-xs text-slate-500">
                In compliance with CVC Directives & GFR 2017: Commercial packets can only be opened when both designated officers authenticate with their Class-3 DSC USB tokens.
              </p>
            </div>
            {isDecrypted && ceremony?.decryptionHash && (
              <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded truncate max-w-xs">
                Sec 65B Hash: {ceremony.decryptionHash.slice(0, 24)}...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Officer 1 Card */}
            <div className={`p-4 rounded-xl border space-y-3 transition ${
              ceremony?.officer1.signed
                ? "bg-emerald-50/80 border-emerald-300"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <div>
                    <strong className="text-xs text-slate-900 block">{ceremony?.officer1.name}</strong>
                    <span className="text-[10px] text-slate-500 block">{ceremony?.officer1.designation}</span>
                  </div>
                </div>
                {ceremony?.officer1.signed ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-200 text-emerald-900 rounded-full border border-emerald-300">
                    ✓ Key Share Injected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                    Awaiting DSC
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-200/80 font-mono">
                <p>DSC Serial: {ceremony?.officer1.dscSerial}</p>
                {ceremony?.officer1.timestamp && (
                  <p className="text-emerald-800 font-semibold">
                    Signed At: {new Date(ceremony.officer1.timestamp).toLocaleTimeString("en-IN")}
                  </p>
                )}
              </div>

              {!ceremony?.officer1.signed && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="password"
                    value={pin1}
                    onChange={(e) => setPin1(e.target.value)}
                    placeholder="Token PIN"
                    className="w-28 text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#003366]"
                  />
                  <button
                    onClick={() => handleSignKeyShare(1)}
                    disabled={isSigning1}
                    className="btn-gov-primary text-xs font-bold px-3 py-2 flex items-center gap-1.5 flex-1 disabled:opacity-50"
                  >
                    {isSigning1 ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Signing...</span>
                      </>
                    ) : (
                      <>
                        <span>🖋️</span>
                        <span>Sign Key Share 1</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Officer 2 Card */}
            <div className={`p-4 rounded-xl border space-y-3 transition ${
              ceremony?.officer2.signed
                ? "bg-emerald-50/80 border-emerald-300"
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <div>
                    <strong className="text-xs text-slate-900 block">{ceremony?.officer2.name}</strong>
                    <span className="text-[10px] text-slate-500 block">{ceremony?.officer2.designation}</span>
                  </div>
                </div>
                {ceremony?.officer2.signed ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-200 text-emerald-900 rounded-full border border-emerald-300">
                    ✓ Key Share Injected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                    Awaiting DSC
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-600 space-y-0.5 pt-1 border-t border-slate-200/80 font-mono">
                <p>DSC Serial: {ceremony?.officer2.dscSerial}</p>
                {ceremony?.officer2.timestamp && (
                  <p className="text-emerald-800 font-semibold">
                    Signed At: {new Date(ceremony.officer2.timestamp).toLocaleTimeString("en-IN")}
                  </p>
                )}
              </div>

              {!ceremony?.officer2.signed && (
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="password"
                    value={pin2}
                    onChange={(e) => setPin2(e.target.value)}
                    placeholder="Token PIN"
                    className="w-28 text-xs p-2 rounded-lg border border-slate-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-[#003366]"
                  />
                  <button
                    onClick={() => handleSignKeyShare(2)}
                    disabled={isSigning2}
                    className="btn-gov-primary text-xs font-bold px-3 py-2 flex items-center gap-1.5 flex-1 disabled:opacity-50"
                  >
                    {isSigning2 ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Signing...</span>
                      </>
                    ) : (
                      <>
                        <span>🖋️</span>
                        <span>Sign Key Share 2</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Decrypted Commercial Analytics & Fiscal Savings */}
        {isDecrypted && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Lowest Evaluated Bid (L1)</span>
              <div className="mt-2">
                <span className="text-xl font-black text-emerald-700 block">
                  ₹{l1Bid ? (l1Bid.totalQuoteLanded / 100000).toFixed(2) : "0"} L
                </span>
                <span className="text-[11px] text-slate-500 truncate block">
                  {l1Bid?.bidderName.split(" ")[0]} Tech Pvt Ltd
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Total Fiscal Savings</span>
              <div className="mt-2">
                <span className="text-xl font-black text-[#003366] block">
                  ₹{l1Bid ? (l1Bid.savingsVsBudget / 100000).toFixed(2) : "0"} L
                </span>
                <span className="text-[11px] text-emerald-700 font-bold block">
                  {l1Bid?.savingsPercent}% Below Estimate
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Commercial Spread (L1 to L3)</span>
              <div className="mt-2">
                <span className="text-xl font-black text-slate-900 block">
                  ₹36.92 L
                </span>
                <span className="text-[11px] text-slate-400 block">17.9% spread across bids</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Abnormally Low Bids (ALB)</span>
              <div className="mt-2">
                <span className="text-xl font-black text-emerald-700 block">
                  0 Flags
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold block">GFR Rule 144(xi) Passed</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Decrypted Proposals Table */}
        <div className="gov-card overflow-hidden bg-white border border-slate-200 shadow-2xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>📑</span>
                <span>Decrypted Packet B Rate Schedules ({bids.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Sorted by evaluated landed cost under Section 173 GFR 2017.
              </p>
            </div>
          </div>

          {!isDecrypted ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <span className="text-3xl block">🔒</span>
              <p className="font-bold text-slate-800">Commercial Proposals Are Cryptographically Sealed</p>
              <p className="max-w-md mx-auto text-slate-500">
                Both committee officers must authenticate with their Class-3 DSC tokens above to execute the dual-key decryption ceremony and unseal the financial rates.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5 text-center">Rank</th>
                    <th className="p-3.5">Bidder Legal Entity</th>
                    <th className="p-3.5 text-center">Packet A Score</th>
                    <th className="p-3.5 text-right">Evaluated Landed Quote</th>
                    <th className="p-3.5 text-right">Budget Variance</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-right">Itemized Scrutiny</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bids.map((b) => {
                    const isL1 = b.rank === "L1";

                    return (
                      <tr key={b.bidId} className="hover:bg-slate-50 transition">
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              isL1
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : "bg-slate-100 text-slate-700 border border-slate-300"
                            }`}
                          >
                            {isL1 ? "L1 (Lowest)" : b.rank}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <strong className="text-slate-900 block">{b.bidderName}</strong>
                          <span className="text-[11px] text-slate-400 font-mono">
                            GST: {b.gstin} · PAN: {b.pan}
                          </span>
                        </td>

                        <td className="p-3.5 text-center font-bold text-emerald-700">
                          {b.technicalScore}%
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-base text-[#003366]">
                          ₹{b.totalQuoteLanded.toLocaleString("en-IN")}
                        </td>

                        <td className="p-3.5 text-right font-mono">
                          <span className="text-emerald-700 font-bold">
                            -₹{(b.savingsVsBudget / 100000).toFixed(2)} L
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            (-{b.savingsPercent}%)
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <span className={`gov-badge ${isL1 ? "verified" : "neutral"}`}>
                            {isL1 ? "PROVISIONAL L1" : "SUBSTANTIAL"}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedBidder(b)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-[#002244] hover:text-white text-slate-800 font-bold text-[11px] transition shadow-2xs"
                          >
                            Inspect BOQ Rates 🔍
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 4: Decrypted Itemized BOQ Modal */}
        {selectedBidder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span>📊</span> Itemized Bill of Quantities (BOQ) Audit: {selectedBidder.bidderName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Rank: {selectedBidder.rank} · Total Landed Cost: ₹{selectedBidder.totalQuoteLanded.toLocaleString("en-IN")} · GSTIN: {selectedBidder.gstin}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBidder(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Quoted Landed Total</span>
                  <span className="text-base font-black text-[#003366] font-mono mt-0.5 block">
                    ₹{selectedBidder.totalQuoteLanded.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Budget Deviation</span>
                  <span className="text-base font-black text-emerald-700 font-mono mt-0.5 block">
                    -₹{(selectedBidder.savingsVsBudget / 100000).toFixed(2)} Lakhs ({selectedBidder.savingsPercent}%)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Predatory Pricing (ALB)</span>
                  <span className="text-xs font-black text-emerald-700 mt-1 block">
                    ✓ Clean (Compliant with GFR 144)
                  </span>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-center">Qty & Unit</th>
                      <th className="p-3 text-right">Benchmark Rate</th>
                      <th className="p-3 text-right">Quoted Rate</th>
                      <th className="p-3 text-center">Variance</th>
                      <th className="p-3 text-right">Landed Cost (Incl GST)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedBidder.boqBreakdown.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60">
                        <td className="p-3 max-w-xs font-medium text-slate-800">
                          {item.itemDescription}
                        </td>
                        <td className="p-3 text-center font-mono">
                          {item.qty} {item.unit}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500">
                          ₹{item.benchmarkRate.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          ₹{item.quotedRate.toLocaleString("en-IN")}
                        </td>
                        <td className="p-3 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.variancePercent < 0
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {item.variancePercent}%
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-[#003366]">
                          ₹{item.landedAmount.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-mono">
                  All item rates verified with Section 65B electronic audit signature.
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBidder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </Shell>
  );
}
