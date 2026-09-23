"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Shell } from "@/components/Shell";

function TenderDetailContent() {
  const searchParams = useSearchParams();
  const tenderRef = searchParams.get("ref") || "GEM/2025/B/6123456";
  const tenderId = searchParams.get("id") || "tender-1";
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<"overview" | "eligibility" | "documents" | "queries">(
    tabParam === "eligibility" || tabParam === "documents" || tabParam === "queries" ? tabParam : "overview"
  );

  useEffect(() => {
    if (tabParam && ["overview", "eligibility", "documents", "queries"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);
  const [queryClause, setQueryClause] = useState("");
  const [queryText, setQueryText] = useState("");
  const [isSubmittingQuery, setIsSubmittingQuery] = useState(false);
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);
  const [queriesList, setQueriesList] = useState<any[]>([
    {
      id: "PBQ-2026-101",
      clauseRef: "NIT Clause 4.2",
      question: "Whether RAID 6 configuration is mandatory for all edge NVR nodes, or RAID 5 is acceptable for edge devices while maintaining RAID 6 at the central command center?",
      officerResponse: "Clarified: RAID 6 is mandatory for the Command Center SAN array. RAID 5 is acceptable for edge 64-channel NVRs. Corrigendum-01 issued.",
      officerName: "Rajesh Kumar, Deputy Secretary",
      status: "CORRIGENDUM_ISSUED",
      corrigendumId: "CORR-2025-01",
      createdAt: "2025-08-14T10:30:00Z",
    },
    {
      id: "PBQ-2026-102",
      clauseRef: "NIT Clause 6.1",
      question: "Will STQC or BIS lab test certificates be required at technical bid opening or post Letter of Award (LOA)?",
      officerResponse: "BIS certification for cameras and power supplies must be submitted in Envelope 1 (Technical Packet). STQC cybersecurity clearance can be submitted within 30 days of LOA.",
      officerName: "Rajesh Kumar, Deputy Secretary",
      status: "ANSWERED",
      createdAt: "2025-08-15T14:20:00Z",
    },
  ]);
  const [querySubmitted, setQuerySubmitted] = useState(false);

  // Fetch queries from API
  useEffect(() => {
    let mounted = true;
    async function loadQueries() {
      setIsLoadingQueries(true);
      try {
        const res = await fetch(`/api/tenders/prebid-queries?tenderRef=${encodeURIComponent(tenderRef)}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted && Array.isArray(data.queries) && data.queries.length > 0) {
            setQueriesList(data.queries);
          }
        }
      } catch (err) {
        console.error("Failed to load pre-bid queries:", err);
      } finally {
        if (mounted) setIsLoadingQueries(false);
      }
    }
    loadQueries();
    return () => {
      mounted = false;
    };
  }, [tenderRef]);

  async function handleQuerySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!queryClause || !queryText || isSubmittingQuery) return;

    setIsSubmittingQuery(true);
    try {
      const res = await fetch("/api/tenders/prebid-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderRef,
          tenderTitle: "Supply, Installation and Commissioning of Smart IP CCTV Cameras & Command Center",
          clauseRef: queryClause,
          question: queryText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.query) {
          setQueriesList((prev) => [data.query, ...prev]);
        }
        setQueryClause("");
        setQueryText("");
        setQuerySubmitted(true);
        setTimeout(() => setQuerySubmitted(false), 5000);
      } else {
        // Local fallback in case of network disconnect
        const fallbackQuery = {
          id: `PBQ-${Date.now().toString().slice(-6)}`,
          clauseRef: queryClause,
          question: queryText,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        };
        setQueriesList((prev) => [fallbackQuery, ...prev]);
        setQueryClause("");
        setQueryText("");
        setQuerySubmitted(true);
        setTimeout(() => setQuerySubmitted(false), 5000);
      }
    } catch {
      const fallbackQuery = {
        id: `PBQ-${Date.now().toString().slice(-6)}`,
        clauseRef: queryClause,
        question: queryText,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      setQueriesList((prev) => [fallbackQuery, ...prev]);
      setQueryClause("");
      setQueryText("");
      setQuerySubmitted(true);
      setTimeout(() => setQuerySubmitted(false), 5000);
    } finally {
      setIsSubmittingQuery(false);
    }
  }

  function downloadSimulatedFile(filename: string) {
    const content = `========================================================================\nGOVERNMENT OF INDIA - CENTRAL PUBLIC PROCUREMENT PORTAL (CPPP)\nTENDER REFERENCE: ${tenderRef}\nDOCUMENT: ${filename}\nGENERATED: ${new Date().toISOString()}\nSECURITY: CLASS-3 CRYPTOGRAPHIC CHECKSUM VERIFIED (SHA-256)\n========================================================================\n\nNotice Inviting Tender & Technical Specification Guidelines:\n1. All bidders must submit technical envelopes before the closing date.\n2. GSTN and PAN credentials will be cross-checked automatically with registries.\n3. Bill of Quantities (BOQ) must strictly comply with Schedule A.\n\n[End of Document]`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Shell
      role="bidder"
      title={`Tender Specifications: ${tenderRef}`}
      subtitle="Complete Notice Inviting Tender (NIT), Scope of Work, Technical Parameters & Downloadable Files"
    >
      <div className="space-y-6">
        
        {/* Header Summary Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded border border-slate-200">
                  {tenderRef}
                </span>
                <span className="gov-badge open">Active / Published</span>
                <span className="gov-badge neutral">Two-Packet Bidding</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                  GeM Integration Active
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Supply, Installation and Commissioning of Smart IP CCTV Cameras & Command Center
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Procuring Authority: Ministry of Home Affairs • Central Armed Police Forces Headquarters, New Delhi
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/bidder/bid-preparation?tenderId=${tenderId}&ref=${encodeURIComponent(tenderRef)}`}
                className="btn-gov-primary text-xs flex items-center gap-2 shadow-sm px-5 py-2.5"
              >
                <span>📝</span> Prepare & Submit Bid →
              </Link>
            </div>
          </div>

          {/* Quick Key Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">Estimated Tender Value</span>
              <span className="text-base font-black text-[#003366] mt-0.5 block">₹ 2,50,00,000 (2.5 Cr)</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">Earnest Money Deposit (EMD)</span>
              <span className="text-base font-black text-slate-800 mt-0.5 block">₹ 5,00,000</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Exempt for MSME / Udyam</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">Submission Deadline</span>
              <span className="text-base font-black text-red-600 mt-0.5 block">28-Aug-2025 • 18:00 IST</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">Technical Bid Opening</span>
              <span className="text-base font-black text-slate-800 mt-0.5 block">29-Aug-2025 • 11:00 IST</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 flex gap-6 text-xs font-semibold text-slate-600">
          {[
            { id: "overview", label: "Tender Overview & Key Dates" },
            { id: "eligibility", label: "Eligibility & Evaluation Criteria" },
            { id: "documents", label: "Official Documents & BOQ Packets" },
            { id: "queries", label: "Pre-Bid Queries & Corrigenda" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 border-b-2 transition ${
                activeTab === tab.id
                  ? "border-[#003366] text-[#003366] font-bold"
                  : "border-transparent hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Overview */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Scope of Work Summary</h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                The scope encompasses the procurement, delivery, physical mounting, structured Cat-6 cabling, high-definition IP camera installation (4K PTZ and Bullet cameras), along with AI-based Video Analytics Server clusters and Central Video Management Software (VMS) for 24x7 security monitoring across central perimeter zones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Critical Procurement Milestones</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Tender Publishing Date</span>
                    <span className="font-bold text-slate-800">10-Aug-2025 • 10:00 IST</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Document Download End Date</span>
                    <span className="font-bold text-slate-800">28-Aug-2025 • 15:00 IST</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Pre-Bid Meeting Date & Mode</span>
                    <span className="font-bold text-slate-800">18-Aug-2025 (Online Video Conf)</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Clarification Request Deadline</span>
                    <span className="font-bold text-slate-800">20-Aug-2025 • 17:00 IST</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Contractual Terms & Execution</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Contract Period / Delivery</span>
                    <span className="font-bold text-slate-800">180 Days from Award of Work</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Bid Validity Period</span>
                    <span className="font-bold text-slate-800">90 Days from Technical Opening</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Performance Security (PBG)</span>
                    <span className="font-bold text-slate-800">3% of Total Contract Value</span>
                  </div>
                  <div className="flex justify-between p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Liquidated Damages (LD Clause)</span>
                    <span className="font-bold text-slate-800">0.5% per week (capped at 10%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Eligibility */}
        {activeTab === "eligibility" && (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Mandatory Prequalification Criteria</h3>
              
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">1</span>
                    <h4 className="text-xs font-bold text-slate-900">Average Annual Financial Turnover</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-7">
                    The minimum average annual turnover of the bidder during the last three financial years (FY 2021-22, 2022-23, 2023-24) must not be less than <strong>₹ 1,25,00,000 (1.25 Cr)</strong>, certified by a Chartered Accountant with valid UDIN.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">2</span>
                    <h4 className="text-xs font-bold text-slate-900">Past Technical Experience in CCTV / Surveillance</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-7">
                    The bidder must have successfully supplied and commissioned smart CCTV surveillance or Command Control systems for Central/State Govt/PSUs:
                    <br />• 3 similar completed works costing not less than ₹ 1.00 Cr each, OR
                    <br />• 2 similar completed works costing not less than ₹ 1.25 Cr each, OR
                    <br />• 1 similar completed work costing not less than ₹ 2.00 Cr.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">3</span>
                    <h4 className="text-xs font-bold text-slate-900">Make in India (MII) Preference</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-7">
                    Purchase preference shall be given to Class-I local suppliers as defined under Public Procurement (Preference to Make in India) Order 2017. Minimum local content threshold is <strong>50%</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">4</span>
                    <h4 className="text-xs font-bold text-slate-900">OEM Authorization & BIS Certifications</h4>
                  </div>
                  <p className="text-xs text-slate-600 pl-7">
                    Bidders bidding as system integrators must attach an OEM Authorization Certificate (MAF) with tender-specific commitment for 3 years onsite comprehensive warranty support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Documents */}
        {activeTab === "documents" && (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Official Tender Documents (NIT & BOQ)</h3>
                <p className="text-xs text-slate-500">Download official packets to review detailed clauses and fill itemized rate schedules.</p>
              </div>
              <button
                onClick={() => downloadSimulatedFile("Complete_Tender_Packet.zip")}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
              >
                <span>📦</span> Download All Files (.ZIP)
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  filename: "Notice_Inviting_Tender_NIT_2025.pdf",
                  title: "Notice Inviting Tender (NIT) Document",
                  size: "2.4 MB",
                  date: "10-Aug-2025",
                  sha: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                },
                {
                  filename: "Technical_Specifications_and_Schedule.pdf",
                  title: "Technical Specifications & Scope of Work (Schedule A)",
                  size: "4.1 MB",
                  date: "10-Aug-2025",
                  sha: "a6c2242198fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b112",
                },
                {
                  filename: "Financial_BOQ_Rate_Schedule.xlsx",
                  title: "Financial Bid Bill of Quantities (BOQ Template)",
                  size: "148 KB",
                  date: "10-Aug-2025",
                  sha: "8899fa1298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b998",
                },
                {
                  filename: "Corrigendum_1_Clarifications.pdf",
                  title: "Corrigendum 1: Clarifications on Camera Analytics & Storage",
                  size: "380 KB",
                  date: "16-Aug-2025",
                  sha: "90b1c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b771",
                },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{doc.filename} • {doc.size} • Published: {doc.date}</p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">SHA-256: {doc.sha.slice(0, 32)}...</span>
                    </div>
                  </div>

                  <button
                    onClick={() => downloadSimulatedFile(doc.filename)}
                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 transition flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                  >
                    <span>⬇️</span> Download File
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Queries */}
        {activeTab === "queries" && (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pre-Bid Queries & Clarifications</h3>
                <p className="text-xs text-slate-500">Raise questions regarding technical specifications or contractual clauses before the pre-bid cutoff.</p>
              </div>

              {querySubmitted && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800">
                  ✓ Pre-bid clarification submitted. It has been routed to the Procurement Officer for review.
                </div>
              )}

              {/* Submit Query Form */}
              <form onSubmit={handleQuerySubmit} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Submit New Clarification</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Clause / Section Reference *</label>
                    <input
                      type="text"
                      required
                      value={queryClause}
                      onChange={(e) => setQueryClause(e.target.value)}
                      placeholder="e.g., Section 3.4 Camera Resolution"
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Specific Query / Clarification Request *</label>
                    <input
                      type="text"
                      required
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      placeholder="e.g., Request to confirm if ONVIF Profile S and T compliance is mandatory..."
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingQuery}
                    className="btn-gov-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmittingQuery ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Transmitting Query...</span>
                      </>
                    ) : (
                      <>
                        <span>✉️</span>
                        <span>Post Pre-Bid Query</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Existing Queries Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>💬</span>
                    <span>Clarification History & Official Responses ({queriesList.length})</span>
                  </h4>
                  {isLoadingQueries && (
                    <span className="text-[11px] text-slate-400 animate-pulse">Refreshing queries...</span>
                  )}
                </div>

                {queriesList.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No pre-bid clarifications posted for this tender yet.
                  </div>
                ) : (
                  queriesList.map((q) => {
                    const isCorrigendum = q.status === "CORRIGENDUM_ISSUED" || !!q.corrigendumId;
                    const isAnswered = q.status === "ANSWERED" || (!isCorrigendum && (q.officerResponse || q.response));
                    const isPending = !isAnswered && !isCorrigendum;

                    return (
                      <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                              {q.clauseRef || q.clause}
                            </span>
                            {q.id && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {q.id}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {isCorrigendum && (
                              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-900 rounded-full border border-purple-200 flex items-center gap-1">
                                <span>📜</span> Corrigendum Issued {q.corrigendumId ? `(${q.corrigendumId})` : ""}
                              </span>
                            )}
                            {isAnswered && !isCorrigendum && (
                              <span className="gov-badge open">
                                Answered
                              </span>
                            )}
                            {isPending && (
                              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                                Pending Review
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-900">
                            <span className="text-slate-400 font-medium mr-1.5">Query:</span>
                            {q.question}
                          </p>
                          {q.createdAt && (
                            <p className="text-[10px] text-slate-400">
                              Submitted: {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          )}
                        </div>

                        {/* Response Block */}
                        {q.officerResponse || q.response ? (
                          <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                            isCorrigendum 
                              ? "bg-purple-50/60 border-purple-200 text-purple-950" 
                              : "bg-slate-50 border-slate-200 text-slate-800"
                          }`}>
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="text-[#003366] flex items-center gap-1">
                                <span>🏛️</span> Official Procurement Response:
                              </span>
                              {q.officerName && (
                                <span className="text-slate-500 font-medium">
                                  {q.officerName}
                                </span>
                              )}
                            </div>
                            <p className="text-xs leading-relaxed">
                              {q.officerResponse || q.response}
                            </p>
                            {isCorrigendum && (
                              <div className="pt-1 border-t border-purple-200/80 flex items-center justify-between text-[11px]">
                                <span className="text-purple-800 font-semibold">
                                  Corrigendum notice incorporated into NIT schedule.
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setActiveTab("documents")}
                                  className="text-[11px] font-bold text-[#003366] hover:underline"
                                >
                                  View in Documents Tab →
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-2">
                            <span>⏳</span>
                            <span>Assigned to Competent Procurement Authority. Clarification will be published before the pre-bid deadline.</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </Shell>
  );
}

export default function TenderDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Tender Specifications & Documents...</div>}>
      <TenderDetailContent />
    </Suspense>
  );
}

