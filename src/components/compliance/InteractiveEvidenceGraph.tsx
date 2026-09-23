"use client";

import React, { useState } from "react";

export interface EvidenceGraphNode {
  id: string;
  label: string;
  category: "CLAUSE" | "FIELD" | "GOV_API" | "MATCH";
  status: "VERIFIED" | "DISCREPANCY" | "PENDING";
  clauseRef?: string;
  documentName?: string;
  extractedValue?: string;
  govSource?: string;
  govValue?: string;
  shaHash?: string;
  confidence?: number;
  details?: string;
  rawPayload?: Record<string, any>;
}

export interface EvidenceGraphChain {
  id: string;
  title: string;
  tenderClause: string;
  status: "VERIFIED" | "DISCREPANCY" | "PENDING";
  riskDelta: string;
  nodes: {
    clause: EvidenceGraphNode;
    field: EvidenceGraphNode;
    govApi: EvidenceGraphNode;
    match: EvidenceGraphNode;
  };
}

interface Props {
  chains: EvidenceGraphChain[];
  onInspectDocument?: (chain: EvidenceGraphChain) => void;
}

export function InteractiveEvidenceGraph({ chains, onInspectDocument }: Props) {
  const [selectedChainId, setSelectedChainId] = useState<string>(chains[0]?.id || "");
  const [selectedNode, setSelectedNode] = useState<EvidenceGraphNode | null>(
    chains[0] ? chains[0].nodes.match : null
  );
  const [filterStatus, setFilterStatus] = useState<"ALL" | "VERIFIED" | "DISCREPANCY">("ALL");

  const currentChain = chains.find((c) => c.id === selectedChainId) || chains[0];

  const filteredChains = chains.filter((c) => {
    if (filterStatus === "ALL") return true;
    return c.status === filterStatus;
  });

  const getStatusColor = (status: "VERIFIED" | "DISCREPANCY" | "PENDING") => {
    if (status === "VERIFIED") return "bg-emerald-500 text-white border-emerald-600";
    if (status === "DISCREPANCY") return "bg-rose-500 text-white border-rose-600";
    return "bg-amber-500 text-white border-amber-600";
  };

  const getBadgeStyle = (status: "VERIFIED" | "DISCREPANCY" | "PENDING") => {
    if (status === "VERIFIED") return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (status === "DISCREPANCY") return "bg-rose-50 text-rose-800 border-rose-200";
    return "bg-amber-50 text-amber-800 border-amber-200";
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span>🔗</span> Interactive Statutory Evidence Graph & Lineage
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic 4-tier lineage: Tender NIT Clause ➔ Extracted Doc Field ➔ Gov Registry API ➔ Cross-Match Outcome
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-slate-500">Filter Lineage:</span>
          {(["ALL", "VERIFIED", "DISCREPANCY"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                filterStatus === s
                  ? "bg-[#003366] text-white border-[#003366]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {s === "ALL" ? `All (${chains.length})` : s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chain Selection List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Verification Lineages ({filteredChains.length})
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredChains.map((chain) => {
              const isSelected = chain.id === currentChain?.id;
              return (
                <div
                  key={chain.id}
                  onClick={() => {
                    setSelectedChainId(chain.id);
                    setSelectedNode(chain.nodes.match);
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? "bg-blue-50/70 border-[#003366] shadow-sm ring-1 ring-[#003366]/20"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {chain.tenderClause}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getBadgeStyle(
                        chain.status
                      )}`}
                    >
                      {chain.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-1">{chain.title}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    <span className="truncate max-w-[140px]">{chain.nodes.field.documentName}</span>
                    <span
                      className={`font-mono font-bold ${
                        chain.riskDelta === "+0" ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      Risk: {chain.riskDelta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Visual 4-Tier Interactive Node Graph */}
        <div className="lg:col-span-8 space-y-4">
          {currentChain ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
              {/* Lineage Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    {currentChain.tenderClause} · Compliance Audit Chain
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">{currentChain.title}</h3>
                </div>

                {onInspectDocument && (
                  <button
                    onClick={() => onInspectDocument(currentChain)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shrink-0 shadow-2xs"
                  >
                    <span>🔍</span> Side-by-Side Inspector
                  </button>
                )}
              </div>

              {/* 4-Step Interactive Visual Flow */}
              <div className="relative">
                {/* Connecting horizontal line */}
                <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-slate-200 -translate-y-1/2 z-0" />

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                  {/* Tier 1: Clause */}
                  <div
                    onClick={() => setSelectedNode(currentChain.nodes.clause)}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      selectedNode?.id === currentChain.nodes.clause.id
                        ? "border-[#003366] bg-blue-50/80 shadow-md ring-2 ring-[#003366]/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Tier 1</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-900">NIT Clause</div>
                    <div className="text-[11px] font-mono text-slate-600 truncate mt-1">
                      {currentChain.nodes.clause.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2">Mandatory Requirement</div>
                  </div>

                  {/* Tier 2: Extracted Doc Field */}
                  <div
                    onClick={() => setSelectedNode(currentChain.nodes.field)}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      selectedNode?.id === currentChain.nodes.field.id
                        ? "border-[#003366] bg-blue-50/80 shadow-md ring-2 ring-[#003366]/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Tier 2</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-900">Extracted Field</div>
                    <div className="text-[11px] font-mono text-[#003366] font-bold truncate mt-1">
                      {currentChain.nodes.field.extractedValue || currentChain.nodes.field.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 truncate">
                      {currentChain.nodes.field.documentName}
                    </div>
                  </div>

                  {/* Tier 3: Government Registry API */}
                  <div
                    onClick={() => setSelectedNode(currentChain.nodes.govApi)}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      selectedNode?.id === currentChain.nodes.govApi.id
                        ? "border-[#003366] bg-blue-50/80 shadow-md ring-2 ring-[#003366]/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Tier 3</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-900">Gov Source API</div>
                    <div className="text-[11px] font-mono text-cyan-800 font-bold truncate mt-1">
                      {currentChain.nodes.govApi.govSource || currentChain.nodes.govApi.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 truncate">Live Authority Node</div>
                  </div>

                  {/* Tier 4: Cross-Match Result */}
                  <div
                    onClick={() => setSelectedNode(currentChain.nodes.match)}
                    className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                      selectedNode?.id === currentChain.nodes.match.id
                        ? "border-[#003366] bg-blue-50/80 shadow-md ring-2 ring-[#003366]/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Tier 4</span>
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          currentChain.status === "VERIFIED" ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      />
                    </div>
                    <div className="text-xs font-bold text-slate-900">Decision Match</div>
                    <div
                      className={`text-[11px] font-extrabold uppercase truncate mt-1 ${
                        currentChain.status === "VERIFIED" ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {currentChain.nodes.match.status}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-500 mt-2">
                      Risk: {currentChain.riskDelta}
                    </div>
                  </div>
                </div>
              </div>

              {/* Node Inspector Detail Panel */}
              {selectedNode && (
                <div className="p-5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {selectedNode.category}
                      </span>
                      <h5 className="text-xs font-black text-slate-900">{selectedNode.label}</h5>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${getBadgeStyle(
                        selectedNode.status
                      )}`}
                    >
                      {selectedNode.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {selectedNode.details || "No further details available for this verification node."}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] pt-1">
                    {selectedNode.documentName && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Uploaded Document</span>
                        <span className="font-mono font-bold text-slate-800 truncate block mt-0.5">
                          {selectedNode.documentName}
                        </span>
                      </div>
                    )}

                    {selectedNode.extractedValue && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Extracted Value</span>
                        <span className="font-mono font-bold text-[#003366] truncate block mt-0.5">
                          {selectedNode.extractedValue}
                        </span>
                      </div>
                    )}

                    {selectedNode.govSource && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Government Registry</span>
                        <span className="font-bold text-slate-800 truncate block mt-0.5">
                          {selectedNode.govSource}
                        </span>
                      </div>
                    )}

                    {selectedNode.govValue && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">Registry Record</span>
                        <span className="font-mono font-bold text-emerald-700 truncate block mt-0.5">
                          {selectedNode.govValue}
                        </span>
                      </div>
                    )}

                    {selectedNode.shaHash && (
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 col-span-full">
                        <span className="text-slate-400 font-bold block text-[10px] uppercase">
                          SHA-256 Cryptographic Digest
                        </span>
                        <span className="font-mono text-[10px] text-slate-600 truncate block mt-0.5">
                          {selectedNode.shaHash}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedNode.rawPayload && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Raw Authority Payload (WORM Audit Sealed)
                      </span>
                      <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-36">
                        {JSON.stringify(selectedNode.rawPayload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 border border-dashed rounded-2xl">
              No evidence chains match the selected filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
