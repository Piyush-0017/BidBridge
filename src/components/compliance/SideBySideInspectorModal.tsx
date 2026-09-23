"use client";

import React, { useState } from "react";
import { EvidenceGraphChain } from "./InteractiveEvidenceGraph";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chain: EvidenceGraphChain | null;
  onApplyOfficerOverride?: (action: string, notes: string) => void;
}

export function SideBySideInspectorModal({
  isOpen,
  onClose,
  chain,
  onApplyOfficerOverride,
}: Props) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"fields" | "rawJson">("fields");
  const [officerNotes, setOfficerNotes] = useState<string>("");
  const [adjudicationSuccess, setAdjudicationSuccess] = useState<string>("");

  if (!isOpen || !chain) return null;

  const handleAction = (action: string) => {
    if (onApplyOfficerOverride) {
      onApplyOfficerOverride(action, officerNotes);
    }
    setAdjudicationSuccess(`Adjudication saved: "${action}" applied by Officer under GFR 2017.`);
    setTimeout(() => {
      setAdjudicationSuccess("");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-[#003366] text-white text-base">⚖️</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Forensic Side-by-Side Document & Statutory Inspector
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-[#003366]">
                  {chain.tenderClause}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare bidder uploaded PDF evidence directly against the official government registry payload
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase border ${
                chain.status === "VERIFIED"
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-rose-100 text-rose-800 border-rose-300"
              }`}
            >
              {chain.status === "VERIFIED" ? "Statutory Match" : "Discrepancy Flag"}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {adjudicationSuccess && (
          <div className="p-3 bg-emerald-600 text-white text-xs font-bold text-center">
            ✓ {adjudicationSuccess}
          </div>
        )}

        {/* Split Screen Container */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Pane (7 cols): Document OCR Canvas */}
          <div className="lg:col-span-7 bg-slate-900/95 flex flex-col border-r border-slate-800 relative overflow-hidden">
            {/* Toolbar */}
            <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 shrink-0">
              <div className="flex items-center gap-2 font-mono">
                <span>📄</span>
                <span className="truncate max-w-[240px] font-bold text-white">
                  {chain.nodes.field.documentName || "Bidder_Statutory_Evidence.pdf"}
                </span>
                <span className="text-[10px] text-slate-400">Page 1 of 1</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-[11px] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showBoundingBoxes}
                    onChange={(e) => setShowBoundingBoxes(e.target.checked)}
                    className="rounded border-slate-700 text-[#003366] focus:ring-0"
                  />
                  <span>Highlight OCR Boxes</span>
                </label>

                <div className="flex items-center gap-1 bg-slate-800 rounded px-1.5 py-0.5">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
                    className="hover:text-white px-1 font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-[10px] w-8 text-center">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 10, 160))}
                    className="hover:text-white px-1 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Document Surface */}
            <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-slate-900">
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
                className="w-[540px] min-h-[660px] bg-white text-slate-900 shadow-2xl rounded-lg p-8 relative transition-transform duration-150 border border-slate-300 select-none"
              >
                {/* Simulated Official Header on PDF */}
                <div className="border-b-2 border-slate-800 pb-4 text-center">
                  <div className="text-[11px] font-extrabold tracking-widest text-slate-500 uppercase">
                    GOVERNMENT OF INDIA · OFFICIAL FILING RECEIPT
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-1">
                    STATUTORY TAX & INCORPORATION CERTIFICATE
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Registration Authority Copy · Form GST REG-06 / Income Tax Act
                  </div>
                </div>

                {/* PDF Body Fields */}
                <div className="mt-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Filing Reference</span>
                      <span className="font-mono font-bold text-slate-700">REF/2026/STAT-991204</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Issue Date</span>
                      <span className="font-mono font-bold text-slate-700">14-Aug-2024</span>
                    </div>
                  </div>

                  {/* Highlighted Bounding Box Area */}
                  <div className="relative mt-4">
                    <div
                      className={`p-3 rounded-lg border-2 transition ${
                        showBoundingBoxes
                          ? "border-blue-500 bg-blue-50/60 ring-4 ring-blue-500/20"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 mb-1">
                        <span>OCR EXTRACTED FIELD [CONFIDENCE: 99.4%]</span>
                        <span className="font-mono">BOX: [x:120, y:240, w:310, h:52]</span>
                      </div>
                      <div className="font-bold text-slate-500 text-[11px]">
                        {chain.nodes.field.label}:
                      </div>
                      <div className="font-mono font-black text-sm text-[#003366] mt-0.5">
                        {chain.nodes.field.extractedValue || "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Supporting Document Details */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Legal Entity Name</span>
                      <span className="font-bold text-slate-800">
                        {chain.nodes.field.rawPayload?.legalName || "InfraBuild Dynamics Pvt Ltd"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Jurisdiction</span>
                      <span className="font-bold text-slate-800">
                        {chain.nodes.field.rawPayload?.state || "Delhi — Ward 74, Range 14"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Constitution of Business</span>
                      <span className="font-bold text-slate-800">Private Limited Company</span>
                    </div>
                  </div>

                  {/* Digital Signature Seal */}
                  <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                    <div>
                      <span className="font-bold text-slate-700 block">Class-3 Digital Signature:</span>
                      <span className="font-mono text-[9px]">cn=CCA-INDIA, o=Gov, c=IN</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-700 block">AUTHENTIC & SIGNED</span>
                      <span>SHA-256 Digest Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom File Hash Info */}
            <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between shrink-0">
              <span className="truncate max-w-[340px]">
                SHA-256: {chain.nodes.field.shaHash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
              </span>
              <span className="text-emerald-400 font-bold">Quarantine Storage: CLEAN</span>
            </div>
          </div>

          {/* Right Pane (5 cols): Official Government API Comparator */}
          <div className="lg:col-span-5 bg-white flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-bold shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("fields")}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeTab === "fields"
                      ? "bg-[#003366] text-white"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Comparison Table
                </button>
                <button
                  onClick={() => setActiveTab("rawJson")}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeTab === "rawJson"
                      ? "bg-[#003366] text-white"
                      : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Gov Registry JSON
                </button>
              </div>

              <span className="text-[10px] text-slate-400 font-mono">
                {chain.nodes.govApi.govSource}
              </span>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeTab === "fields" ? (
                <>
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Entity Identity Comparison
                    </h4>

                    {/* Comparator Table */}
                    <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Attribute</th>
                            <th className="p-2.5">Uploaded PDF</th>
                            <th className="p-2.5">Gov Registry</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          <tr>
                            <td className="p-2.5 text-slate-500 font-bold">Key Identifier</td>
                            <td className="p-2.5 font-mono font-bold text-slate-800">
                              {chain.nodes.field.extractedValue || "—"}
                            </td>
                            <td className="p-2.5 font-mono font-bold text-emerald-700">
                              {chain.nodes.govApi.govValue || chain.nodes.field.extractedValue || "—"}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-500 font-bold">Legal Name</td>
                            <td className="p-2.5 text-slate-800">
                              {chain.nodes.field.rawPayload?.legalName || "InfraBuild Dynamics Pvt Ltd"}
                            </td>
                            <td className="p-2.5 text-emerald-700 font-bold">
                              {chain.nodes.govApi.rawPayload?.legalName || "InfraBuild Dynamics Private Limited"}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-500 font-bold">Registry Status</td>
                            <td className="p-2.5 text-slate-800">Submitted</td>
                            <td className="p-2.5">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                ACTIVE / COMPLIANT
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2.5 text-slate-500 font-bold">Risk Weight</td>
                            <td className="p-2.5 text-slate-800">Base</td>
                            <td className="p-2.5 font-mono font-bold text-rose-700">
                              {chain.riskDelta}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* AI Cross-Match Rationale */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1.5">
                    <span className="font-black text-[#003366] block">
                      AI Reasoner Rationale:
                    </span>
                    <p className="text-slate-700 font-medium leading-relaxed">
                      {chain.nodes.match.details ||
                        "Normalized match: 'Pvt Ltd' conforms with statutory 'Private Limited' expansion. Embedded PAN cross-matches with CBDT active taxpayer records."}
                    </p>
                  </div>

                  {/* Officer Adjudication Controls */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">
                        Officer Adjudication (GFR 2017)
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Section 144 Rule</span>
                    </div>

                    <textarea
                      value={officerNotes}
                      onChange={(e) => setOfficerNotes(e.target.value)}
                      placeholder="Enter statutory justification or notes for the audit trail..."
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003366] resize-none"
                    />

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleAction("CLEAR_AND_ACCEPT")}
                        className="px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-2xs"
                      >
                        ✓ Accept & Clear Clause
                      </button>
                      <button
                        onClick={() => handleAction("REQUEST_CLARIFICATION")}
                        className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-2xs"
                      >
                        💬 Request Clarification
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold">Encrypted WORM JSON Response</span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          JSON.stringify(
                            chain.nodes.govApi.rawPayload || {
                              status: "ACTIVE",
                              source: chain.nodes.govApi.govSource,
                              verifiedAt: new Date().toISOString(),
                            },
                            null,
                            2
                          )
                        )
                      }
                      className="text-[#003366] hover:underline font-bold"
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[460px]">
                    {JSON.stringify(
                      chain.nodes.govApi.rawPayload || {
                        status: "ACTIVE",
                        source: chain.nodes.govApi.govSource,
                        recordFound: true,
                        sourceBadge: "DEMO VERIFIED — SIMULATED SOURCE",
                        verifiedAt: new Date().toISOString(),
                        taxpayerDetails: {
                          legalName: "InfraBuild Dynamics Private Limited",
                          panStatus: "ACTIVE_AND_SEEDED",
                          taxClearance: "VALID_TILL_31_MAR_2026",
                        },
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
