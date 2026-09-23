"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { generateLetterOfAward, generateComparativeStatement, downloadReport } from "@/lib/reports";

function DecisionContent() {
  const searchParams = useSearchParams();
  const initialBidId = searchParams.get("bidId") || "";
  const initialTab = searchParams.get("tab") || "decision";
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const [bids, setBids] = useState<any[]>([]);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [clarifications, setClarifications] = useState<any[]>([]);
  const [newClarification, setNewClarification] = useState({
    bidId: "",
    tenderRef: "GEM/2025/B/902184",
    bidderName: "ABC Technology Private Limited",
    clauseRef: "Rule 173 GFR / Clause 4.3",
    query: "",
    deadlineHours: 48,
  });
  const [form, setForm] = useState({
    bidId: initialBidId,
    decision: "QUALIFY",
    reason: "Technical proposal and commercial declarations comply with all NIT requirements. Verified and approved for Packet B opening.",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    fetch("/api/bids")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBids(list);
        if (initialBidId && list.some((b) => b.id === initialBidId)) {
          setForm((prev) => ({ ...prev, bidId: initialBidId }));
        } else if (list.length > 0 && !form.bidId) {
          setForm((prev) => ({ ...prev, bidId: list[0].id }));
        }
      })
      .catch(() => {});

    fetch("/api/decisions")
      .then((r) => r.json())
      .then((data) => setDecisions(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch("/api/clarifications")
      .then((r) => r.json())
      .then((data) => setClarifications(Array.isArray(data) ? data : []))
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateClarification(e: React.FormEvent) {
    e.preventDefault();
    if (!newClarification.query) return;
    try {
      const res = await fetch("/api/clarifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClarification),
      });
      if (res.ok) {
        setMsg("✅ Clarification notice officially dispatched to bidder with 48-hour deadline.");
        setNewClarification({ ...newClarification, query: "" });
        load();
        setTimeout(() => setMsg(""), 4000);
      }
    } catch {
      alert("Failed to issue clarification");
    }
  }

  async function handleClarificationAction(id: string, action: "ACCEPT" | "REJECT") {
    try {
      const res = await fetch("/api/clarifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        setMsg(`Clarification marked as ${action === "ACCEPT" ? "RESOLVED & ACCEPTED" : "REJECTED"}.`);
        load();
        setTimeout(() => setMsg(""), 4000);
      }
    } catch {}
  }

  const selectedBid = bids.find((b) => b.id === form.bidId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Failed to record decision");
        return;
      }
      setMsg(`Decision recorded successfully: ${form.decision}. Bid status updated.`);
      load();
    } catch {
      setMsg("Network error occurred");
    } finally {
      setLoading(false);
    }
  }

  function handleDownloadLOA(bid: any) {
    const text = generateLetterOfAward(
      {
        referenceNo: bid?.tender?.referenceNo || "GEM/2025/B/902184",
        title: bid?.tender?.title || "Enterprise Cloud Infrastructure & Server Cluster",
        department: bid?.tender?.department || "Directorate of Public Procurement & IT",
      },
      {
        evaluatedPrice: bid?.evaluatedValue || 11850000,
        bidder: {
          name: bid?.bidder?.bidderProfile?.companyName || bid?.bidder?.name || "ABC Technology Pvt Ltd",
          bidderProfile: {
            companyName: bid?.bidder?.bidderProfile?.companyName || "ABC Technology Pvt Ltd",
            gstin: "27AAACA9821R1ZX",
            pan: "AAACA9821R",
            address: "Tech Zone IV, Electronic City, Bengaluru 560100",
          },
        },
      },
      "Rajesh Kumar, Deputy Secretary (Procurement)"
    );
    downloadReport(text, `Official_LOA_${(bid?.tender?.referenceNo || "Tender").replace(/\//g, "_")}.txt`);
  }

  function handleDownloadCSQ(bid: any) {
    const ranked = [
      {
        bidder: { name: "ABC Technology Pvt Ltd", bidderProfile: { companyName: "ABC Technology Pvt Ltd" } },
        evaluatedPrice: 11850000,
        deviation: "-5.20% (L1)",
        status: "L1_RESPONSIVE",
        savingsPercent: "5.20%",
      },
      {
        bidder: { name: "SecureIT Solutions LLP", bidderProfile: { companyName: "SecureIT Solutions LLP" } },
        evaluatedPrice: 12100000,
        deviation: "-3.20% (L2)",
        status: "QUALIFIED",
      },
      {
        bidder: { name: "Bharat Telecom Networks", bidderProfile: { companyName: "Bharat Telecom Networks" } },
        evaluatedPrice: 12420000,
        deviation: "-0.64% (L3)",
        status: "QUALIFIED",
      },
    ];
    const text = generateComparativeStatement(
      {
        referenceNo: bid?.tender?.referenceNo || "GEM/2025/B/902184",
        title: bid?.tender?.title || "Enterprise Cloud Infrastructure & Server Cluster",
        estimatedValue: 12500000,
      },
      ranked
    );
    downloadReport(text, `Comparative_Statement_${(bid?.tender?.referenceNo || "Tender").replace(/\//g, "_")}.txt`);
  }

  return (
    <Shell
      role="officer"
      title="Officer Evaluation & Approval Console"
      subtitle="Statutory bid qualification, rejection, and clarification orders under Indian Procurement Rules"
    >
      <div className="space-y-6">

        {msg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-base">✓</span>
              <span>{msg}</span>
            </div>
            <Link
              href="/bidder/my-bids"
              className="px-3 py-1.5 bg-[#003366] text-white rounded-lg hover:bg-[#0b5cad] transition text-xs font-bold self-start sm:self-auto"
            >
              Verify in Bidder Panel (My Bids) →
            </Link>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("decision")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "decision"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>⚖️</span>
            <span>Record Evaluation Decision</span>
          </button>
          <button
            onClick={() => setActiveTab("final")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "final"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🏆</span>
            <span>Contract Award & Official LOA</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "history"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📜</span>
            <span>Decision History ({decisions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("clarifications")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 shrink-0 ${
              activeTab === "clarifications"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>💬</span>
            <span>Clarifications & Defect Rectification ({clarifications.filter((c) => c.status === "PENDING_BIDDER").length})</span>
          </button>
        </div>

        {activeTab === "decision" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Decision Entry Form */}
          <form onSubmit={submit} className="gov-card p-6 space-y-4">
            <div className="border-b pb-3">
              <h2 className="font-extrabold text-base text-slate-900">Record Officer Evaluation Decision</h2>
              <p className="text-xs text-slate-500">
                Authorized Officer: Rajesh Kumar, Deputy Secretary (Procurement), MHA
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Proposal to Evaluate *
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[#003366]"
                required
                value={form.bidId}
                onChange={(e) => setForm({ ...form, bidId: e.target.value })}
              >
                <option value="">— Select Submitted Proposal —</option>
                {bids.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.tender?.referenceNo || "Tender"} · {b.bidder?.bidderProfile?.companyName || b.bidder?.name} · [{b.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Preview of Selected Bid */}
            {selectedBid && (
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#003366]">Bid Information Preview</span>
                  <span className="gov-badge verified">{selectedBid.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Tender Reference:</span>
                    <strong className="text-slate-900">{selectedBid.tender?.referenceNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Evaluated Price:</span>
                    <strong className="text-[#003366] font-mono">
                      ₹ {Number(selectedBid.evaluatedValue || selectedBid.tender?.estimatedValue || 20558000).toLocaleString("en-IN")}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">AI Compliance Score:</span>
                    <strong className="text-emerald-700">{selectedBid.complianceScore || 98}% Verified</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Risk Assessment:</span>
                    <strong className="text-emerald-800">{selectedBid.riskLevel || "LOW"} Risk</strong>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Statutory Decision *
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 focus:ring-1 focus:ring-[#003366]"
                value={form.decision}
                onChange={(e) => setForm({ ...form, decision: e.target.value })}
              >
                <option value="QUALIFY">✅ QUALIFY (Technically Responsive)</option>
                <option value="DISQUALIFY">❌ DISQUALIFY (Non-Responsive)</option>
                <option value="REQUEST_CLARIFICATION">⚠️ REQUEST CLARIFICATION (Query Raised)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Evaluation Remarks & Official Justification *
              </label>
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#003366]"
                rows={4}
                required
                minLength={5}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Enter statutory justification for qualification or rejection..."
              />
            </div>

            {/* Quick Templates */}
            <div className="flex flex-wrap gap-1.5 text-[10px]">
              <span className="text-slate-400 self-center">Quick remarks:</span>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    decision: "QUALIFY",
                    reason: "Technical proposal and commercial declarations comply with all NIT requirements. Verified and approved for Packet B opening.",
                  })
                }
                className="px-2 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
              >
                Full Qualification
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    decision: "DISQUALIFY",
                    reason: "Bidder failed to meet mandatory technical parameter Clause 3.2 (RAID 6 hot-swap) and did not provide OEM authorization.",
                  })
                }
                className="px-2 py-1 rounded bg-red-50 text-red-800 border border-red-200 hover:bg-red-100"
              >
                Technical Disqualification
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    decision: "REQUEST_CLARIFICATION",
                    reason: "Clarification requested regarding Make-In-India local content calculation breakdown within 48 hours.",
                  })
                }
                className="px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
              >
                Request Clarification
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#003366] hover:bg-[#0b5cad] text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? "Recording Decision in Database..." : "Save Official Officer Decision"}
              </button>
            </div>
          </form>

          {/* Recent Decisions Feed */}
          <div className="gov-card p-6 space-y-4">
            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-base text-slate-900">Recorded Decision History</h2>
                <p className="text-xs text-slate-500">Cryptographically signed evaluation records</p>
              </div>
              <span className="gov-badge verified">{decisions.length} Decisions</span>
            </div>

            {decisions.length === 0 ? (
              <p className="text-xs text-slate-500 p-6 text-center">No decisions recorded yet.</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {decisions.map((d) => (
                  <div key={d.id} className="border border-slate-200 rounded-xl p-4 text-xs bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase ${
                          d.decision === "QUALIFY"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : d.decision === "DISQUALIFY"
                            ? "bg-red-100 text-red-800 border border-red-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300"
                        }`}
                      >
                        {d.decision}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(d.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900">
                      {d.bid?.tender?.referenceNo || "Central Procurement"}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      Bidder: {d.bid?.bidder?.bidderProfile?.companyName || d.bid?.bidder?.name || "ABC Tech Solutions Private Limited"}
                    </div>
                    <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 font-medium italic">
                      "{d.reason}"
                    </p>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Evaluated by {d.officer?.name || "Rajesh Kumar (Deputy Secretary)"}</span>
                      <span className="text-emerald-700 font-semibold">✓ Synced to Bidder Portal</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => handleDownloadLOA(d.bid)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-100/80 text-[#003366] hover:bg-blue-200 transition flex items-center gap-1"
                      >
                        <span>📄</span> Download LOA
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadCSQ(d.bid)}
                        className="text-[10px] font-bold px-2.5 py-1 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 transition flex items-center gap-1"
                      >
                        <span>📊</span> Download CSQ Statement
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* TAB 2: FINAL CONTRACT AWARD & LOA */}
        {activeTab === "final" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="gov-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <h3 className="text-sm font-black text-slate-900">Official Contract Award & Letter of Award (LOA) Console</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Issue statutory LOA to lowest evaluated responsive L1 bidder pursuant to Rule 173 GFR 2017 & CVC guidelines.
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadLOA(bids.find((b) => b.status === "TECHNICALLY_QUALIFIED") || bids[0])}
                  className="px-4 py-2 rounded-xl bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
                >
                  <span>📜</span> Download Official LOA PDF/Text
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Selected L1 Contractor</span>
                  <span className="text-sm font-black text-emerald-950 mt-1 block">ABC Technology Private Limited</span>
                  <span className="text-[10px] text-emerald-700 font-mono">GST: 27AAACA9821R1ZX · MSME Class-I</span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Evaluated Contract Price</span>
                  <span className="text-sm font-black text-blue-950 mt-1 block">₹1,18,50,000</span>
                  <span className="text-[10px] text-blue-700 font-medium">5.20% below estimated budget</span>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                  <span className="text-[10px] font-bold text-purple-800 uppercase block">Performance Security (PBG)</span>
                  <span className="text-sm font-black text-purple-950 mt-1 block">₹5,92,500 (5%)</span>
                  <span className="text-[10px] text-purple-700 font-medium">To be deposited within 14 days</span>
                </div>
              </div>

              {/* LOA Summary Preview */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
                <div className="font-bold text-slate-900 border-b border-slate-300 pb-2">
                  GOVERNMENT OF INDIA · MINISTRY OF HOME AFFAIRS · PROCUREMENT DIVISION
                </div>
                <p>Ref: GEM/2025/B/902184/LOA/01 | Date: {new Date().toLocaleDateString("en-IN")}</p>
                <p>To: M/s ABC Technology Private Limited, Tech Zone IV, Bengaluru 560100</p>
                <p className="font-semibold text-slate-900 pt-1">
                  Subject: Letter of Award (LOA) for Supply, Commissioning & Turnkey Support of Enterprise IT Infrastructure.
                </p>
                <p className="text-slate-600 leading-relaxed pt-1">
                  Dear Sir/Madam, With reference to Tender Enquiry GEM/2025/B/902184 and your commercial proposal opened on 10-Mar-2025,
                  the Competent Authority is pleased to accept your bid at evaluated contract value of ₹1,18,50,000 (Inclusive of all statutory taxes).
                  You are hereby requested to furnish Performance Bank Guarantee (PBG) of 5% within 14 days of receipt of this notice.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COMMITTEE DECISION HISTORY */}
        {activeTab === "history" && (
          <div className="gov-card overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recorded Committee Decisions & Audit History</h3>
                <p className="text-xs text-slate-500">Official ledger of qualification, disqualification, and clarification notices</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900">
                Total Decisions: {decisions.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Bid ID</th>
                    <th className="p-3.5">Decision Verdict</th>
                    <th className="p-3.5">Officer Signatory</th>
                    <th className="p-3.5">Statutory Justification Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {decisions.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                        {new Date(d.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">{d.bidId}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide ${
                            d.decision === "QUALIFY"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : d.decision === "DISQUALIFY"
                              ? "bg-rose-100 text-rose-900 border border-rose-300"
                              : "bg-amber-100 text-amber-900 border border-amber-300"
                          }`}
                        >
                          {d.decision}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-800">{d.officer?.name || "Rajesh Kumar"}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{d.officer?.email || "officer@sih.gov.in"}</span>
                      </td>
                      <td className="p-3.5 text-slate-700 max-w-[320px]">{d.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {decisions.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">No decision records found yet.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CLARIFICATIONS & DEFECT RECTIFICATION */}
        {activeTab === "clarifications" && (
          <div className="grid gap-6 lg:grid-cols-2 animate-fadeIn">
            {/* Dispatch Form */}
            <form onSubmit={handleCreateClarification} className="gov-card p-6 space-y-4">
              <div className="border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📢</span>
                  <h2 className="font-extrabold text-base text-slate-900">Issue Clarification / Defect Notice</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mandatory under Rule 173 GFR 2017 & CVC Procurement Guidelines prior to technical disqualification.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Tender Reference</label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800"
                  value={newClarification.tenderRef}
                  onChange={(e) => setNewClarification({ ...newClarification, tenderRef: e.target.value })}
                  placeholder="e.g. GEM/2025/B/902184"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bidder Legal Name</label>
                <input
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800"
                  value={newClarification.bidderName}
                  onChange={(e) => setNewClarification({ ...newClarification, bidderName: e.target.value })}
                  placeholder="e.g. ABC Technology Private Limited"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clause Violation / Query Type</label>
                  <input
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800"
                    value={newClarification.clauseRef}
                    onChange={(e) => setNewClarification({ ...newClarification, clauseRef: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Response Window Deadline</label>
                  <select
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 bg-white"
                    value={newClarification.deadlineHours}
                    onChange={(e) => setNewClarification({ ...newClarification, deadlineHours: Number(e.target.value) })}
                  >
                    <option value={24}>24 Hours (Urgent)</option>
                    <option value={48}>48 Hours (Standard GFR)</option>
                    <option value={72}>72 Hours (Extended Complex)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Statutory Query & Defect Description *</label>
                <textarea
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-[#003366]"
                  rows={4}
                  required
                  value={newClarification.query}
                  onChange={(e) => setNewClarification({ ...newClarification, query: e.target.value })}
                  placeholder="Specify exact clause, deficiency noted in technical packet, and required rectification document..."
                />
              </div>

              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Dispatches In-App alert, TRAI DLT SMS & CPPP email</span>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span>📤</span> Dispatch Statutory Notice
                </button>
              </div>
            </form>

            {/* Clarification Tracking Stream */}
            <div className="gov-card p-6 space-y-4">
              <div className="border-b pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Active Clarification Notices</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Live tracking of 48-hour response windows</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900">
                  {clarifications.length} Total
                </span>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                {clarifications.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500 font-bold">
                        {c.id} · {c.tenderRef}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          c.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.status === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-200 text-amber-900 animate-pulse"
                        }`}
                      >
                        {c.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="font-bold text-slate-900">{c.bidderName}</p>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                      <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Query ({c.clauseRef}):</span>
                      "{c.query}"
                    </div>

                    {c.response ? (
                      <div className="p-3 rounded-lg bg-emerald-100/70 border border-emerald-300 text-emerald-900 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[11px] uppercase text-emerald-950">✓ Bidder Response:</span>
                          <span className="text-[10px] font-mono text-emerald-800">
                            {new Date(c.response.submittedAt).toLocaleTimeString("en-IN")} IST
                          </span>
                        </div>
                        <p className="italic text-xs">"{c.response.explanation}"</p>
                        {c.response.documentName && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900 pt-1">
                            <span>📎 Rectified Attachment:</span>
                            <span className="underline font-mono">{c.response.documentName}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-800 font-semibold flex items-center justify-between pt-1">
                        <span>⏳ Awaiting bidder reply</span>
                        <span>Deadline: {c.deadlineHours}h from issue</span>
                      </div>
                    )}

                    {c.response && c.status === "PENDING_BIDDER" && (
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => handleClarificationAction(c.id, "ACCEPT")}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs"
                        >
                          ✓ Accept Clarification
                        </button>
                        <button
                          onClick={() => handleClarificationAction(c.id, "REJECT")}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white"
                        >
                          ✕ Reject & Disqualify
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </Shell>
  );
}

export default function DecisionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Officer Decision Console...</div>}>
      <DecisionContent />
    </Suspense>
  );
}
