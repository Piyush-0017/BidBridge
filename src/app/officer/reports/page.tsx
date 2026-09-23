"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shell } from "@/components/Shell";

function ReportsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "tender";
  const [activeTab, setActiveTab] = useState<"tender" | "compliance" | "bidder" | "evaluation">(
    ["tender", "compliance", "bidder", "evaluation"].includes(initialTab) ? initialTab : "tender"
  );
  const [downloading, setDownloading] = useState<string>("");

  const triggerExport = (reportName: string) => {
    setDownloading(reportName);
    setTimeout(() => {
      // Generate a mock downloadable CSV or trigger browser print
      const csvContent =
        "data:text/csv;charset=utf-8,Tender Reference,Bidder Legal Name,Category,Estimated Cost (INR),Quoted Value (INR),Compliance Score,Status\n" +
        "GEM/2025/B/902184,ABC Technology Pvt Ltd,MSME Class-I,12500000,11850000,94%,AWARDED_L1\n" +
        "GEM/2025/B/902184,SecureIT Solutions LLP,General Class-I,12500000,12100000,88%,QUALIFIED_L2\n" +
        "GEM/2025/B/881234,Bharat Telecom Corp,Large Class-II,8500000,8200000,91%,UNDER_EVALUATION\n";

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${reportName.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloading("");
    }, 900);
  };

  return (
    <Shell role="officer" title="Procurement Intelligence & Compliance Reports">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📈</span>
              <h2 className="text-xl font-black text-slate-900">Procurement Intelligence & Vigilance Reports</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Audit-ready statutory reports, CVC Quarterly Vigilance Returns (QVR), and AI compliance telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => triggerExport("CVC_Quarterly_Vigilance_Return")}
              disabled={!!downloading}
              className="btn-primary inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs"
            >
              <span>{downloading ? "⏳" : "📥"}</span>
              <span>{downloading ? "Generating..." : "Export Official CSV"}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 shadow-2xs"
            >
              🖨️ Print Report
            </button>
          </div>
        </div>

        {/* Top KPI Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Procurement Value</span>
              <span className="text-xs p-1.5 rounded-lg bg-blue-100 text-[#003366]">💰</span>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">₹56.40 Cr</p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-bold">
              <span>↑ 18.4%</span>
              <span className="text-slate-400 font-normal">vs previous FY</span>
            </div>
          </div>

          <div className="card p-5 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Treasury Savings Achieved</span>
              <span className="text-xs p-1.5 rounded-lg bg-emerald-100 text-emerald-800">📉</span>
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-2">₹7.82 Cr</p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-bold">
              <span>13.8% below</span>
              <span className="text-slate-400 font-normal">estimated cost</span>
            </div>
          </div>

          <div className="card p-5 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">Average Cycle Time</span>
              <span className="text-xs p-1.5 rounded-lg bg-purple-100 text-purple-800">⏱️</span>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">18.4 Days</p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-bold">
              <span>↓ 62% faster</span>
              <span className="text-slate-400 font-normal">than GeM average</span>
            </div>
          </div>

          <div className="card p-5 bg-white border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-slate-400">AI Pre-Screen Pass Rate</span>
              <span className="text-xs p-1.5 rounded-lg bg-amber-100 text-amber-800">🤖</span>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">87.5%</p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-blue-600 font-bold">
              <span>Zero paper flaws</span>
              <span className="text-slate-400 font-normal">admitted</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("tender")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "tender"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📋</span>
            <span>Tender Lifecycle Reports</span>
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "compliance"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🤖</span>
            <span>AI Compliance & Vigilance</span>
          </button>
          <button
            onClick={() => setActiveTab("bidder")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "bidder"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>👥</span>
            <span>Bidder & MSME Participation</span>
          </button>
          <button
            onClick={() => setActiveTab("evaluation")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "evaluation"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📊</span>
            <span>Evaluation & Price Dispersion</span>
          </button>
        </div>

        {/* Tab 1: Tender Lifecycle */}
        {activeTab === "tender" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Volume Trend */}
              <div className="lg:col-span-2 card p-6 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Procurement Volume & Tenders Published</h3>
                    <p className="text-xs text-slate-400">Monthly breakdown for FY 2024-25</p>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
                    Values in ₹ Lakhs
                  </span>
                </div>

                <div className="h-48 flex items-end gap-4 pt-6 pb-2 px-2 border-b border-slate-200">
                  {[
                    { month: "Oct", val: 320, count: 4 },
                    { month: "Nov", val: 540, count: 7 },
                    { month: "Dec", val: 410, count: 5 },
                    { month: "Jan", val: 780, count: 11 },
                    { month: "Feb", val: 960, count: 14 },
                    { month: "Mar", val: 1240, count: 18 },
                  ].map((bar) => (
                    <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="text-[10px] font-extrabold text-[#003366] opacity-0 group-hover:opacity-100 transition">
                        ₹{bar.val}L ({bar.count})
                      </div>
                      <div
                        style={{ height: `${(bar.val / 1300) * 100}%` }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-[#002244] to-[#0b5cad] group-hover:brightness-110 transition-all shadow-xs"
                      />
                      <span className="text-[11px] font-semibold text-slate-600">{bar.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3">
                  <span>Total Tenders: 59 Published</span>
                  <span>Quarterly Growth: +34%</span>
                </div>
              </div>

              {/* Status Breakdown Donut / List */}
              <div className="card p-6 bg-white border border-slate-200">
                <h3 className="text-sm font-black text-slate-900 mb-1">Tender Pipeline Distribution</h3>
                <p className="text-xs text-slate-400 mb-4">Current stage across all departments</p>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>Active / Published</span>
                      <span className="text-blue-700">18 (30%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: "30%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>Technical & Financial Evaluation</span>
                      <span className="text-amber-700">14 (24%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: "24%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>Contract Awarded / Active LOA</span>
                      <span className="text-emerald-700">23 (39%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: "39%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>Cancelled / Retendered</span>
                      <span className="text-rose-700">4 (7%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: "7%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Compliance & Vigilance */}
        {activeTab === "compliance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pareto Disqualification Causes */}
              <div className="card p-6 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Pre-Emptive AI Disqualification Breakdown</h3>
                    <p className="text-xs text-slate-500">Root causes caught before opening commercial bids</p>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                    42 Irregularities Blocked
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  {[
                    { reason: "Expired GSTIN / Inactive Tax Profile", pct: 36, count: 15 },
                    { reason: "Audited Turnover Below Mandated Threshold", pct: 28, count: 12 },
                    { reason: "Missing / Forged OEM Authorization (MAF)", pct: 19, count: 8 },
                    { reason: "Local Content < 50% for Class-I Requirement", pct: 12, count: 5 },
                    { reason: "Unsigned / Incomplete Integrity Pact", pct: 5, count: 2 },
                  ].map((item) => (
                    <div key={item.reason} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex justify-between text-xs font-bold text-slate-800 mb-1.5">
                        <span>{item.reason}</span>
                        <span className="text-[#003366]">{item.count} bids ({item.pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Security & Hash Tamper Audit */}
              <div className="card p-6 bg-white border border-slate-200 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 mb-1">Cryptographic Ledger Health</h3>
                  <p className="text-xs text-slate-500 mb-4">SHA-256 block-level immutability audit across all bids</p>

                  <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-2 mb-4">
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>● SHA-256 BLOCKCHAIN: INTACT</span>
                      <span>CHAIN HEIGHT: #1,842</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      Previous Root: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Latest Root: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                    </p>
                    <div className="pt-2 text-[10px] text-emerald-300">
                      Zero hash collisions or unauthorized database row mutations detected.
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <span className="text-slate-500 block text-[10px]">Valid DSC Certificates</span>
                      <span className="text-base font-bold text-slate-900">100% (48/48)</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                      <span className="text-slate-500 block text-[10px]">Malware / Trojan Scans</span>
                      <span className="text-base font-bold text-emerald-700">Clean (0 threats)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200">
                  <button
                    onClick={() => triggerExport("Vigilance_Ledger_Integrity_Audit")}
                    className="w-full text-center text-xs font-bold py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800"
                  >
                    Download Cryptographic Hash Ledger (.csv)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Bidder & MSME Participation */}
        {activeTab === "bidder" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">MSME & Make in India Inclusion Telemetry</h3>
                <p className="text-xs text-slate-500 mt-0.5">Statutory compliance with Public Procurement Policy Order 2012</p>
              </div>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                42.8% MSME Participation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Class-I Local Suppliers (&gt;50%)</span>
                <p className="text-xl font-black text-[#003366] mt-1">32 Vendors</p>
                <p className="text-[11px] text-slate-500 mt-1">Eligible for purchase preference under MII Order</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Micro & Small Enterprises (MSE)</span>
                <p className="text-xl font-black text-emerald-700 mt-1">18 Vendors</p>
                <p className="text-[11px] text-slate-500 mt-1">Benefited from tender fee & EMD exemptions</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Women & SC/ST Owned MSEs</span>
                <p className="text-xl font-black text-purple-700 mt-1">6 Vendors</p>
                <p className="text-[11px] text-slate-500 mt-1">12.5% of total MSME procurement allocation</p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 mb-3">Top Performing Bidders by Compliance Reliability</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b">
                    <tr>
                      <th className="p-2.5">Bidder Legal Name</th>
                      <th className="p-2.5">Udyam / GSTIN</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Bids Submitted</th>
                      <th className="p-2.5">Avg Compliance Score</th>
                      <th className="p-2.5">Contracts Awarded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">ABC Technology Pvt Ltd</td>
                      <td className="p-2.5 font-mono text-slate-500">27AAACA9821R1ZX</td>
                      <td className="p-2.5"><span className="bg-blue-100 text-[#003366] font-bold px-1.5 py-0.5 rounded text-[10px]">MSME Medium</span></td>
                      <td className="p-2.5 font-bold">12</td>
                      <td className="p-2.5 text-emerald-700 font-black">95.4%</td>
                      <td className="p-2.5 font-bold text-slate-900">4</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">SecureIT Solutions LLP</td>
                      <td className="p-2.5 font-mono text-slate-500">07AACCS4412Q1Z8</td>
                      <td className="p-2.5"><span className="bg-purple-100 text-purple-900 font-bold px-1.5 py-0.5 rounded text-[10px]">Small Enterprise</span></td>
                      <td className="p-2.5 font-bold">8</td>
                      <td className="p-2.5 text-emerald-700 font-black">91.0%</td>
                      <td className="p-2.5 font-bold text-slate-900">2</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">Bharat Telecom Networks Ltd</td>
                      <td className="p-2.5 font-mono text-slate-500">29AABCB1122D1Z4</td>
                      <td className="p-2.5"><span className="bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]">Large / Non-MSME</span></td>
                      <td className="p-2.5 font-bold">15</td>
                      <td className="p-2.5 text-emerald-700 font-black">89.2%</td>
                      <td className="p-2.5 font-bold text-slate-900">5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Evaluation & Price Dispersion */}
        {activeTab === "evaluation" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Financial Bid Spread & L1 Commercial Dispersion</h3>
                <p className="text-xs text-slate-500 mt-0.5">Comparative price distribution vs Sanctioned Budget</p>
              </div>
              <button
                onClick={() => triggerExport("L1_Commercial_Comparative_Statement")}
                className="btn-primary text-xs font-bold px-3 py-1.5 rounded-lg"
              >
                Export Comparative Statement (CSQ)
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-black text-slate-800 mb-3">Live Sample Tender: GEM/2025/B/902184 (Server Infrastructure)</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Estimated Dept. Cost:</span>
                  <span className="font-mono font-black text-slate-900">₹1,25,00,000</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-700">L1 Bid (ABC Technology):</span>
                  <span className="font-mono font-black text-emerald-700">₹1,18,50,000 (-5.2%)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">L2 Bid (SecureIT Solutions):</span>
                  <span className="font-mono font-semibold text-slate-800">₹1,21,00,000 (-3.2%)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600">L3 Bid (Bharat Telecom):</span>
                  <span className="font-mono font-semibold text-slate-800">₹1,24,20,000 (-0.6%)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading intelligence reports...</div>}>
      <ReportsContent />
    </Suspense>
  );
}
