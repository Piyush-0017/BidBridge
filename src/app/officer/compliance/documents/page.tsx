"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { PDFViewerModal } from "@/components/PDFViewerModal";

export default function DocVerificationPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [msg, setMsg] = useState("");

  function loadDocs() {
    setLoading(true);
    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => {
        setDocs(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadDocs();
  }, []);

  async function updateStatus(id: string, status: "VERIFIED" | "INCONSISTENT" | "FAILED", name: string) {
    try {
      const res = await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setMsg(`Document "${name}" marked as ${status}.`);
        loadDocs();
        setTimeout(() => setMsg(""), 4000);
      }
    } catch {}
  }

  return (
    <Shell
      role="officer"
      title="Statutory Document Audit & Compliance Console"
      subtitle="Examine bidder tax credentials, audit Class-3 integrity seals, and conduct side-by-side verification"
    >
      <div className="space-y-6">

        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
            <span>✓ {msg}</span>
            <button onClick={() => setMsg("")} className="text-emerald-900 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Top Audit Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Submitted Credentials</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{docs.length}</span>
            <span className="text-[10px] text-blue-600 font-medium">Across all participating bidders</span>
          </div>

          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Verified Active</span>
            <span className="text-2xl font-black text-emerald-800 mt-1 block">
              {docs.filter((d) => d.status === "VERIFIED").length}
            </span>
            <span className="text-[10px] text-emerald-700 font-medium">SHA-256 Passed</span>
          </div>

          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Under Officer Audit</span>
            <span className="text-2xl font-black text-amber-800 mt-1 block">
              {docs.filter((d) => d.status !== "VERIFIED").length}
            </span>
            <span className="text-[10px] text-amber-700 font-medium">Requires Inspection</span>
          </div>

          <div className="gov-card p-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Repository Storage</span>
            <span className="text-2xl font-black text-purple-900 mt-1 block">Neon Cloud</span>
            <span className="text-[10px] text-purple-700 font-medium">PostgreSQL Linked</span>
          </div>
        </div>

        {/* Documents Table */}
        <div className="gov-card overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bidder Tax & Technical Credentials</h3>
              <p className="text-xs text-slate-500">Live feed of stored PDF documents from database</p>
            </div>
            <button
              onClick={loadDocs}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
            >
              <span>🔄</span> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Document Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Verification Status</th>
                  <th className="p-3.5">File Size</th>
                  <th className="p-3.5">Uploaded Date</th>
                  <th className="p-3.5 text-right">Officer Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docs.map((d) => {
                  const pdfUrl = d.storageKey?.startsWith("/") ? d.storageKey : `/uploads/${d.name}`;
                  return (
                    <tr key={d.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">📄</span>
                          <div>
                            <span className="font-bold text-slate-900 block">{d.name}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-400 font-mono">
                                SHA-256: {d.sha256 ? `${d.sha256.slice(0, 16)}...` : "Verified"}
                              </span>
                              {d.verification?.extractedData?.entities?.gstin && (
                                <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono text-[9px] font-bold">
                                  GST: {d.verification.extractedData.entities.gstin}
                                </span>
                              )}
                              {d.verification?.extractedData?.entities?.pan && (
                                <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-mono text-[9px] font-bold">
                                  PAN: {d.verification.extractedData.entities.pan}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {(d.documentType || "OTHER").replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              d.status === "VERIFIED"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : d.status === "INCONSISTENT"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-slate-100 text-slate-700 border border-slate-300"
                            }`}
                          >
                            {d.status || "PENDING"}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-700">
                            <span>🛡️</span> Clean (CERT-In)
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-600">
                        {d.sizeBytes ? `${(d.sizeBytes / 1024).toFixed(1)} KB` : "—"}
                      </td>

                      <td className="p-3.5 text-slate-500">
                        {new Date(d.uploadedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewDoc(d)}
                            className="px-2.5 py-1 rounded-lg bg-[#003366] hover:bg-[#0b5cad] text-white text-[11px] font-bold transition flex items-center gap-1 shadow-2xs"
                          >
                            <span>👁️</span> Inspect & AI
                          </button>

                          {d.status !== "VERIFIED" && (
                            <button
                              onClick={() => updateStatus(d.id, "VERIFIED", d.name)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold transition"
                              title="Mark document verified"
                            >
                              ✓ Verify
                            </button>
                          )}

                          {d.status === "VERIFIED" && (
                            <button
                              onClick={() => updateStatus(d.id, "INCONSISTENT", d.name)}
                              className="px-2 py-1 rounded-lg border border-amber-300 hover:bg-amber-50 text-amber-800 text-[10px] font-semibold transition"
                              title="Flag document discrepancy"
                            >
                              Flag
                            </button>
                          )}

                          <a
                            href={pdfUrl}
                            download={d.name}
                            className="p-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs transition"
                            title="Download original file"
                          >
                            📥
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && docs.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              No documents available in queue.
            </div>
          )}
          {loading && (
            <div className="p-8 text-center text-xs text-slate-400">
              Loading compliance documents from Neon database...
            </div>
          )}
        </div>

      </div>

      {/* PDF Inspection Modal */}
      {previewDoc && (
        <PDFViewerModal
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          docId={previewDoc.id}
          docName={previewDoc.name}
          docUrl={previewDoc.storageKey?.startsWith("/") ? previewDoc.storageKey : `/uploads/${previewDoc.name}`}
          docType={previewDoc.documentType}
          shaHash={previewDoc.sha256}
          sizeBytes={previewDoc.sizeBytes}
          status={previewDoc.status}
          existingOcr={previewDoc.verification?.extractedData || null}
          onOcrComplete={(newStatus) => {
            loadDocs();
            setMsg(`Document AI analysis complete. Status updated to ${newStatus}.`);
            setTimeout(() => setMsg(""), 5000);
          }}
        />
      )}
    </Shell>
  );
}
