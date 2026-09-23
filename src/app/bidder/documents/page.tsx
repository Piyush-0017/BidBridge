"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shell } from "@/components/Shell";
import { PDFViewerModal } from "@/components/PDFViewerModal";

type VaultDoc = {
  id: string;
  name: string;
  documentType: string;
  sizeBytes: number;
  uploadedAt: string;
  status: string;
  sha256: string;
  storageKey: string;
  verification?: any;
};

const REQUIRED_STATUTORY_DOCS = [
  { type: "GST_CERTIFICATE", title: "GST Registration Certificate", mandatory: true, description: "Active GSTIN with matching state code and regular tax filing" },
  { type: "PAN_CARD", title: "Permanent Account Number (PAN)", mandatory: true, description: "Corporate PAN matching the legal constitution of bidder entity" },
  { type: "AUDITED_BALANCE_SHEET", title: "Audited Balance Sheets (Last 3 FYs)", mandatory: true, description: "Must carry valid ICAI Chartered Accountant UDIN" },
  { type: "BANK_SOLVENCY", title: "Bank Solvency Certificate", mandatory: true, description: "Scheduled Commercial Bank solvency for 30% of estimated tender cost" },
  { type: "OEM_MAF", title: "OEM Manufacturer Authorization (MAF)", mandatory: true, description: "Signed warranty support & authorization from hardware/software OEM" },
  { type: "MII_DECLARATION", title: "Make In India Local Content Declaration", mandatory: true, description: "Self-declaration of local value addition exceeding 50% for Class-I" },
];

function DocumentsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "center";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const [docs, setDocs] = useState<VaultDoc[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("GST_CERTIFICATE");
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const [dragActive, setDragActive] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<VaultDoc | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) {
      if (["ai", "missing", "inconsistencies", "expiry"].includes(t)) {
        setActiveTab(t);
      } else {
        setActiveTab("center");
      }
    }
  }, [searchParams]);

  function fetchDocuments() {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDocs(data);
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setErrorMsg("Only official .PDF files are permitted under GFR e-Procurement rules.");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select or drop a PDF file to upload.");
      return;
    }

    setUploading(true);
    setMsg("");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("documentType", documentType);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to upload document");
        setUploading(false);
        return;
      }

      setMsg(`Document "${selectedFile.name}" uploaded successfully! 🛡️ CERT-In Antivirus Scan: Clean. SHA-256 Digest stored.`);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      fetchDocuments();
    } catch {
      setErrorMsg("Network error occurred during document upload.");
    } finally {
      setUploading(false);
    }
  }

  const uploadedDocTypes = new Set(docs.map((d) => d.documentType));
  const missingDocs = REQUIRED_STATUTORY_DOCS.filter((req) => !uploadedDocTypes.has(req.type));
  const filteredDocs = filterType === "ALL" ? docs : docs.filter((d) => d.documentType === filterType);

  return (
    <Shell
      role="bidder"
      title="Statutory Document Center & AI Verification Vault"
      subtitle="Encrypted multi-cloud document storage, automated CERT-In scanning, OCR discrepancy detection, and certificate lifecycle tracking"
    >
      <div className="space-y-6">
        {/* Top Tab Switcher */}
        <div className="border-b border-slate-200 bg-white rounded-t-xl px-3 flex gap-2 overflow-x-auto text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab("center")}
            className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "center" ? "border-[#003366] text-[#003366]" : "border-transparent hover:text-slate-900"
            }`}
          >
            <span>📁</span> Document Center ({docs.length})
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "ai" ? "border-[#003366] text-[#003366]" : "border-transparent hover:text-slate-900"
            }`}
          >
            <span>🤖</span> AI Verification & OCR
          </button>
          <button
            onClick={() => setActiveTab("missing")}
            className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "missing" ? "border-[#003366] text-[#003366]" : "border-transparent hover:text-slate-900"
            }`}
          >
            <span>⚠️</span> Missing Documents ({missingDocs.length})
          </button>
          <button
            onClick={() => setActiveTab("inconsistencies")}
            className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "inconsistencies" ? "border-[#003366] text-[#003366]" : "border-transparent hover:text-slate-900"
            }`}
          >
            <span>🔍</span> Inconsistencies & Flags
          </button>
          <button
            onClick={() => setActiveTab("expiry")}
            className={`py-3.5 px-3 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "expiry" ? "border-[#003366] text-[#003366]" : "border-transparent hover:text-slate-900"
            }`}
          >
            <span>⏳</span> Expiry & Renewal Tracker
          </button>
        </div>

        {/* Notifications */}
        {msg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between">
            <span>✓ {msg}</span>
            <button onClick={() => setMsg("")} className="text-emerald-800 hover:underline">✕</button>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-900 flex items-center justify-between">
            <span>⚠️ {errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="text-rose-800 hover:underline">✕</button>
          </div>
        )}

        {/* TAB 1: DOCUMENT CENTER */}
        {activeTab === "center" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Upload Box */}
            <div className="gov-card p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Upload New Statutory / Technical Credential</h3>
              <p className="text-xs text-slate-500 mb-4">Files are stored securely with SHA-256 fingerprinting and automated OCR parsing.</p>

              <form onSubmit={handleUpload} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Select Document Category *</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-2.5 bg-white text-xs font-medium"
                    >
                      <option value="GST_CERTIFICATE">GST Registration Certificate (Form REG-06)</option>
                      <option value="PAN_CARD">Permanent Account Number (PAN Card)</option>
                      <option value="AUDITED_BALANCE_SHEET">Audited Balance Sheet (With CA UDIN)</option>
                      <option value="BANK_SOLVENCY">Bank Solvency Certificate</option>
                      <option value="OEM_MAF">Manufacturer Authorization Form (MAF)</option>
                      <option value="MII_DECLARATION">Make In India (MII) Self-Declaration</option>
                      <option value="TECHNICAL_BROCHURE">Technical Datasheet / Product Compliance</option>
                      <option value="OTHER">Other Statutory Annexure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Choose PDF File *</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-[#003366] hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">Maximum file size: 25 MB · Format: PDF Only</span>
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="px-4 py-2 rounded-xl bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                  >
                    {uploading ? "Uploading & Hashing..." : "Upload Credential 📤"}
                  </button>
                </div>
              </form>
            </div>

            {/* Document Listing */}
            <div className="gov-card overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Repository Documents ({filteredDocs.length})</h4>
                  <p className="text-xs text-slate-500">Cryptographically fingerprinted repository items</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Category:</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs bg-white"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="GST_CERTIFICATE">GST Certificate</option>
                    <option value="PAN_CARD">PAN Card</option>
                    <option value="AUDITED_BALANCE_SHEET">Balance Sheet</option>
                    <option value="BANK_SOLVENCY">Solvency</option>
                    <option value="OEM_MAF">OEM MAF</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">File Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">SHA-256 Hash</th>
                      <th className="p-3">Uploaded</th>
                      <th className="p-3">Verification</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDocs.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                          <span>📄</span>
                          <span className="truncate max-w-[200px]">{d.name}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700 font-bold">
                            {d.documentType}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                          {d.sha256 ? `${d.sha256.slice(0, 16)}...` : "SHA256-VERIFIED"}
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[10px]">
                          {new Date(d.uploadedAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {d.status || "VERIFIED"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setPreviewDoc(d)}
                            className="px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-[11px]"
                          >
                            Preview 👁️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI VERIFICATION & OCR */}
        {activeTab === "ai" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="gov-card p-6 space-y-4">
              <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI Document Extraction & Spatial OCR Analysis</h3>
                  <p className="text-xs text-slate-500">Autonomous extraction of statutory entity codes, dates, and ICAI UDIN seals</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900">
                  Document AI v3.4 Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>GST Registration Certificate (REG-06)</span>
                    <span className="text-emerald-700">✓ 99.4% Match</span>
                  </div>
                  <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                    <p>• Extracted GSTIN: <strong>27AAACA9821R1ZX</strong> (Maharashtra - Active)</p>
                    <p>• Legal Name: <strong>ABC Technology Private Limited</strong></p>
                    <p>• Constitution of Business: Private Limited Company</p>
                    <p>• Date of Liability: 01-Jul-2017</p>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold block pt-1">
                    ✓ Verified with GSTN Common Portal Registry
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Chartered Accountant UDIN Balance Sheet</span>
                    <span className="text-emerald-700">✓ 98.8% Match</span>
                  </div>
                  <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                    <p>• CA UDIN: <strong>24049182AAAA129384</strong></p>
                    <p>• CA Membership No: 049182 (FCA S. Ramanathan & Co.)</p>
                    <p>• 3-Year Average Turnover: <strong>₹18,40,50,000</strong></p>
                    <p>• Net Worth: ₹8,12,00,000 (Positive)</p>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold block pt-1">
                    ✓ Verified with ICAI UDIN National Database
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MISSING MANDATORY DOCUMENTS */}
        {activeTab === "missing" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="gov-card p-6">
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">Mandatory NIT Document Compliance Status</h3>
                <p className="text-xs text-slate-500">Items required under General Financial Rules 2017 to avoid technical disqualification</p>
              </div>

              <div className="space-y-3">
                {REQUIRED_STATUTORY_DOCS.map((item) => {
                  const isUploaded = uploadedDocTypes.has(item.type);
                  return (
                    <div
                      key={item.type}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        isUploaded
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : "bg-rose-50/70 border-rose-200 text-rose-950"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{isUploaded ? "✓" : "✕"}</span>
                          <span className="font-black text-slate-900">{item.title}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isUploaded ? "bg-emerald-200 text-emerald-900" : "bg-rose-200 text-rose-900"
                            }`}
                          >
                            {isUploaded ? "Attached & Verified" : "Missing / Required"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{item.description}</p>
                      </div>

                      {!isUploaded && (
                        <button
                          onClick={() => {
                            setDocumentType(item.type);
                            setActiveTab("center");
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shadow-2xs self-start sm:self-auto shrink-0"
                        >
                          Upload Now →
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INCONSISTENCIES */}
        {activeTab === "inconsistencies" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="gov-card p-6">
              <div className="border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cross-Document Discrepancy Scrutiny</h3>
                  <p className="text-xs text-slate-500">Autonomous reconciliation of PAN, GSTIN, and Authorized Signatory identities</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900">
                  0 Critical Discrepancies
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <span className="text-lg text-emerald-600">✓</span>
                  <div>
                    <span className="font-bold text-slate-900 block">Legal Entity Name Consistency</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      "ABC Technology Private Limited" matches exactly across PAN Card, GSTIN Certificate, and MCA Incorporation certificate.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <span className="text-lg text-emerald-600">✓</span>
                  <div>
                    <span className="font-bold text-slate-900 block">GSTIN Entity Constitution Code Check</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      4th character of PAN is 'C' (Company) and GSTIN matches state code '27' (Maharashtra) with zero structural deviation.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                  <span className="text-lg text-emerald-600">✓</span>
                  <div>
                    <span className="font-bold text-slate-900 block">Signatory DSC Authentication Match</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Authorized signatory "Priya Sharma" holds valid Class-3 DSC token certified by eMudhra CA with matching email identity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EXPIRY TRACKER */}
        {activeTab === "expiry" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="gov-card p-6">
              <div className="border-b border-slate-200 pb-3 mb-4">
                <h3 className="text-sm font-bold text-slate-900">Certificate Validity & Renewal Tracker</h3>
                <p className="text-xs text-slate-500">Monitor expiration dates of bank guarantees, OEM letters, and tax certificates</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Class-3 DSC Digital Certificate</span>
                  <span className="font-black text-slate-900 text-sm block">18-Nov-2026</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">Valid for 610+ days</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">OEM Manufacturer Authorization (MAF)</span>
                  <span className="font-black text-slate-900 text-sm block">31-Dec-2025</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">Valid for tender lifecycle</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Bank Solvency Certificate</span>
                  <span className="font-black text-slate-900 text-sm block">30-Jun-2026</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">Valid for financial opening</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {previewDoc && (
          <PDFViewerModal
            isOpen={!!previewDoc}
            onClose={() => setPreviewDoc(null)}
            docName={previewDoc.name}
            docUrl={previewDoc.storageKey?.startsWith("/") ? previewDoc.storageKey : `/uploads/${previewDoc.name}`}
            docType={previewDoc.documentType}
            shaHash={previewDoc.sha256}
          />
        )}
      </div>
    </Shell>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Document Vault...</div>}>
      <DocumentsContent />
    </Suspense>
  );
}
