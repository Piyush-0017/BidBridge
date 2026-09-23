"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import Link from "next/link";

interface Clarification {
  id: string;
  bidId: string;
  tenderRef: string;
  query: string;
  clauseRef: string;
  deadlineHours: number;
  deadlineAt: string;
  status: "PENDING_BIDDER" | "RESOLVED" | "REJECTED";
  officerName: string;
  response?: {
    explanation: string;
    submittedAt: string;
    documentName?: string;
  };
}

export default function NotificationsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [clarifications, setClarifications] = useState<Clarification[]>([]);
  const [activeClarification, setActiveClarification] = useState<Clarification | null>(null);
  const [replyText, setReplyText] = useState("");
  const [docName, setDocName] = useState("Rectified_MAF_Certificate.pdf");
  const [eSigned, setESigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  function load() {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch("/api/clarifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClarifications(data);
          const pending = data.find((c) => c.status === "PENDING_BIDDER");
          if (pending && !activeClarification) {
            setActiveClarification(pending);
          }
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id?: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : { all: true }),
    });
    setMsg(id ? "Marked as read" : "All marked as read");
    setTimeout(() => setMsg(""), 3000);
    load();
  }

  async function submitClarificationResponse(e: React.FormEvent) {
    e.preventDefault();
    if (!activeClarification) return;
    if (!replyText.trim()) {
      alert("Please provide a written response.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/clarifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeClarification.id,
          explanation: replyText,
          documentName: docName,
        }),
      });

      if (res.ok) {
        setMsg("✅ Clarification response successfully signed and submitted to Tender Committee!");
        setActiveClarification(null);
        setReplyText("");
        load();
      } else {
        alert("Failed to submit clarification.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMsg(""), 5000);
    }
  }

  const pendingClarifications = clarifications.filter((c) => c.status === "PENDING_BIDDER");
  const unread = items.filter((n) => !n.read).length;

  return (
    <Shell
      role="bidder"
      title="Notification Center & Clarification Notices"
      subtitle="Statutory alerts, evaluation updates, and official committee queries under Rule 173 GFR"
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {msg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <span>✓</span>
            <span>{msg}</span>
          </div>
        )}

        {/* Priority Clarification Notice Banner (If any pending) */}
        {pendingClarifications.length > 0 && (
          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border-2 border-amber-300 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl animate-bounce">⚠️</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-900 uppercase tracking-wider">
                      Official Clarification Notice
                    </span>
                    <span className="text-[10px] font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                      Action Required: 38h Left
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 mt-0.5">
                    {pendingClarifications[0].tenderRef} · {pendingClarifications[0].clauseRef}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setActiveClarification(pendingClarifications[0])}
                className="btn-primary text-xs font-bold px-4 py-2 rounded-xl shadow-xs self-start md:self-auto"
              >
                Respond to Committee Query →
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-white/90 border border-amber-200 text-xs text-slate-800 font-medium">
              <span className="font-bold text-amber-900 block mb-1">Committee Observation:</span>
              "{pendingClarifications[0].query}"
            </div>
          </div>
        )}

        {/* Modal / Inline Response Box */}
        {activeClarification && (
          <div className="p-6 rounded-2xl bg-white border-2 border-[#003366] shadow-md space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#003366] uppercase tracking-wider">
                  Drafting Clarification Submission
                </span>
                <h3 className="text-sm font-black text-slate-900">
                  Tender: {activeClarification.tenderRef} ({activeClarification.id})
                </h3>
              </div>
              <button
                onClick={() => setActiveClarification(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <p className="font-bold text-slate-900 mb-1">Query Raised by {activeClarification.officerName}:</p>
              <p className="italic">"{activeClarification.query}"</p>
            </div>

            <form onSubmit={submitClarificationResponse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Official Clarification Statement / Justification *
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Enter detailed clarification response addressing the committee's observation (e.g., explaining trade name alignment or attaching validity extension letter)..."
                  className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Attach Supporting Document / Rectified Annexure (.PDF)
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📄</span>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full text-xs font-mono p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <span className="text-[10px] font-bold bg-blue-100 text-[#003366] px-2 py-1 rounded shrink-0">
                    Ready to Attach
                  </span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  required
                  checked={eSigned}
                  onChange={(e) => setESigned(e.target.checked)}
                  className="w-4 h-4 accent-[#003366] rounded"
                />
                <span className="font-semibold">
                  I solemnly declare under IT Act 2000 that the above clarification is true and complete to the best of my knowledge.
                </span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveClarification(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <span>{submitting ? "Signing & Transmitting..." : "🔏 Submit Signed Response"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Notifications Feed */}
        <div className="card p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">Procurement & Evaluation Timeline</h3>
              <p className="text-xs text-slate-400">Live notifications from CPPP, GeM & Committee Officers</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">{unread} unread</span>
              {unread > 0 && (
                <button
                  onClick={() => markRead()}
                  className="text-xs font-bold text-[#003366] hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {items.length === 0 && (
              <p className="p-8 text-center text-xs text-slate-400">No new notifications in mailbox.</p>
            )}

            {items.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition ${
                  n.read
                    ? "bg-white border-slate-200"
                    : "bg-blue-50/60 border-blue-200 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{n.title}</span>
                      {!n.read && (
                        <span className="text-[9px] font-extrabold bg-[#003366] text-white px-1.5 py-0.2 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(n.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    {n.link && (
                      <Link
                        href={n.link}
                        className="text-xs font-bold text-[#003366] hover:underline flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <span>→</span>
                      </Link>
                    )}
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
