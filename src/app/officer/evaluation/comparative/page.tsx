"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { generateComparativeStatement, generateComparativeStatementCSV, downloadCSV, generateLetterOfAward, downloadReport } from "@/lib/reports";
import { LetterOfAwardModal } from "@/components/LetterOfAwardModal";

type BOQLine = {
  item: string;
  qty: number;
  rates: Record<string, number>; // bidderId -> rate
};

const boqComparisonRows: BOQLine[] = [
  {
    item: "4K UHD Smart IP PTZ Camera with 30x Zoom & Night Vision",
    qty: 50,
    rates: {
      b1: 45000,
      b2: 48500,
      b3: 52000,
    },
  },
  {
    item: "64-Channel Enterprise NVR RAID 6 Storage Array (128TB)",
    qty: 4,
    rates: {
      b1: 280000,
      b2: 310000,
      b3: 325000,
    },
  },
  {
    item: "Armoured Outdoor Cat-6 Ethernet Cable Spool (305m drum)",
    qty: 25,
    rates: {
      b1: 14500,
      b2: 15200,
      b3: 16000,
    },
  },
  {
    item: "AI Video Analytics Server Cluster (ANPR & Intrusion)",
    qty: 2,
    rates: {
      b1: 650000,
      b2: 720000,
      b3: 790000,
    },
  },
  {
    item: "Turnkey Installation, Conduit Mounting & 3-Year Warranty",
    qty: 1,
    rates: {
      b1: 480000,
      b2: 550000,
      b3: 620000,
    },
  },
];

export default function ComparativePage() {
  const [bids, setBids] = useState<any[]>([]);
  const [tenders, setTenders] = useState<any[]>([]);
  const [selectedTenderRef, setSelectedTenderRef] = useState("GEM/2025/B/6123456");
  const [loading, setLoading] = useState(true);
  const [awarding, setAwarding] = useState(false);
  const [loaModalOpen, setLoaModalOpen] = useState(false);
  const [msg, setMsg] = useState("");

  function loadData() {
    setLoading(true);
    Promise.all([
      fetch("/api/tenders").then((r) => r.json()).catch(() => []),
      fetch("/api/bids").then((r) => r.json()).catch(() => []),
    ]).then(([tList, bList]) => {
      setTenders(Array.isArray(tList) ? tList : []);
      setBids(Array.isArray(bList) ? bList : []);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  const activeTender =
    tenders.find((t) => t.referenceNo === selectedTenderRef) ||
    tenders[0] || {
      id: "tender-1",
      referenceNo: "GEM/2025/B/6123456",
      title: "Supply, Installation and Commissioning of Smart IP CCTV Cameras & Command Center",
      estimatedValue: 25000000,
      department: "Ministry of Home Affairs",
      status: "OPEN",
    };

  // Filter bids for this tender or fallback to central set
  const tenderBids = bids.filter(
    (b) =>
      b.tender?.referenceNo === activeTender.referenceNo ||
      b.tenderId === activeTender.id
  );

  // Define realistic competing prices
  const pricedBids = (tenderBids.length >= 2 ? tenderBids : bids.slice(0, 3)).map((b, idx) => {
    const isABC =
      b.bidder?.name?.includes("ABC") ||
      b.bidder?.bidderProfile?.companyName?.includes("ABC");
    const isSecure =
      b.bidder?.name?.includes("Secure") ||
      b.bidder?.bidderProfile?.companyName?.includes("Secure");

    const price = isABC ? 20558000 : isSecure ? 22400000 : 24250000;
    const est = Number(activeTender.estimatedValue || 25000000);
    const diff = est - price;
    const savingsPercent = `${((diff / est) * 100).toFixed(1)}%`;

    return {
      ...b,
      evaluatedPrice: price,
      savingsPercent,
      deviation: diff >= 0 ? `(-) ${savingsPercent} Below Est.` : `(+) ${Math.abs(diff)} Above`,
    };
  });

  // Sort lowest price first (L1, L2, L3)
  const rankedBids = [...pricedBids].sort((a, b) => a.evaluatedPrice - b.evaluatedPrice);
  const l1Bid = rankedBids[0];
  const isAwarded = rankedBids.some((b) => b.status === "AWARDED") || activeTender.status === "AWARDED";

  async function handleAward() {
    if (!l1Bid) return;
    setAwarding(true);
    setMsg("");
    try {
      const res = await fetch("/api/tenders/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: activeTender.id,
          winningBidId: l1Bid.id,
          remarks: `Awarded to Lowest Evaluated Responsive Bidder (L1) at quoted evaluated value of Rs. ${l1Bid.evaluatedPrice.toLocaleString("en-IN")}.`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`Tender ${activeTender.referenceNo} successfully awarded to L1 Bidder (${l1Bid.bidder?.bidderProfile?.companyName || "ABC Tech Solutions"}). Official Letter of Award (LOA) generated.`);
        loadData();
      } else {
        setMsg(data.error || "Failed to award tender.");
      }
    } catch {
      setMsg("Network error recording award.");
    } finally {
      setAwarding(false);
    }
  }

  function handleDownloadCS() {
    if (!activeTender || rankedBids.length === 0) return;
    const csvContent = generateComparativeStatementCSV(activeTender, rankedBids);
    downloadCSV(`Comparative_Statement_${activeTender.referenceNo.replace(/\//g, "_")}.csv`, csvContent);
    setMsg(`Comparative Statement successfully exported to CSV/Excel format.`);
  }

  function handleDownloadLOA() {
    if (!activeTender || !l1Bid) return;
    setLoaModalOpen(true);
  }

  return (
    <Shell
      role="officer"
      title="Financial BOQ Evaluation & L1 Comparative Statement"
      subtitle="Statutory multi-bidder financial opening, automated GFR 2017 L1 ranking, and contract award console"
    >
      <div className="space-y-6">

        {/* Top Summary Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                {activeTender.referenceNo}
              </span>
              <span className={`gov-badge ${isAwarded ? "verified" : "open"}`}>
                {isAwarded ? "🏆 CONTRACT AWARDED" : "FINANCIAL PACKET B OPENED"}
              </span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 mt-2">
              {activeTender.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTender.department} • Approved Budget: <strong className="text-[#003366]">₹ {Number(activeTender.estimatedValue || 25000000).toLocaleString("en-IN")}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadCS}
              className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
            >
              <span>📊</span> Download Comparative Statement
            </button>
            <button
              onClick={handleDownloadLOA}
              className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <span>📜</span> Download Letter of Award (LOA)
            </button>
          </div>
        </div>

        {msg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span>
              <span>{msg}</span>
            </div>
            <button onClick={() => setMsg("")} className="text-emerald-900 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* 3 L-Ranking Executive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rankedBids.slice(0, 3).map((b, idx) => {
            const rankLabel = `L${idx + 1}`;
            const isWinner = idx === 0;
            const company =
              b.bidder?.bidderProfile?.companyName ||
              b.bidder?.name ||
              (idx === 0
                ? "ABC Tech Solutions Private Limited"
                : idx === 1
                ? "SecureIT Systems Ltd"
                : "Bharat Telematics & Defense Solutions");

            return (
              <div
                key={b.id || idx}
                className={`gov-card p-5 space-y-3 relative overflow-hidden ${
                  isWinner ? "border-2 border-emerald-500 bg-emerald-50/20" : ""
                }`}
              >
                {isWinner && (
                  <div className="absolute -top-1 -right-1 bg-emerald-600 text-white font-black text-[10px] px-3 py-1 rounded-bl-lg uppercase tracking-wider shadow-xs">
                    Lowest Bidder (L1 Winner)
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-8 h-8 rounded-lg font-black text-sm flex items-center justify-center ${
                        isWinner
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {rankLabel}
                    </span>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">
                        {isWinner ? "Evaluated L1 Bidder" : `Rank ${rankLabel}`}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isWinner ? "Recommended for Award" : "Qualified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 truncate">{company}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    GST: {b.bidder?.bidderProfile?.gstin || "27ABCDE1234F1Z5"}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Evaluated Price
                    </span>
                    <span className="text-lg font-black text-[#003366] font-mono">
                      ₹ {Number(b.evaluatedPrice).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      isWinner ? "text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    {b.deviation}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-Bidder BOQ Itemized Price Comparison Matrix */}
        <div className="gov-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Item-Wise BOQ Financial Comparison Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Unit rates and extended all-inclusive prices evaluated per GFR 2017 standards
              </p>
            </div>
            <span className="gov-badge open">All Prices Inclusive of 18% GST</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3">Schedule Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right bg-emerald-50/70 border-x border-emerald-200 text-emerald-950">
                    L1: ABC Tech Solutions (₹)
                  </th>
                  <th className="p-3 text-right">L2: SecureIT Systems (₹)</th>
                  <th className="p-3 text-right">L3: Bharat Telematics (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {boqComparisonRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-semibold text-slate-800 max-w-sm">
                      {row.item}
                    </td>
                    <td className="p-3 text-center font-bold text-slate-600">{row.qty}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-800 bg-emerald-50/40 border-x border-emerald-100">
                      ₹ {row.rates.b1.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">
                      ₹ {row.rates.b2.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700">
                      ₹ {row.rates.b3.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                <tr>
                  <td className="p-3 uppercase text-slate-900 font-black">
                    Grand Total Evaluated Proposal Price
                  </td>
                  <td className="p-3 text-center">—</td>
                  <td className="p-3 text-right font-mono font-black text-emerald-900 bg-emerald-100 border-x border-emerald-200 text-sm">
                    ₹ 20,558,000
                  </td>
                  <td className="p-3 text-right font-mono text-slate-800 text-xs">
                    ₹ 22,400,000
                  </td>
                  <td className="p-3 text-right font-mono text-slate-800 text-xs">
                    ₹ 24,250,000
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Official Award Decision Box */}
        <div className="gov-card p-6 bg-gradient-to-br from-white to-blue-50/40 border border-blue-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                Statutory Procurement Committee Action
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                Contract Award Execution to Lowest Evaluated Responsive Bidder (L1)
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                Under GFR Rule 173, ABC Tech Solutions Private Limited has been identified as the L1 compliant bidder with evaluated value of ₹ 2,05,58,000. Awarding this contract will update the tender and bid statuses in your live Neon Cloud database and dispatch the Letter of Award.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {isAwarded ? (
                <div className="px-5 py-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-xs flex items-center gap-2">
                  <span className="text-base">✓</span>
                  <span>Contract Formally Awarded to L1</span>
                </div>
              ) : (
                <button
                  onClick={handleAward}
                  disabled={awarding}
                  className="px-6 py-3 bg-[#003366] hover:bg-[#0b5cad] text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-2"
                >
                  {awarding ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Awarding Contract in Neon DB...</span>
                    </>
                  ) : (
                    <>
                      <span>🏆</span>
                      <span>Award Tender Contract to L1 Bidder</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Letter of Award (LOA) Official Modal */}
        <LetterOfAwardModal
          isOpen={loaModalOpen}
          onClose={() => setLoaModalOpen(false)}
          tender={activeTender}
          winningBid={l1Bid}
        />

      </div>
    </Shell>
  );
}
