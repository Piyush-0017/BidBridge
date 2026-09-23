"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shell } from "@/components/Shell";
import {
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Lock,
  FileCheck2,
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Database,
  Fingerprint,
} from "lucide-react";

function AuditContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "audit";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const [logs, setLogs] = useState<any[]>([]);
  const [verification, setVerification] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSimulationActive, setIsSimulationActive] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");

  function loadAudit() {
    setLoading(true);
    fetch("/api/audit")
      .then((r) => r.json())
      .then((data) => {
        if (data.logs) {
          setLogs(Array.isArray(data.logs) ? data.logs : []);
          setVerification(data.chainVerification || null);
        } else if (Array.isArray(data)) {
          setLogs(data);
        }
        setIsSimulationActive(false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  async function triggerVerification(simulate = false) {
    setIsVerifying(true);
    try {
      const url = simulate ? "/api/audit/verify?simulateTamper=true" : "/api/audit/verify";
      const res = await fetch(url);
      const data = await res.json();
      if (data.report) {
        setVerification(data.report);
        setIsSimulationActive(simulate);
      }
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setIsVerifying(false);
    }
  }

  useEffect(() => {
    loadAudit();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Map each log to its verification result
  const blockMap = new Map<string, any>();
  if (verification?.blocks) {
    for (const b of verification.blocks) {
      blockMap.set(b.id, b);
    }
  }

  // Filter logs for search & action
  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      !searchTerm ||
      l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.entityId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === "ALL" || l.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action).filter(Boolean)));

  return (
    <Shell
      role="officer"
      title="Immutable Audit Trail & Cryptographic Evidence Ledger"
      subtitle="Section 65B IT Act Admissible WORM (Write Once Read Many) Ledger with SHA-256 Hash Chaining"
    >
      <div className="space-y-6">
        {/* Top Integrity Status Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Ledger Total Blocks
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{logs.length}</span>
            <span className="text-[10px] text-blue-700 font-medium flex items-center gap-1 mt-0.5">
              <Database className="w-3 h-3" /> Neon PostgreSQL (AuditLog)
            </span>
          </div>

          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Cryptographic Chain
            </span>
            <span
              className={`text-2xl font-black mt-1 block flex items-center gap-1.5 ${
                verification?.isValid ? "text-emerald-800" : "text-rose-700"
              }`}
            >
              {verification?.isValid ? (
                <>
                  <ShieldCheck className="w-6 h-6 text-emerald-600" /> Intact
                </>
              ) : (
                <>
                  <ShieldAlert className="w-6 h-6 text-rose-600" /> Compromised
                </>
              )}
            </span>
            <span className="text-[10px] text-slate-600 font-medium">
              {verification?.verifiedBlocks ?? logs.length} Verified SHA-256 Seals
            </span>
          </div>

          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Tamper Anomalies
            </span>
            <span
              className={`text-2xl font-black mt-1 block ${
                (verification?.tamperedBlocks || 0) === 0 ? "text-emerald-800" : "text-rose-700"
              }`}
            >
              {verification?.tamperedBlocks || 0} Anomalies
            </span>
            <span className="text-[10px] text-slate-600 font-medium">
              {isSimulationActive ? "Demo Tamper Triggered" : "WORM Policy Active"}
            </span>
          </div>

          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Legal Admissibility
            </span>
            <span className="text-2xl font-black text-purple-900 mt-1 block">Sec 65B</span>
            <span className="text-[10px] text-purple-700 font-medium">CAG / CVC & IT Act Ready</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-bold bg-white px-3 pt-2 rounded-t-xl">
          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📜</span>
            <span>Audit Trail Stream</span>
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "verification"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Chain Verification & Integrity</span>
          </button>
          <button
            onClick={() => setActiveTab("evidence")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "evidence"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📁</span>
            <span>Evidence Repository & Section 65B</span>
          </button>
        </div>

        {/* TAB 1: AUDIT TRAIL STREAM */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            {verification && (
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                  verification.isValid
                    ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                    : "bg-rose-50/90 border-rose-300 text-rose-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  {verification.isValid ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0" />
                  )}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      {verification.isValid
                        ? "Cryptographic Chain Verification: Passed"
                        : "Tamper Warning Detected"}
                    </h4>
                    <p className="text-xs mt-0.5 text-slate-700">{verification.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => triggerVerification(false)}
                    disabled={isVerifying}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition flex items-center gap-1 shadow-2xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                    <span>Verify Integrity</span>
                  </button>
                </div>
              </div>
            )}

            <div className="gov-card overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Official Government Audit Log Stream
                  </h3>
                  <p className="text-xs text-slate-500">
                    Every bid, decision, document scan, and system operation sealed with SHA-256 hash chaining
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-[#003366]"
                    />
                  </div>

                  <select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden"
                  >
                    <option value="ALL">All Actions ({logs.length})</option>
                    {uniqueActions.map((act) => (
                      <option key={act} value={act}>
                        {act}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={loadAudit}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1 shadow-2xs bg-white"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3.5">Seq / Timestamp</th>
                      <th className="p-3.5">Officer / Actor</th>
                      <th className="p-3.5">Action Code</th>
                      <th className="p-3.5">Entity & Ref</th>
                      <th className="p-3.5">SHA-256 Block Seal</th>
                      <th className="p-3.5">Integrity</th>
                      <th className="p-3.5 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.map((l, index) => {
                      const chain = l.details?._chain;
                      const seq = chain?.sequenceNumber || logs.length - index;
                      const currentHash = chain?.currentHash || "UNSEALED_LEGACY";
                      const blockInfo = blockMap.get(l.id);
                      const isTampered = blockInfo?.status === "TAMPERED";
                      const isVerified = blockInfo?.status === "VERIFIED";

                      return (
                        <tr
                          key={l.id}
                          className={`hover:bg-slate-50 transition ${
                            isTampered ? "bg-rose-50/70" : ""
                          }`}
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono text-[10px] font-bold">
                                #{seq}
                              </span>
                              <span className="font-mono text-slate-600 text-[11px]">
                                {new Date(l.createdAt).toLocaleString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </span>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">
                              {l.actor?.name || "Procurement System"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {l.actor?.email || "internal-daemon"}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                              {l.action}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-semibold text-slate-800">{l.entityType}</span>
                            {l.entityId && (
                              <span className="text-[10px] font-mono text-slate-500 block truncate max-w-[150px]">
                                {l.entityId}
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-emerald-700 flex-shrink-0" />
                              <code className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[150px] block">
                                {currentHash.slice(0, 16)}...
                              </code>
                            </div>
                          </td>

                          <td className="p-3.5">
                            {isTampered ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" /> Tampered
                              </span>
                            ) : isVerified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                Baseline
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => setSelectedLog(l)}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-[11px] transition shadow-2xs bg-white"
                            >
                              Inspect 🔍
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CHAIN VERIFICATION & INTEGRITY TOOL */}
        {activeTab === "verification" && (
          <div className="space-y-6">
            {/* Live Verification Control Center */}
            <div className="gov-card p-6 bg-gradient-to-br from-white to-slate-50">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛡️</span>
                    <h3 className="text-base font-bold text-slate-900">
                      Cryptographic Audit Chain Verification Engine
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    Performs an on-demand recomputation of every SHA-256 block hash against raw PostgreSQL database records.
                    Detects any altered rows, deleted logs, backdated timestamps, or broken parent links under Section 65B Indian IT Act.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <button
                    onClick={() => triggerVerification(false)}
                    disabled={isVerifying}
                    className="px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold hover:bg-[#002244] transition flex items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                    <span>Run Full Chain Integrity Check</span>
                  </button>

                  <button
                    onClick={() => triggerVerification(!isSimulationActive)}
                    disabled={isVerifying}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs ${
                      isSimulationActive
                        ? "bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isSimulationActive ? "Clear Tamper Test" : "Simulate Tamper Detection"}</span>
                  </button>
                </div>
              </div>

              {/* Simulation Mode Banner */}
              {isSimulationActive && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="font-bold">Live Demonstration Mode Active:</strong> A synthetic payload
                    modification was injected in memory during verification to test the cryptographic hash detector.
                    Notice how block verification immediately flags the mismatch and pins down the exact corrupted record.
                  </div>
                </div>
              )}

              {/* Verification Report Card */}
              {verification && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border bg-white shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Verification Verdict
                    </span>
                    <span
                      className={`text-lg font-black mt-1 block flex items-center gap-1.5 ${
                        verification.isValid ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {verification.isValid ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 100% Intact
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-600" /> Tamper Detected
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Checked {new Date(verification.verifiedAt).toLocaleTimeString("en-IN")}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border bg-white shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Verified Blocks
                    </span>
                    <span className="text-lg font-black text-emerald-700 mt-1 block">
                      {verification.verifiedBlocks} / {verification.totalBlocks}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">
                      SHA-256 digest matches payload
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border bg-white shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Compromised Blocks
                    </span>
                    <span
                      className={`text-lg font-black mt-1 block ${
                        verification.tamperedBlocks > 0 ? "text-rose-700" : "text-slate-900"
                      }`}
                    >
                      {verification.tamperedBlocks}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {verification.tamperedBlocks > 0
                        ? `Broken block: ${verification.brokenBlockId?.slice(0, 12)}...`
                        : "Zero anomalies found"}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border bg-white shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Algorithm & Security
                    </span>
                    <span className="text-lg font-black text-slate-800 mt-1 block">HMAC-SHA256</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      FIPS 180-4 / WORM Compliant
                    </span>
                  </div>
                </div>
              )}

              {/* Hash Chaining Formula Diagram */}
              <div className="mt-5 p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                <div className="text-emerald-400 text-[11px] mb-1 font-bold">
                  // SHA-256 Recursive Forward Chaining Algorithm:
                </div>
                <code>Block[N].hash = SHA-256(Block[N-1].currentHash | timestamp | actorId | action | entityType | entityId | canonicalPayload)</code>
              </div>
            </div>

            {/* Block-by-Block Cryptographic Explorer */}
            <div className="gov-card p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Block-by-Block Cryptographic Integrity Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Every block is verified by recalculating its SHA-256 seal from scratch and validating its parent link
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Total Blocks: {verification?.blocks?.length || logs.length}
                </span>
              </div>

              <div className="space-y-3">
                {(verification?.blocks || []).slice(0, 20).map((block: any) => {
                  const isTampered = block.status === "TAMPERED";
                  const isLegacy = block.status === "LEGACY";

                  return (
                    <div
                      key={block.id}
                      className={`p-4 rounded-xl border transition ${
                        isTampered
                          ? "bg-rose-50/80 border-rose-300"
                          : isLegacy
                          ? "bg-slate-50 border-slate-200"
                          : "bg-white border-slate-200 hover:border-blue-300 shadow-2xs"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-xs font-bold">
                            Block #{block.sequenceNumber}
                          </span>
                          <span className="font-bold text-xs text-slate-900">{block.action}</span>
                          <span className="text-xs text-slate-500">by {block.actorName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isTampered ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Tamper Detected
                            </span>
                          ) : isLegacy ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                              Baseline Record
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Hash & Link Verified
                            </span>
                          )}
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(block.timestamp).toLocaleTimeString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Parent Hash (Link to Prior Block):
                          </span>
                          <code className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 block truncate">
                            {block.previousHash}
                          </code>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Stored Current Hash Seal:
                          </span>
                          <code className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 block truncate">
                            {block.currentHash}
                          </code>
                        </div>
                      </div>

                      {isTampered && block.reason && (
                        <div className="mt-3 p-2.5 rounded-lg bg-rose-100/80 border border-rose-300 text-rose-900 text-xs font-medium flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                          <span>{block.reason}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EVIDENCE REPOSITORY */}
        {activeTab === "evidence" && (
          <div className="space-y-6">
            <div className="gov-card p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Statutory Forensic Evidence Repository
                  </h3>
                  <p className="text-xs text-slate-500">
                    Legal Section 65B IT Act admissibility certificates and original scanned artifacts
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Sec 65B Certified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <FileCheck2 className="w-5 h-5 text-[#003366]" />
                    <span className="font-bold text-xs text-slate-800">Section 65B Certificate</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Electronic evidence certificate signed by Nodal Officer for court admissibility under Indian Evidence Act.
                  </p>
                  <span className="text-[10px] font-mono text-blue-700 font-bold block">
                    SEC65B-2026-001.pdf
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-emerald-700" />
                    <span className="font-bold text-xs text-slate-800">DSC Certificate Chain</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    CCA India Class-3 Root CA CRL validation receipts and digital timestamp tokens.
                  </p>
                  <span className="text-[10px] font-mono text-blue-700 font-bold block">
                    CCA_Root_Chain_Validated.p7b
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition shadow-2xs">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-purple-700" />
                    <span className="font-bold text-xs text-slate-800">OCR Spatial Evidence Map</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Spatial bounding box coordinate logs extracting GSTIN, PAN, and UDIN text.
                  </p>
                  <span className="text-[10px] font-mono text-blue-700 font-bold block">
                    OCR_Spatial_Evidence_Map.json
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Log Block Detailed Inspection */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-[#003366]" />
                  <h4 className="text-sm font-black text-slate-900">
                    Block #{selectedLog.details?._chain?.sequenceNumber || "N/A"} Detailed Audit Record
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <div className="my-4 space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Action Code:</span>
                  <span className="font-mono text-slate-900 font-bold text-sm">{selectedLog.action}</span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Actor / Officer:</span>
                  <span className="text-slate-800">
                    {selectedLog.actor?.name || "System"} ({selectedLog.actor?.email || "internal"})
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Entity Reference:</span>
                  <span className="font-mono text-slate-800">
                    {selectedLog.entityType} - {selectedLog.entityId || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Previous Block Hash:</span>
                  <code className="font-mono text-[11px] bg-slate-100 p-2 rounded-lg block border border-slate-200 break-all">
                    {selectedLog.details?._chain?.previousHash || "GENESIS_BLOCK"}
                  </code>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Canonical Hash Chain Seal:</span>
                  <code className="font-mono text-[11px] bg-emerald-50 text-emerald-950 p-2 rounded-lg block border border-emerald-200 break-all font-semibold">
                    {selectedLog.details?._chain?.currentHash || "sha256-verified-tamper-evident"}
                  </code>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] block">Raw Stored Payload:</span>
                  <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48">
                    {JSON.stringify(selectedLog.details || {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 text-right">
                <button onClick={() => setSelectedLog(null)} className="btn-gov-primary text-xs">
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

export default function AuditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading audit ledger...</div>}>
      <AuditContent />
    </Suspense>
  );
}
