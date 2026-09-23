"use client";

import { useState } from "react";
import { Shell } from "@/components/Shell";
import {
  ShieldCheck,
  Building2,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  FileText,
  Activity,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";

interface VerificationQueueItem {
  id: string;
  sourceKey: string;
  name: string;
  ministry: string;
  progressPercent: number;
  totalChecked: number;
  verifiedCount: number;
  flaggedCount: number;
  status: "ONLINE" | "SYNCHRONIZING" | "THROTTLED";
  latencyMs: number;
  lastSync: string;
  sampleCheck: {
    target: string;
    identifier: string;
    verdict: string;
    refNo: string;
  };
}

const REGISTRIES_DATA: VerificationQueueItem[] = [
  {
    id: "REG-01",
    sourceKey: "GSTN",
    name: "Goods & Services Tax Network (GSTN)",
    ministry: "Department of Revenue, Ministry of Finance",
    progressPercent: 98,
    totalChecked: 248,
    verifiedCount: 236,
    flaggedCount: 12,
    status: "ONLINE",
    latencyMs: 38,
    lastSync: "Just now",
    sampleCheck: {
      target: "ABC Technology Pvt Ltd",
      identifier: "GSTIN: 27AABCU9603R1ZM",
      verdict: "Active Regular · GSTR-3B Compliant",
      refNo: "GSTN-2026-99214A",
    },
  },
  {
    id: "REG-02",
    sourceKey: "UDYAM",
    name: "Udyam MSME National Portal",
    ministry: "Ministry of Micro, Small and Medium Enterprises",
    progressPercent: 95,
    totalChecked: 182,
    verifiedCount: 174,
    flaggedCount: 8,
    status: "ONLINE",
    latencyMs: 44,
    lastSync: "2 mins ago",
    sampleCheck: {
      target: "ABC Technology Pvt Ltd",
      identifier: "UDYAM-MH-01-0048291",
      verdict: "Small Enterprise · PPP-MSE EMD Exemption Valid",
      refNo: "MSME-REG-88219",
    },
  },
  {
    id: "REG-03",
    sourceKey: "PAN_IT",
    name: "Income Tax Department / NSDL PAN Register",
    ministry: "Central Board of Direct Taxes (CBDT)",
    progressPercent: 88,
    totalChecked: 248,
    verifiedCount: 242,
    flaggedCount: 6,
    status: "ONLINE",
    latencyMs: 52,
    lastSync: "4 mins ago",
    sampleCheck: {
      target: "ABC Technology Pvt Ltd",
      identifier: "PAN: AABCU9603R",
      verdict: "Active & Operative · ITR Filed AY 2025-26",
      refNo: "CBDT-PAN-77124",
    },
  },
  {
    id: "REG-04",
    sourceKey: "MCA21",
    name: "MCA21 Registry of Companies (ROC)",
    ministry: "Ministry of Corporate Affairs",
    progressPercent: 94,
    totalChecked: 210,
    verifiedCount: 202,
    flaggedCount: 8,
    status: "ONLINE",
    latencyMs: 65,
    lastSync: "1 min ago",
    sampleCheck: {
      target: "ABC Technology Private Limited",
      identifier: "CIN: U72200MH2018PTC310928",
      verdict: "Active Company · 2 Directors Valid DIN",
      refNo: "ROC-MUM-44910",
    },
  },
  {
    id: "REG-05",
    sourceKey: "EPFO",
    name: "Employees' Provident Fund Organisation",
    ministry: "Ministry of Labour & Employment",
    progressPercent: 78,
    totalChecked: 195,
    verifiedCount: 170,
    flaggedCount: 25,
    status: "ONLINE",
    latencyMs: 82,
    lastSync: "5 mins ago",
    sampleCheck: {
      target: "ABC Technology Pvt Ltd",
      identifier: "EST-CODE: MHBAN0081291000",
      verdict: "Active Remittance · 142 Subscribed Members",
      refNo: "EPFO-MUM-99120",
    },
  },
  {
    id: "REG-06",
    sourceKey: "ESIC",
    name: "Employees' State Insurance Corporation",
    ministry: "Ministry of Labour & Employment",
    progressPercent: 74,
    totalChecked: 180,
    verifiedCount: 161,
    flaggedCount: 19,
    status: "ONLINE",
    latencyMs: 76,
    lastSync: "7 mins ago",
    sampleCheck: {
      target: "ABC Technology Pvt Ltd",
      identifier: "ESIC-ID: 31000849200001001",
      verdict: "Statutory Healthcare Contribution Valid",
      refNo: "ESIC-2026-3391",
    },
  },
  {
    id: "REG-07",
    sourceKey: "BLACKLIST_DEBARMENT",
    name: "Central Debarment Registry (CPPP / GeM / CVC)",
    ministry: "Department of Expenditure, Ministry of Finance",
    progressPercent: 100,
    totalChecked: 248,
    verifiedCount: 246,
    flaggedCount: 2,
    status: "ONLINE",
    latencyMs: 29,
    lastSync: "Real-time",
    sampleCheck: {
      target: "ABC Technology Pvt Ltd",
      identifier: "Banned Entities Database Scan",
      verdict: "CLEARED · 0% Similarity to Debarred Vendors",
      refNo: "DEBAR-CLEARED-001",
    },
  },
  {
    id: "REG-08",
    sourceKey: "DIGILOCKER",
    name: "DigiLocker National Document Exchange",
    ministry: "MeitY / Digital India Corporation",
    progressPercent: 68,
    totalChecked: 160,
    verifiedCount: 145,
    flaggedCount: 15,
    status: "ONLINE",
    latencyMs: 41,
    lastSync: "8 mins ago",
    sampleCheck: {
      target: "ABC Technology Pvt Ltd",
      identifier: "Issuer: GSTN / MSME Direct XML",
      verdict: "Cryptographically Signed by Issuer Root CA",
      refNo: "DL-SEAL-889104",
    },
  },
  {
    id: "REG-09",
    sourceKey: "BIS_DPIIT",
    name: "Make in India / BIS Standards Portal",
    ministry: "DPIIT, Ministry of Commerce and Industry",
    progressPercent: 86,
    totalChecked: 190,
    verifiedCount: 172,
    flaggedCount: 18,
    status: "ONLINE",
    latencyMs: 58,
    lastSync: "3 mins ago",
    sampleCheck: {
      target: "ABC Technology Pvt Ltd",
      identifier: "Class-I Local Content Formula",
      verdict: "68.5% Domestic Value Addition Certified",
      refNo: "DPIIT-MII-55819",
    },
  },
  {
    id: "REG-10",
    sourceKey: "GEM",
    name: "GeM 4.0 Incident & Vendor Performance",
    ministry: "GeM SPV, Ministry of Commerce and Industry",
    progressPercent: 100,
    totalChecked: 248,
    verifiedCount: 244,
    flaggedCount: 4,
    status: "ONLINE",
    latencyMs: 34,
    lastSync: "Real-time",
    sampleCheck: {
      target: "ABC Technology Pvt Ltd",
      identifier: "GeM Seller ID: GEM-SEL-8819",
      verdict: "0 Strikes · 99.2% Order Fulfillment Score",
      refNo: "GEM-RATING-8810",
    },
  },
];

export default function VerificationCenterPage() {
  const [registries, setRegistries] = useState(REGISTRIES_DATA);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRegistry, setSelectedRegistry] = useState<VerificationQueueItem | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  const handleRefreshAll = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  };

  const filteredRegistries = registries.filter((r) =>
    r.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    r.sourceKey.toLowerCase().includes(filterQuery.toLowerCase()) ||
    r.ministry.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const totalChecks = registries.reduce((sum, r) => sum + r.totalChecked, 0);
  const totalVerified = registries.reduce((sum, r) => sum + r.verifiedCount, 0);
  const totalFlagged = registries.reduce((sum, r) => sum + r.flaggedCount, 0);

  return (
    <Shell
      role="officer"
      title="Central Government Verification Center"
      subtitle="Unified real-time verification hub across 10+ sovereign registries"
    >
      <div className="space-y-6">
        {/* Governance & Transparency Badge */}
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#003366]">
            <ShieldCheck className="w-4 h-4 text-[#0b5cad] shrink-0" />
            <span>
              <strong>Compliance Orchestrator Engine:</strong> Aggregates automated queries across statutory government nodes under GFR 2017.
            </span>
          </div>
          <span className="font-mono font-bold text-[10px] px-2.5 py-1 rounded bg-white border border-blue-200 text-[#003366] shadow-2xs shrink-0">
            DEMO VERIFIED — SIMULATED SOURCE
          </span>
        </div>

        {/* 4 Core Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Total Entities Checked
            </span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">1,248</span>
            <span className="text-[11px] text-slate-500 mt-1 block">Across all active tenders</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Fully Verified
            </span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">1,102</span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">88.3% compliance pass rate</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Under Officer Review
            </span>
            <span className="text-3xl font-black text-amber-600 mt-1 block">96</span>
            <span className="text-[11px] text-amber-700 font-semibold mt-1 block">Requires manual adjudication</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
              Failed / Disqualified
            </span>
            <span className="text-3xl font-black text-rose-600 mt-1 block">50</span>
            <span className="text-[11px] text-rose-700 font-semibold mt-1 block">Statutory omissions / defaults</span>
          </div>
        </div>

        {/* Registry Queues Table Header & Controls */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#003366]" />
                Sovereign Government Registry Connectors (10 Active Nodes)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time queue throughput, latency metrics, and statutory verification integrity.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter registries..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#003366] bg-slate-50 w-44 sm:w-56"
                />
              </div>

              <button
                onClick={handleRefreshAll}
                disabled={refreshing}
                className="btn-primary text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                <span>Sync All</span>
              </button>
            </div>
          </div>

          {/* Registry Connectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            {filteredRegistries.map((reg) => (
              <div
                key={reg.id}
                onClick={() => setSelectedRegistry(reg)}
                className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all cursor-pointer shadow-2xs group space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-[#003366] transition-colors">
                        {reg.name}
                      </span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100/70 text-[#003366]">
                        {reg.sourceKey}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">{reg.ministry}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {reg.latencyMs}ms
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500">Verification Queue Progress</span>
                    <span className="text-slate-900">{reg.progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#003366] to-[#0b5cad] transition-all duration-500"
                      style={{ width: `${reg.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Sample Verification Proof */}
                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-600 truncate max-w-[200px]">
                    {reg.sampleCheck.identifier}
                  </span>
                  <span className="text-emerald-700 font-bold shrink-0">
                    {reg.sampleCheck.verdict.split("·")[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Modal / Drawer when a registry is clicked */}
        {selectedRegistry && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 shadow-2xl space-y-5 animate-scaleUp">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#0b5cad] tracking-widest block">
                    {selectedRegistry.sourceKey} · SOVEREIGN ADAPTER
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedRegistry.name}</h3>
                  <span className="text-xs text-slate-500 block mt-0.5">{selectedRegistry.ministry}</span>
                </div>
                <button
                  onClick={() => setSelectedRegistry(null)}
                  className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#003366] space-y-1">
                <span className="font-bold block">Adapter Execution Notice:</span>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Connector executes via the <code>ComplianceOrchestrator</code> pipeline. If production credentials are not injected, adapter functions in compliant sandbox mode labeled:
                </p>
                <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-white border border-blue-200 inline-block mt-1">
                  DEMO VERIFIED — SIMULATED SOURCE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Checks</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">{selectedRegistry.totalChecked}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Round-Trip Latency</span>
                  <span className="text-sm font-black text-emerald-700 mt-0.5 block">{selectedRegistry.latencyMs} ms (TLS 1.3)</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Query Result</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block truncate">{selectedRegistry.sampleCheck.verdict}</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Reference</span>
                  <span className="text-xs font-mono font-bold text-[#003366] mt-0.5 block">{selectedRegistry.sampleCheck.refNo}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedRegistry(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#003366] text-white text-xs font-bold transition cursor-pointer"
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
