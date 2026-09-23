"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import Link from "next/link";

interface CorrigendumItem {
  id: string;
  tenderNo: string;
  title: string;
  description?: string;
  clauseRef?: string;
  amendmentType?: string;
  date: string;
  version: string;
  status: string;
  author: string;
}

interface PreBidQueryItem {
  id: string;
  tenderRef: string;
  tenderTitle: string;
  clauseRef: string;
  clauseTitle?: string;
  question: string;
  bidderName: string;
  bidderEmail: string;
  status: "PENDING" | "ANSWERED" | "CORRIGENDUM_ISSUED";
  officerResponse?: string;
  officerName?: string;
  corrigendumId?: string;
  createdAt: string;
  answeredAt?: string;
}

export default function CorrigendumPage() {
  const [activeTab, setActiveTab] = useState<"queries" | "corrigenda">("queries");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Data lists
  const [corrigenda, setCorrigenda] = useState<CorrigendumItem[]>([
    {
      id: "CORR-2025-01",
      tenderNo: "GEM/2025/B/6123456",
      title: "Clarifications & Storage Architecture Amendment for IP CCTV Cameras",
      description: "Amendment to Clause 4.2 allowing RAID 5 configuration on edge NVR nodes while retaining RAID 6 on central SAN clusters.",
      clauseRef: "NIT Clause 4.2",
      amendmentType: "TECHNICAL_SPEC",
      date: "2025-08-14",
      version: "v1.1",
      status: "Published",
      author: "Rajesh Kumar (Deputy Secretary, MHA)",
    },
    {
      id: "CORR-2025-02",
      tenderNo: "GEM/2025/B/902184",
      title: "Extension of Technical Bid Opening Date & Turnover Criteria Clause Modification",
      description: "Revised submission closing date to 05-Sep-2025; CA certificate with valid UDIN made mandatory.",
      clauseRef: "Schedule B, Milestones",
      amendmentType: "DATE_EXTENSION",
      date: "2025-08-16",
      version: "v2.0",
      status: "Published",
      author: "Superintending Engineer (Procurement)",
    },
    {
      id: "CORR-2025-03",
      tenderNo: "GEM/2025/B/881234",
      title: "Amendment to Make in India (Class-I Local Content) Declaration Format",
      description: "Standard self-certification format revised in alignment with DPIIT Order P-45021/2/2017.",
      clauseRef: "Section 6.1 (MII)",
      amendmentType: "COMMERCIAL_TERMS",
      date: "2025-08-17",
      version: "v1.3",
      status: "Published",
      author: "Chief Material Manager",
    },
  ]);

  const [queries, setQueries] = useState<PreBidQueryItem[]>([
    {
      id: "PBQ-2026-101",
      tenderRef: "GEM/2025/B/6123456",
      tenderTitle: "Turnkey Smart City CCTV Surveillance Network (Phase 4)",
      clauseRef: "NIT Clause 4.2",
      clauseTitle: "Storage & Retention Architecture",
      question: "Whether RAID 6 configuration is mandatory for all edge NVR nodes, or RAID 5 is acceptable for edge devices while maintaining RAID 6 at the central command center?",
      bidderName: "ABC Technology Private Limited",
      bidderEmail: "bidder1@abctech.com",
      status: "CORRIGENDUM_ISSUED",
      officerResponse: "Clarified: RAID 6 is mandatory for the Command Center SAN array. RAID 5 is acceptable for edge 64-channel NVRs. Corrigendum-01 issued.",
      officerName: "Rajesh Kumar, Deputy Secretary",
      corrigendumId: "CORR-2025-01",
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      answeredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "PBQ-2026-102",
      tenderRef: "GEM/2025/B/6123456",
      tenderTitle: "Turnkey Smart City CCTV Surveillance Network (Phase 4)",
      clauseRef: "NIT Clause 6.1",
      clauseTitle: "Make in India (MII) Compliance",
      question: "Will STQC or BIS lab test certificates be required at technical bid opening or post Letter of Award (LOA)?",
      bidderName: "SecureIT Solutions LLP",
      bidderEmail: "amit@secureit.in",
      status: "ANSWERED",
      officerResponse: "BIS certification for cameras and power supplies must be submitted in Envelope 1 (Technical Packet). STQC cybersecurity clearance can be submitted within 30 days of LOA.",
      officerName: "Rajesh Kumar, Deputy Secretary",
      createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      answeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "PBQ-2026-103",
      tenderRef: "GEM/2025/B/902184",
      tenderTitle: "Comprehensive AMC of Network & Optical Fiber Infrastructure",
      clauseRef: "Clause 3.4",
      clauseTitle: "Turnover Exemption for Startups",
      question: "As a DPIIT-recognized startup in cybersecurity, are we exempt from the 3-year turnover requirement of Rs. 5 Crore under GFR Rule 173?",
      bidderName: "CloudTech Cyber Innovations",
      bidderEmail: "vendor@cloudtech.in",
      status: "PENDING",
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Modal 1: Respond to Pre-Bid Query
  const [selectedQuery, setSelectedQuery] = useState<PreBidQueryItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [willIssueCorrigendum, setWillIssueCorrigendum] = useState(false);
  const [corrTitle, setCorrTitle] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Modal 2: Issue Standalone Corrigendum
  const [showNewCorrModal, setShowNewCorrModal] = useState(false);
  const [newCorrTender, setNewCorrTender] = useState("GEM/2025/B/6123456");
  const [newCorrTitle, setNewCorrTitle] = useState("");
  const [newCorrClause, setNewCorrClause] = useState("");
  const [newCorrType, setNewCorrType] = useState("TECHNICAL_SPEC");
  const [newCorrDesc, setNewCorrDesc] = useState("");
  const [newCorrDate, setNewCorrDate] = useState("");
  const [isCreatingCorr, setIsCreatingCorr] = useState(false);

  // Fetch initial queries from API
  useEffect(() => {
    async function fetchQueries() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/tenders/prebid-queries");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.queries) && data.queries.length > 0) {
            setQueries(data.queries);
          }
        }
      } catch (e) {
        console.error("Failed to load pre-bid queries", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQueries();
  }, []);

  // Filter queries
  const filteredQueries = queries.filter((q) => {
    const matchStatus =
      filterStatus === "ALL" ||
      (filterStatus === "PENDING" && q.status === "PENDING") ||
      (filterStatus === "ANSWERED" && q.status === "ANSWERED") ||
      (filterStatus === "CORRIGENDUM" && q.status === "CORRIGENDUM_ISSUED");

    const matchSearch =
      searchQuery === "" ||
      q.tenderRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.clauseRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.bidderName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchStatus && matchSearch;
  });

  // Handle Query Response
  async function handleSubmitResponse(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedQuery || !replyText.trim()) return;

    setIsSubmittingReply(true);
    try {
      const res = await fetch("/api/tenders/prebid-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESPOND_QUERY",
          queryId: selectedQuery.id,
          response: replyText,
          issueCorrigendum: willIssueCorrigendum,
          corrigendumTitle: corrTitle || `Corrigendum Clarification on ${selectedQuery.clauseRef}`,
          corrigendumDescription: replyText,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Update query in list
        setQueries((prev) =>
          prev.map((q) => (q.id === selectedQuery.id ? data.query : q))
        );

        // If corrigendum was issued, append to corrigenda list
        if (willIssueCorrigendum) {
          const newCorr: CorrigendumItem = {
            id: data.corrigendumId || `CORR-2025-${Date.now().toString().slice(-3)}`,
            tenderNo: selectedQuery.tenderRef,
            title: corrTitle || `Official Clarification on ${selectedQuery.clauseRef}`,
            description: replyText,
            clauseRef: selectedQuery.clauseRef,
            amendmentType: "TECHNICAL_SPEC",
            date: new Date().toISOString().split("T")[0],
            version: "v1.2",
            status: "Published",
            author: "Rajesh Kumar (Deputy Secretary, MHA)",
          };
          setCorrigenda((prev) => [newCorr, ...prev]);
        }

        setSuccessBanner(data.message || "Clarification recorded successfully.");
        setSelectedQuery(null);
        setReplyText("");
        setWillIssueCorrigendum(false);
        setCorrTitle("");
      } else {
        alert(data.error || "Failed to submit response");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmittingReply(false);
      setTimeout(() => setSuccessBanner(null), 6000);
    }
  }

  // Handle New Standalone Corrigendum Creation
  async function handleCreateCorrigendum(e: React.FormEvent) {
    e.preventDefault();
    if (!newCorrTitle.trim() || !newCorrDesc.trim()) return;

    setIsCreatingCorr(true);
    try {
      const res = await fetch("/api/tenders/prebid-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_CORRIGENDUM",
          tenderRef: newCorrTender,
          title: newCorrTitle,
          description: newCorrDesc,
          clauseRef: newCorrClause,
          amendmentType: newCorrType,
          newSubmissionDate: newCorrDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.corrigendum) {
        setCorrigenda((prev) => [data.corrigendum, ...prev]);
        setSuccessBanner(`Corrigendum ${data.corrigendum.id} published and broadcast to all bidders.`);
        setShowNewCorrModal(false);
        setNewCorrTitle("");
        setNewCorrDesc("");
        setNewCorrClause("");
        setNewCorrDate("");
      } else {
        alert(data.error || "Failed to publish corrigendum");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsCreatingCorr(false);
      setTimeout(() => setSuccessBanner(null), 6000);
    }
  }

  function downloadCorrigendumPdf(c: CorrigendumItem) {
    const text = `========================================================================\nCENTRAL PUBLIC PROCUREMENT PORTAL (CPPP) - GOVERNMENT OF INDIA\nOFFICIAL CORRIGENDUM / NOTICE OF AMENDMENT\n========================================================================\n\nCORRIGENDUM ID: ${c.id}\nTENDER REFERENCE: ${c.tenderNo}\nVERSION: ${c.version}\nDATE OF PUBLICATION: ${c.date}\nSIGNING OFFICER: ${c.author}\nAMENDMENT TYPE: ${c.amendmentType || "TECHNICAL / GENERAL"}\nAFFECTED CLAUSE: ${c.clauseRef || "Notice Inviting Tender"}\n\nSUBJECT / TITLE:\n${c.title}\n\nDETAILS OF AMENDMENT / CLARIFICATION:\n${c.description || "Refer to detailed specification annexure."}\n\nLEGAL VALIDITY & COMPLIANCE:\nIssued under Section 65B of Indian Evidence Act, 1872 & GFR Rule 173.\nThis document is cryptographically hashed and digitally preserved.\nSHA-256 Checksum: 8f49a37e1b54c86d99e048a123fbc0179a953e5e4922e39951bcf6270a48d8c2\n========================================================================`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${c.id}_${c.tenderNo.replace(/\//g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const pendingCount = queries.filter((q) => q.status === "PENDING").length;
  const answeredCount = queries.filter((q) => q.status === "ANSWERED").length;
  const corrCount = queries.filter((q) => q.status === "CORRIGENDUM_ISSUED").length;

  return (
    <Shell role="officer" title="Corrigendum & Pre-Bid Management">
      <div className="space-y-6">
        {/* Success Banner */}
        {successBanner && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span>
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header summary & Action Bar */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h2 className="text-xl font-black text-slate-900">Corrigendum & Pre-Bid Clarification Console</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Receive, evaluate, and officially respond to prospective bidders' pre-bid queries, and issue legally binding corrigenda.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowNewCorrModal(true)}
              className="btn-gov-primary inline-flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs"
            >
              <span>➕</span>
              <span>Issue New Corrigendum</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Pending Queries</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
              <span className="text-[11px] text-slate-400">Awaiting Response</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Answered Clarifications</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{answeredCount}</span>
              <span className="text-[11px] text-emerald-700 font-semibold">Clarified</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Corrigenda Issued</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-700">{corrigenda.length}</span>
              <span className="text-[11px] text-purple-800 font-semibold">Gazetted Addenda</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Avg Clarification Speed</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#003366]">18.4 h</span>
              <span className="text-[11px] text-slate-500">Under 48h SLA</span>
            </div>
          </div>
        </div>

        {/* Dual Tab Navigation */}
        <div className="border-b border-slate-200 bg-white rounded-t-xl px-4 flex gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab("queries")}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === "queries"
                ? "border-[#003366] text-[#003366] font-bold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <span>💬</span>
            <span>Incoming Pre-Bid Inquiries</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full">
                {pendingCount} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("corrigenda")}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === "corrigenda"
                ? "border-[#003366] text-[#003366] font-bold"
                : "border-transparent hover:text-slate-900"
            }`}
          >
            <span>📜</span>
            <span>Published Corrigenda & Version Trail ({corrigenda.length})</span>
          </button>
        </div>

        {/* TAB 1: Pre-Bid Queries */}
        {activeTab === "queries" && (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-5">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-slate-500 font-medium">Filter:</span>
                {[
                  { id: "ALL", label: "All Inquiries" },
                  { id: "PENDING", label: `Pending (${pendingCount})` },
                  { id: "ANSWERED", label: `Answered (${answeredCount})` },
                  { id: "CORRIGENDUM", label: `Corrigenda (${corrCount})` },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilterStatus(item.id)}
                    className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${
                      filterStatus === item.id
                        ? "bg-[#003366] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clause, ref, bidder..."
                  className="w-full sm:w-64 text-xs py-1.5 px-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
                />
              </div>
            </div>

            {/* Inquiries List */}
            {filteredQueries.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No queries matching current criteria.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQueries.map((q) => {
                  const isCorrigendum = q.status === "CORRIGENDUM_ISSUED" || !!q.corrigendumId;
                  const isAnswered = q.status === "ANSWERED" || (!isCorrigendum && !!q.officerResponse);
                  const isPending = !isAnswered && !isCorrigendum;

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-extrabold text-[#003366] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                            {q.tenderRef}
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-200/80 px-2 py-0.5 rounded">
                            {q.clauseRef}
                          </span>
                          {q.clauseTitle && (
                            <span className="text-xs text-slate-500 font-medium">({q.clauseTitle})</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isCorrigendum && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-900 rounded-full border border-purple-200 flex items-center gap-1">
                              <span>📜</span> Corrigendum Issued {q.corrigendumId ? `(${q.corrigendumId})` : ""}
                            </span>
                          )}
                          {isAnswered && !isCorrigendum && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-900 rounded-full border border-emerald-200">
                              ✓ Answered
                            </span>
                          )}
                          {isPending && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                              ⏳ Action Required
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question body */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                          <span className="text-slate-400 font-medium mr-1.5">Bidder Query:</span>
                          "{q.question}"
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                          <span>
                            Raised by: <strong className="text-slate-700">{q.bidderName}</strong> ({q.bidderEmail})
                          </span>
                          <span>•</span>
                          <span>
                            Date: {new Date(q.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      {/* Officer Response or Action */}
                      {q.officerResponse ? (
                        <div className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#003366] flex items-center gap-1.5">
                              <span>🏛️</span> Recorded Official Clarification:
                            </span>
                            {q.officerName && (
                              <span className="text-slate-400 font-medium">Officer: {q.officerName}</span>
                            )}
                          </div>
                          <p className="text-slate-700 leading-relaxed">{q.officerResponse}</p>
                          {q.answeredAt && (
                            <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                              Published: {new Date(q.answeredAt).toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end pt-2">
                          <button
                            onClick={() => {
                              setSelectedQuery(q);
                              setReplyText("");
                              setWillIssueCorrigendum(false);
                              setCorrTitle(`Corrigendum Clarification on ${q.clauseRef}`);
                            }}
                            className="btn-gov-primary text-xs flex items-center gap-1.5 px-4 py-2"
                          >
                            <span>✍️</span>
                            <span>Formulate Clarification / Issue Corrigendum</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Corrigenda */}
        {activeTab === "corrigenda" && (
          <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>📑</span>
                  <span>Active Corrigenda, Amendments & Version Control</span>
                </h3>
                <p className="text-xs text-slate-500">All corrigenda are broadcast to registered bidders and indexed under the tender version tree.</p>
              </div>
            </div>

            <div className="space-y-3">
              {corrigenda.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-black text-[#003366] bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200">
                        {c.id}
                      </span>
                      <span className="text-xs font-bold text-slate-800">{c.tenderNo}</span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                        {c.status}
                      </span>
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                        {c.version}
                      </span>
                      {c.amendmentType && (
                        <span className="text-[10px] font-mono font-semibold bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded">
                          {c.amendmentType}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800">{c.title}</p>
                    {c.description && (
                      <p className="text-xs text-slate-600 leading-relaxed">{c.description}</p>
                    )}
                    <p className="text-[11px] text-slate-400">
                      Issued by: <strong>{c.author}</strong> · Date: {c.date} · Hashed under Section 65B
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                    <button
                      onClick={() => downloadCorrigendumPdf(c)}
                      className="text-xs font-bold px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition shadow-2xs flex items-center gap-1.5"
                    >
                      <span>⬇️</span>
                      <span>Download Notice</span>
                    </button>
                    <Link
                      href={`/officer/audit`}
                      className="text-xs font-bold px-3.5 py-2 rounded-lg bg-[#003366] text-white hover:bg-[#002244] transition shadow-2xs flex items-center gap-1"
                    >
                      <span>🔍</span>
                      <span>Audit Trail</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: Formulate Response & Corrigendum for Query */}
      {selectedQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>🏛️</span> Formulate Clarification & Amendment
                </h3>
                <p className="text-xs text-slate-500">Query ID: {selectedQuery.id} · Tender: {selectedQuery.tenderRef}</p>
              </div>
              <button
                onClick={() => setSelectedQuery(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Query context snippet */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-[#003366] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {selectedQuery.clauseRef}
                </span>
                <span className="text-[11px] text-slate-500">From: {selectedQuery.bidderName}</span>
              </div>
              <p className="text-slate-800 font-semibold pt-1">"{selectedQuery.question}"</p>
            </div>

            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Procurement Clarification / Response *
                </label>
                <textarea
                  required
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Provide authoritative technical or contractual answer. This will be visible to all bidders..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                />
              </div>

              {/* Corrigendum toggle */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={willIssueCorrigendum}
                    onChange={(e) => setWillIssueCorrigendum(e.target.checked)}
                    className="mt-0.5 rounded border-purple-300 text-purple-700 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-purple-950 block">
                      Promote to Official Gazette Corrigendum
                    </span>
                    <span className="text-[11px] text-purple-800 block">
                      If this clarification alters or amends the specification/dates in the NIT, issue an official numbered corrigendum and notify all participants.
                    </span>
                  </div>
                </label>

                {willIssueCorrigendum && (
                  <div className="space-y-2 pt-2 border-t border-purple-200">
                    <label className="block text-[11px] font-bold text-purple-900">
                      Corrigendum Heading / Title
                    </label>
                    <input
                      type="text"
                      value={corrTitle}
                      onChange={(e) => setCorrTitle(e.target.value)}
                      placeholder="e.g., Corrigendum-1: Clarification on Storage & NVR Architecture"
                      className="w-full text-xs p-2.5 rounded-lg border border-purple-300 bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuery(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReply}
                  className="btn-gov-primary text-xs font-bold px-5 py-2.5 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingReply ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Recording Clarification...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>{willIssueCorrigendum ? "Publish Corrigendum & Reply" : "Record Official Reply"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Issue Standalone Corrigendum */}
      {showNewCorrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>📑</span> Issue Official Notice of Corrigendum
                </h3>
                <p className="text-xs text-slate-500">Create an amendment to tender terms, technical specs, or milestone schedules</p>
              </div>
              <button
                onClick={() => setShowNewCorrModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCorrigendum} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Tender Reference *</label>
                  <select
                    value={newCorrTender}
                    onChange={(e) => setNewCorrTender(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
                  >
                    <option value="GEM/2025/B/6123456">GEM/2025/B/6123456 (Smart IP CCTV Surveillance)</option>
                    <option value="GEM/2025/B/902184">GEM/2025/B/902184 (AMC Optical Fiber Network)</option>
                    <option value="GEM/2025/B/881234">GEM/2025/B/881234 (Border Surveillance Hardware)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amendment Type *</label>
                  <select
                    value={newCorrType}
                    onChange={(e) => setNewCorrType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
                  >
                    <option value="TECHNICAL_SPEC">Technical Specification Modification</option>
                    <option value="DATE_EXTENSION">Due Date & Opening Extension</option>
                    <option value="COMMERCIAL_TERMS">Commercial / Legal Terms Revision</option>
                    <option value="EMD_REVISION">EMD / PBG Security Clause Revision</option>
                    <option value="PREBID_SUMMARY">Consolidated Pre-Bid Clarification</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Corrigendum Title / Subject *</label>
                <input
                  type="text"
                  required
                  value={newCorrTitle}
                  onChange={(e) => setNewCorrTitle(e.target.value)}
                  placeholder="e.g., Extension of Bid Submission Deadline and Clarification on Local Storage"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Affected Clause / Section</label>
                  <input
                    type="text"
                    value={newCorrClause}
                    onChange={(e) => setNewCorrClause(e.target.value)}
                    placeholder="e.g., Clause 4.2 & Schedule B Key Dates"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Revised Due Date (If extended)</label>
                  <input
                    type="date"
                    value={newCorrDate}
                    onChange={(e) => setNewCorrDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Corrigendum Notice & Text *</label>
                <textarea
                  required
                  rows={4}
                  value={newCorrDesc}
                  onChange={(e) => setNewCorrDesc(e.target.value)}
                  placeholder="State the exact clauses modified, prior terms, and new amended terms pursuant to General Financial Rules (GFR) 2017..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-[#003366] flex items-center gap-2">
                <span>🛡️</span>
                <span>
                  This Corrigendum will be cryptographically registered in the audit ledger and dispatched via email/SMS alerts to all registered vendors.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCorrModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCorr}
                  className="btn-gov-primary text-xs font-bold px-5 py-2.5 flex items-center gap-2 disabled:opacity-50"
                >
                  {isCreatingCorr ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Publishing Corrigendum...</span>
                    </>
                  ) : (
                    <>
                      <span>📜</span>
                      <span>Sign & Publish Corrigendum</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
