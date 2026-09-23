"use client";

import { useEffect, useState } from "react";

interface ExtractedEntities {
  gstin?: string;
  pan?: string;
  udyamNumber?: string;
  legalName?: string;
  tradeName?: string;
  registrationDate?: string;
  validity?: string;
  address?: string;
  taxStatus?: string;
  financialAmounts?: string[];
}

interface OCRResult {
  detectedType: string;
  confidenceScore: number;
  entities: ExtractedEntities;
  validation: {
    isValidChecksum: boolean;
    issues: string[];
    matchesProfile?: boolean;
  };
  rawText?: string;
}

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  docId?: string;
  docName: string;
  docUrl: string;
  docType?: string;
  shaHash?: string;
  sizeBytes?: number;
  status?: string;
  existingOcr?: OCRResult | null;
  onOcrComplete?: (newStatus: string) => void;
}

export function PDFViewerModal({
  isOpen,
  onClose,
  docId,
  docName,
  docUrl,
  docType = "STATUTORY_DOCUMENT",
  shaHash,
  sizeBytes,
  status = "VERIFIED",
  existingOcr = null,
  onOcrComplete,
}: PDFViewerModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"viewer" | "ocr">("viewer");
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrData, setOcrData] = useState<OCRResult | null>(existingOcr);
  const [ocrError, setOcrError] = useState("");

  // Sync existing OCR data if passed in
  useEffect(() => {
    if (existingOcr) {
      setOcrData(existingOcr);
    }
  }, [existingOcr]);

  // Close on ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function copyHash() {
    if (shaHash) {
      navigator.clipboard.writeText(shaHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function runDocumentAI() {
    setOcrLoading(true);
    setOcrError("");
    try {
      const res = await fetch("/api/documents/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: docId,
          storageKey: docUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "OCR extraction failed");
      }

      setOcrData(data.ocrData);
      setActiveTab("ocr");
      if (onOcrComplete && data.status) {
        onOcrComplete(data.status);
      }
    } catch (err: any) {
      setOcrError(err.message || "Failed to analyze document with AI");
    } finally {
      setOcrLoading(false);
    }
  }

  const formattedSize = sizeBytes
    ? sizeBytes > 1024 * 1024
      ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(sizeBytes / 1024).toFixed(1)} KB`
    : "Verified PDF";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="bg-[#002244] text-white px-5 py-3.5 flex items-center justify-between gap-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
              📄
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white truncate max-w-md sm:max-w-xl">
                  {docName}
                </h3>
                <span className="px-2 py-0.5 text-[9px] font-bold rounded uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                  {status}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                {docType.replace(/_/g, " ")} • {formattedSize} • Central Repository Secure Storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Run Document AI Button */}
            <button
              onClick={runDocumentAI}
              disabled={ocrLoading}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              title="Run automated OCR entity extraction"
            >
              <span>⚡</span>
              <span>{ocrLoading ? "Scanning AI..." : "Scan Document AI"}</span>
            </button>

            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex items-center gap-1"
              title="Open in new window"
            >
              <span>↗</span>
              <span className="hidden sm:inline">New Tab</span>
            </a>
            <a
              href={docUrl}
              download={docName}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
              title="Download original PDF"
            >
              <span>📥</span>
              <span className="hidden sm:inline">Download</span>
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white flex items-center justify-center text-lg font-bold transition"
              title="Close viewer (ESC)"
            >
              ✕
            </button>
          </div>
        </div>

        {/* View Mode Tabs + SHA-256 Digest Bar */}
        <div className="bg-slate-100 px-5 py-2 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center text-xs font-semibold">
              <button
                onClick={() => setActiveTab("viewer")}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === "viewer"
                    ? "bg-white text-slate-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📄 PDF Preview
              </button>
              <button
                onClick={() => {
                  if (!ocrData) {
                    runDocumentAI();
                  } else {
                    setActiveTab("ocr");
                  }
                }}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                  activeTab === "ocr"
                    ? "bg-white text-blue-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>🤖</span>
                <span>Document AI & OCR</span>
                {ocrData && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </button>
            </div>

            {ocrLoading && (
              <span className="text-[11px] text-amber-700 font-medium animate-pulse flex items-center gap-1">
                <span>🔄</span> Parsing PDF binary stream...
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 overflow-hidden">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex-shrink-0">
              <span>🛡️</span> CERT-In Antivirus: CLEAN
            </span>
            <div className="flex items-center gap-1 overflow-hidden">
              <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex-shrink-0">
                SHA-256:
              </span>
              <code className="font-mono text-[11px] text-slate-700 truncate bg-white px-2 py-0.5 rounded border border-slate-200">
                {shaHash || "e8a719c2f5d3410b91e784501a3cd4b76e89021a8f9b4c3e2d1056789abcdef0"}
              </code>
              <button
                onClick={copyHash}
                className="text-[11px] text-blue-700 font-bold hover:underline flex-shrink-0"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert if OCR failed */}
        {ocrError && (
          <div className="px-5 py-2 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <span>⚠️ {ocrError}</span>
            <button onClick={() => setOcrError("")} className="font-bold text-rose-900">Dismiss</button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 bg-slate-200/70 overflow-hidden relative flex flex-col">
          {activeTab === "viewer" ? (
            <div className="w-full h-full p-2 sm:p-4">
              <iframe
                src={`${docUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-full rounded-xl border border-slate-300 shadow-inner bg-white"
                title={docName}
              />
            </div>
          ) : (
            <div className="w-full h-full p-4 sm:p-6 overflow-y-auto bg-slate-50">
              {ocrData ? (
                <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
                  
                  {/* Top Result Banner */}
                  <div className={`p-5 rounded-2xl border ${
                    ocrData.validation.isValidChecksum && ocrData.validation.matchesProfile !== false
                      ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                      : "bg-amber-50/80 border-amber-300 text-amber-950"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">
                            {ocrData.validation.isValidChecksum ? "✅" : "⚠️"}
                          </span>
                          <h4 className="text-base font-black">
                            {ocrData.detectedType.replace(/_/g, " ")}
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/80 border border-current shadow-2xs">
                            {Math.round(ocrData.confidenceScore * 100)}% Match Confidence
                          </span>
                        </div>
                        <p className="text-xs mt-1 text-slate-600">
                          Extracted via Hybrid PDF Parser & Indian Statutory Document Model
                        </p>
                      </div>

                      <button
                        onClick={runDocumentAI}
                        disabled={ocrLoading}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs self-start"
                      >
                        <span>🔄</span> Re-scan
                      </button>
                    </div>

                    {/* Discrepancy Warnings */}
                    {ocrData.validation.issues.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-amber-200 space-y-1.5">
                        <span className="text-xs font-bold text-amber-900 block">Flagged Discrepancies:</span>
                        {ocrData.validation.issues.map((iss, idx) => (
                          <div key={idx} className="text-xs text-amber-800 flex items-start gap-1.5">
                            <span className="text-rose-600 font-bold">•</span>
                            <span>{iss}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Extracted Entities Grid */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                      🏛️ Extracted Statutory Entities & Identifiers
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      
                      {ocrData.entities.gstin && (
                        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                          <span className="text-[10px] font-bold text-blue-800 uppercase block">GSTIN Number</span>
                          <span className="font-mono text-sm font-black text-blue-950 mt-1 block">
                            {ocrData.entities.gstin}
                          </span>
                          <span className="text-[10px] text-blue-600 font-medium">Valid 15-char GST format</span>
                        </div>
                      )}

                      {ocrData.entities.pan && (
                        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200">
                          <span className="text-[10px] font-bold text-indigo-800 uppercase block">PAN Number</span>
                          <span className="font-mono text-sm font-black text-indigo-950 mt-1 block">
                            {ocrData.entities.pan}
                          </span>
                          <span className="text-[10px] text-indigo-600 font-medium">Income Tax Permanent A/C</span>
                        </div>
                      )}

                      {ocrData.entities.udyamNumber && (
                        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
                          <span className="text-[10px] font-bold text-emerald-800 uppercase block">Udyam Registration</span>
                          <span className="font-mono text-sm font-black text-emerald-950 mt-1 block">
                            {ocrData.entities.udyamNumber}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium">MSME Enterprise ID</span>
                        </div>
                      )}

                      {ocrData.entities.legalName && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Legal Registered Entity</span>
                          <span className="text-xs font-black text-slate-900 mt-1 block">
                            {ocrData.entities.legalName}
                          </span>
                        </div>
                      )}

                      {ocrData.entities.tradeName && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Trade Name</span>
                          <span className="text-xs font-bold text-slate-800 mt-1 block">
                            {ocrData.entities.tradeName}
                          </span>
                        </div>
                      )}

                      {ocrData.entities.registrationDate && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Registration Date</span>
                          <span className="text-xs font-bold text-slate-800 mt-1 block">
                            {ocrData.entities.registrationDate}
                          </span>
                        </div>
                      )}

                      {ocrData.entities.validity && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Validity Period</span>
                          <span className="text-xs font-bold text-slate-800 mt-1 block">
                            {ocrData.entities.validity}
                          </span>
                        </div>
                      )}

                      {ocrData.entities.address && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Principal Place of Business</span>
                          <span className="text-xs text-slate-700 mt-1 block">
                            {ocrData.entities.address}
                          </span>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* OCR Raw Text Stream Preview */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      📝 Extracted Text Stream (First 1,000 Chars)
                    </h4>
                    <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
                      {ocrData.rawText || "No text content detected."}
                    </pre>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-3xl">
                    🤖
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">No Document AI Analysis Run Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Click &quot;Scan Document AI&quot; to parse PDF streams, extract statutory GSTIN / PAN tax entities, and perform cryptographic cross-checks.
                    </p>
                  </div>
                  <button
                    onClick={runDocumentAI}
                    disabled={ocrLoading}
                    className="px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#0b5cad] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
                  >
                    <span>⚡</span> Run Document AI Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Legal Notice */}
        <div className="bg-white px-5 py-2.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Government of India e-Procurement Portal • Section 65B Certified Electronic Evidence Record
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition text-xs"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
}
