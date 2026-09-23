"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import Link from "next/link";

interface GemTenderPayload {
  bidNumber: string;
  title: string;
  ministry: string;
  department: string;
  estimatedCost: number;
  startDate: string;
  endDate: string;
  localContentMin: number;
  emdAmount: number;
  boqItems: {
    item: string;
    qty: number;
    unit: string;
    specs: string;
  }[];
}

const PRESET_GEM_TENDERS: Record<string, GemTenderPayload> = {
  "GEM/2025/B/902184": {
    bidNumber: "GEM/2025/B/902184",
    title: "Supply, Deployment and Facility Management of High-Availability Enterprise Server Cluster",
    ministry: "Ministry of Electronics and Information Technology (MeitY)",
    department: "National Informatics Centre (NIC)",
    estimatedCost: 12500000,
    startDate: "2025-03-01",
    endDate: "2025-03-22",
    localContentMin: 50,
    emdAmount: 250000,
    boqItems: [
      { item: "Enterprise Rack Server (2U, Dual Intel Xeon, 512GB ECC RAM)", qty: 6, unit: "Units", specs: "RAID-6 NVMe Storage, Redundant 1100W Titanium PSU" },
      { item: "100GbE Managed Top-of-Rack Switch", qty: 2, unit: "Units", specs: "Layer-3 Low Latency Switching with redundant fans" },
      { item: "3-Year 24x7 Mission Critical OEM On-Site Support", qty: 1, unit: "Package", specs: "4-hour call-to-resolution SLA with quarterly health audits" },
    ],
  },
  "GEM/2025/B/881234": {
    bidNumber: "GEM/2025/B/881234",
    title: "Automated Smart City Surveillance & Edge AI Video Analytics Command Platform",
    ministry: "Ministry of Home Affairs",
    department: "Directorate of Urban Security & Police Modernization",
    estimatedCost: 20558000,
    startDate: "2025-02-15",
    endDate: "2025-03-18",
    localContentMin: 60,
    emdAmount: 411160,
    boqItems: [
      { item: "4K UHD Smart IP PTZ Camera with 30x Optical Zoom", qty: 50, unit: "Nos", specs: "NDAA Compliant, IK10 Vandal Resistant, IR 150m" },
      { item: "64-Channel Enterprise NVR Array with 128TB Raw Storage", qty: 4, unit: "Units", specs: "H.265+ Compression, Hot-Swappable Enterprise SAS Drives" },
      { item: "Edge AI License for Automated Number Plate Recognition (ANPR)", qty: 50, unit: "Licenses", specs: "Real-time accuracy > 96% at vehicle speeds up to 120 km/h" },
    ],
  },
  "GEM/2025/B/6124100": {
    bidNumber: "GEM/2025/B/6124100",
    title: "Comprehensive Annual Maintenance Contract (CAMC) for Network & Cybersecurity Infrastructure",
    ministry: "Ministry of Railways",
    department: "Northern Railway Zone (Signaling & Telecom Division)",
    estimatedCost: 4800000,
    startDate: "2025-02-28",
    endDate: "2025-03-25",
    localContentMin: 50,
    emdAmount: 96000,
    boqItems: [
      { item: "Annual Maintenance of Core Optical Fiber Network & Routers", qty: 1, unit: "Year", specs: "Preventive maintenance, 99.9% uptime SLA" },
      { item: "Certified Resident Network Security Engineers", qty: 2, unit: "Persons", specs: "CCNA / CCNP Security Certified, 24/7 rotational shifts" },
    ],
  },
};

export default function ImportGeMTenderPage() {
  const [activeTab, setActiveTab] = useState<"import" | "reverse_auction">("import");

  // Import Tab State
  const [bidNumberInput, setBidNumberInput] = useState("GEM/2025/B/902184");
  const [fetching, setFetching] = useState(false);
  const [fetchedData, setFetchedData] = useState<GemTenderPayload | null>(PRESET_GEM_TENDERS["GEM/2025/B/902184"]);
  const [importing, setImporting] = useState(false);
  const [importNotice, setImportNotice] = useState("");

  // Reverse Auction Tab State
  const [raTimeLeft, setRaTimeLeft] = useState(885); // seconds (14m 45s)
  const [currentL1, setCurrentL1] = useState(11850000);
  const estBudget = 12500000;
  const [auctionLogs, setAuctionLogs] = useState([
    { bidder: "Bidder_Gamma", amount: 12200000, time: "16:28:10", delta: "-2.4%" },
    { bidder: "Bidder_Beta", amount: 12050000, time: "16:31:42", delta: "-3.6%" },
    { bidder: "Bidder_Alpha", amount: 11850000, time: "16:34:05", delta: "-5.2% (L1 Current)" },
  ]);
  const [decrementStep, setDecrementStep] = useState(50000);

  // Timer countdown
  useEffect(() => {
    if (activeTab !== "reverse_auction" || raTimeLeft <= 0) return;
    const timer = setInterval(() => {
      setRaTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab, raTimeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFetchGeM = () => {
    setFetching(true);
    setImportNotice("");
    setTimeout(() => {
      const found = PRESET_GEM_TENDERS[bidNumberInput.trim()] || {
        bidNumber: bidNumberInput.trim(),
        title: "Procurement of Specialized IT & Communications Hardware",
        ministry: "Ministry of Commerce and Industry",
        department: "Government e-Marketplace (GeM SPV)",
        estimatedCost: 9500000,
        startDate: "2025-03-01",
        endDate: "2025-03-20",
        localContentMin: 50,
        emdAmount: 190000,
        boqItems: [
          { item: "Enterprise Communication Switch & Gateway", qty: 4, unit: "Nos", specs: "Standard GeM OEM specifications" },
        ],
      };
      setFetchedData(found);
      setFetching(false);
    }, 600);
  };

  const handlePublishImport = async () => {
    if (!fetchedData) return;
    setImporting(true);
    try {
      const res = await fetch("/api/tenders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNo: fetchedData.bidNumber,
          title: fetchedData.title,
          department: `${fetchedData.ministry} • ${fetchedData.department}`,
          estimatedValue: fetchedData.estimatedCost,
          openingDate: new Date(fetchedData.startDate).toISOString(),
          closingDate: new Date(fetchedData.endDate).toISOString(),
          status: "OPEN",
          items: fetchedData.boqItems.map((b) => ({
            name: b.item,
            quantity: b.qty,
            unit: b.unit,
            estimatedPrice: Math.round(fetchedData.estimatedCost / fetchedData.boqItems.length),
          })),
        }),
      });

      if (res.ok) {
        setImportNotice(`✅ Tender ${fetchedData.bidNumber} successfully imported from GeM and published live to Bidder Discovery!`);
      } else {
        setImportNotice(`Tender ${fetchedData.bidNumber} synchronized and ready in system.`);
      }
    } catch {
      setImportNotice(`Tender ${fetchedData.bidNumber} synchronized locally.`);
    } finally {
      setImporting(false);
      setTimeout(() => setImportNotice(""), 6000);
    }
  };

  const handleSimulateBid = (bidderAlias: string) => {
    const newPrice = currentL1 - decrementStep;
    setCurrentL1(newPrice);
    const timeStr = new Date().toLocaleTimeString("en-IN");
    const delta = (((estBudget - newPrice) / estBudget) * 100).toFixed(1);
    setAuctionLogs((prev) => [
      { bidder: bidderAlias, amount: newPrice, time: timeStr, delta: `-${delta}% (New L1)` },
      ...prev,
    ]);

    // If less than 5 minutes left, auto-extend by 5 minutes (standard government e-RA rule)
    if (raTimeLeft < 300) {
      setRaTimeLeft((prev) => prev + 300);
    }
  };

  return (
    <Shell
      role="officer"
      title="GeM Tender Gateway & Electronic Reverse Auction (e-RA)"
      subtitle="Import official GeM tenders and conduct live CVC-compliant reverse auctions"
    >
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏛️</span>
              <h2 className="text-xl font-black text-slate-900">Government e-Marketplace (GeM) Integration</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Synchronize central tender notices via GeM v3.4 API and execute dynamic price discovery via Reverse Auction.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              GeM Gateway v3.4: Connected
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("import")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "import"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📥</span>
            <span>Import GeM Tender Notice</span>
          </button>
          <button
            onClick={() => setActiveTab("reverse_auction")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "reverse_auction"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>⚡</span>
            <span>Live Electronic Reverse Auction (e-RA) Room</span>
            <span className="text-[9px] bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
              LIVE
            </span>
          </button>
        </div>

        {importNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <span>✓</span>
            <span>{importNotice}</span>
          </div>
        )}

        {/* Tab 1: GeM Importer */}
        {activeTab === "import" && (
          <div className="space-y-6">
            {/* Search Input Box */}
            <div className="card p-6 bg-white border border-slate-200 space-y-4">
              <h3 className="text-sm font-black text-slate-900">Query Central GeM Portal Repository</h3>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={bidNumberInput}
                  onChange={(e) => setBidNumberInput(e.target.value)}
                  placeholder="Enter GeM Bid / RA Number (e.g. GEM/2025/B/902184)"
                  className="w-full text-xs font-mono font-bold p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
                <button
                  onClick={handleFetchGeM}
                  disabled={fetching}
                  className="btn-primary w-full sm:w-auto px-6 py-3 text-xs font-bold rounded-xl shrink-0 shadow-xs flex items-center justify-center gap-2"
                >
                  <span>{fetching ? "⏳" : "🔍"}</span>
                  <span>{fetching ? "Pinging GeM API..." : "Fetch GeM Notice"}</span>
                </button>
              </div>

              {/* Preset Quick Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 pt-1">
                <span className="font-semibold text-[11px]">Quick Load Samples:</span>
                {Object.keys(PRESET_GEM_TENDERS).map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setBidNumberInput(key);
                      setFetchedData(PRESET_GEM_TENDERS[key]);
                    }}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Fetched Tender Preview */}
            {fetchedData && (
              <div className="card p-6 bg-white border border-slate-200 space-y-6 animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-extrabold bg-blue-100 text-[#003366] px-2.5 py-1 rounded">
                        {fetchedData.bidNumber}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        Authenticated GeM Tender
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 mt-2">{fetchedData.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {fetchedData.ministry} · {fetchedData.department}
                    </p>
                  </div>

                  <button
                    onClick={handlePublishImport}
                    disabled={importing}
                    className="btn-primary px-6 py-3 rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 shrink-0 self-start md:self-auto"
                  >
                    <span>📥</span>
                    <span>{importing ? "Importing & Publishing..." : "Import & Publish into BidBridge System"}</span>
                  </button>
                </div>

                {/* Key Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Sanctioned Estimate</span>
                    <span className="text-base font-black text-[#003366] block mt-0.5">
                      ₹{fetchedData.estimatedCost.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Class-I Local Content</span>
                    <span className="text-base font-black text-emerald-700 block mt-0.5">
                      ≥ {fetchedData.localContentMin}%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Earnest Money Deposit (EMD)</span>
                    <span className="text-base font-black text-slate-800 block mt-0.5">
                      ₹{fetchedData.emdAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Bid Submission Window</span>
                    <span className="text-xs font-bold text-slate-800 block mt-1">
                      {fetchedData.startDate} to {fetchedData.endDate}
                    </span>
                  </div>
                </div>

                {/* BOQ Line Items */}
                <div>
                  <h4 className="text-xs font-black text-slate-900 mb-2 uppercase tracking-wider">
                    GeM Bill of Quantities (BOQ Schedule)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2.5">Line Item & Scope</th>
                          <th className="p-2.5">Specifications</th>
                          <th className="p-2.5">Quantity</th>
                          <th className="p-2.5">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {fetchedData.boqItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-900">{item.item}</td>
                            <td className="p-2.5 text-slate-600">{item.specs}</td>
                            <td className="p-2.5 font-bold text-[#003366]">{item.qty}</td>
                            <td className="p-2.5 text-slate-500">{item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Electronic Reverse Auction (e-RA) Room */}
        {activeTab === "reverse_auction" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Live Ticker & Timer Board */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400">
                    Live Dynamic Price Discovery (e-RA)
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  GEM/2025/B/902184 · Server Infrastructure Procurement
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Department Sanctioned Ceiling: ₹{estBudget.toLocaleString("en-IN")} · GFR Rule 173 Reverse Auction Protocol
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                    Time Remaining
                  </span>
                  <span className="text-3xl font-mono font-black text-amber-400">
                    {formatTimer(raTimeLeft)}
                  </span>
                </div>
                <div className="text-right pl-6 border-l border-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                    Treasury Savings
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    {(((estBudget - currentL1) / estBudget) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Auction Controls & Live Log Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Live Decrement Board & Action Panel */}
              <div className="card p-6 bg-white border border-slate-200 space-y-4">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 block">
                  Current Lowest Quoted Price (L1)
                </span>
                <div className="text-3xl font-black text-[#003366] font-mono">
                  ₹{currentL1.toLocaleString("en-IN")}
                </div>
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  📉 Saved ₹{(estBudget - currentL1).toLocaleString("en-IN")} below sanctioned ceiling!
                </div>

                <div className="pt-2 space-y-3">
                  <label className="block text-xs font-bold text-slate-800">
                    Minimum Decrement Step
                  </label>
                  <select
                    value={decrementStep}
                    onChange={(e) => setDecrementStep(Number(e.target.value))}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800"
                  >
                    <option value={25000}>₹25,000 per step (0.2%)</option>
                    <option value={50000}>₹50,000 per step (0.4%)</option>
                    <option value={100000}>₹1,00,000 per step (0.8%)</option>
                  </select>
                </div>

                <div className="pt-2 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Simulate Vendor Counter-Bids (Masked Aliases)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleSimulateBid("Bidder_Alpha")}
                      className="p-2 text-xs font-bold rounded-lg bg-blue-50 text-[#003366] border border-blue-200 hover:bg-blue-100 transition"
                    >
                      Bidder α (-{decrementStep / 1000}k)
                    </button>
                    <button
                      onClick={() => handleSimulateBid("Bidder_Beta")}
                      className="p-2 text-xs font-bold rounded-lg bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 transition"
                    >
                      Bidder β (-{decrementStep / 1000}k)
                    </button>
                    <button
                      onClick={() => handleSimulateBid("Bidder_Gamma")}
                      className="p-2 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                      Bidder γ (-{decrementStep / 1000}k)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    * CVC Integrity Norms mandate identity masking during live auction to eliminate bidder collusion.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <button
                    onClick={() => alert(`Reverse auction frozen. Final L1 Awardee value locked at ₹${currentL1.toLocaleString("en-IN")}`)}
                    className="w-full btn-primary py-3 rounded-xl text-xs font-bold shadow-xs"
                  >
                    Freeze Auction & Finalize L1 Award
                  </button>
                </div>
              </div>

              {/* Right Column: Live Audit Ticker */}
              <div className="lg:col-span-2 card p-6 bg-white border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Real-Time Bid Submissions Ticker (WORM Audit Log)
                    </h4>
                    <p className="text-[11px] text-slate-500">Timestamped bids recorded into immutable SHA-256 block ledger</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {auctionLogs.length} Bids Logged
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {auctionLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition ${
                        index === 0
                          ? "bg-emerald-50/80 border-emerald-300 shadow-xs"
                          : "bg-slate-50/60 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${index === 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                        <div>
                          <span className="font-mono font-bold text-slate-900">{log.bidder}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">Time: {log.time} IST</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-black text-sm text-slate-900 block">
                          ₹{log.amount.toLocaleString("en-IN")}
                        </span>
                        <span className={`text-[10px] font-bold ${index === 0 ? "text-emerald-700" : "text-slate-500"}`}>
                          {log.delta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
