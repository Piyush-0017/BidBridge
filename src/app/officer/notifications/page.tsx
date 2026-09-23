"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import {
  Bell,
  Mail,
  Smartphone,
  Send,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function OfficerNotifications() {
  const [activeTab, setActiveTab] = useState<"inapp" | "outbox">("inapp");
  const [items, setItems] = useState<any[]>([]);
  const [outbox, setOutbox] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingDispatch, setTestingDispatch] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testStatus, setTestStatus] = useState<string | null>(null);

  function load() {
    setLoading(true);
    Promise.all([
      fetch("/api/notifications").then((r) => r.json()),
      fetch("/api/notifications/outbox").then((r) => r.json()),
    ])
      .then(([notifs, outboxData]) => {
        setItems(Array.isArray(notifs) ? notifs : []);
        setOutbox(Array.isArray(outboxData) ? outboxData : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    load();
  }

  async function sendTestNotification(e: React.FormEvent) {
    e.preventDefault();
    setTestingDispatch(true);
    setTestStatus(null);
    try {
      const res = await fetch("/api/notifications/outbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail || undefined,
          subject: "Statutory Verification Channel Test",
          message: "Statutory multi-channel notification engine is operational with Resend and PostgreSQL persistence.",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTestStatus("✅ Statutory notification successfully dispatched and queued in outbox ledger!");
        setTestEmail("");
        load();
      } else {
        setTestStatus(`❌ Error: ${data.error || "Dispatch failed"}`);
      }
    } catch (err: any) {
      setTestStatus(`❌ Network error: ${err.message}`);
    } finally {
      setTestingDispatch(false);
    }
  }

  return (
    <Shell
      role="officer"
      title="Notifications & Statutory Outbox Ledger"
      subtitle="Official multi-channel notification stream and TRAI DLT/Resend statutory dispatch log"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 flex items-center justify-between bg-white px-4 pt-3 rounded-t-xl">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab("inapp")}
              className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === "inapp"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>In-App Notifications ({items.filter((i) => !i.read).length} Unread)</span>
            </button>
            <button
              onClick={() => setActiveTab("outbox")}
              className={`pb-3 px-4 border-b-2 transition flex items-center gap-2 ${
                activeTab === "outbox"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Statutory Outbox Ledger ({outbox.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            {activeTab === "inapp" && (
              <button
                onClick={markAll}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={load}
              className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Tab 1: In-App Notifications */}
        {activeTab === "inapp" && (
          <div className="gov-card overflow-hidden">
            <div className="divide-y divide-slate-100">
              {items.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No notifications currently in mailbox.
                </div>
              )}
              {items.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 transition ${
                    n.read ? "bg-white hover:bg-slate-50" : "bg-blue-50/60 hover:bg-blue-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pl-4">{n.message}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 flex-shrink-0">
                      {new Date(n.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Statutory Outbox Ledger */}
        {activeTab === "outbox" && (
          <div className="space-y-6">
            {/* Test Email Dispatch Card */}
            <div className="gov-card p-5 bg-gradient-to-br from-white to-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-4 h-4 text-[#003366]" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Test Statutory Channel Dispatch
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Verify the live Resend API channel or local dispatch stream by sending an instant test notice.
              </p>

              <form onSubmit={sendTestNotification} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Recipient Email (defaults to your registered email)"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-[#003366]"
                />
                <button
                  type="submit"
                  disabled={testingDispatch}
                  className="px-4 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold hover:bg-[#002244] transition flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testingDispatch ? "Dispatching..." : "Send Test Notice"}</span>
                </button>
              </form>

              {testStatus && (
                <div
                  className={`mt-3 p-3 rounded-xl text-xs font-medium ${
                    testStatus.startsWith("✅")
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      : "bg-rose-50 text-rose-900 border border-rose-200"
                  }`}
                >
                  {testStatus}
                </div>
              )}
            </div>

            {/* Outbox Table */}
            <div className="gov-card overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Statutory Dispatch History (Real-Time Outbox)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Audit trail of all emails, alerts, and SMS notices transmitted
                  </p>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {outbox.length} Dispatched Records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Channel / ID</th>
                      <th className="p-3.5">Recipient</th>
                      <th className="p-3.5">Subject / Notice</th>
                      <th className="p-3.5">Tender Ref</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {outbox.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No outbox records yet. Notifications will appear here as tender events occur.
                        </td>
                      </tr>
                    )}
                    {outbox.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {entry.channel === "EMAIL" ? (
                              <Mail className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                            )}
                            <span className="font-mono text-[11px] font-bold text-slate-800">
                              {entry.channel}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 block truncate max-w-[120px]">
                            {entry.id}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 block">{entry.recipient}</span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-medium text-slate-900 block">{entry.subjectOrHeader}</span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                            {entry.content}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold">
                            {entry.tenderRef || "GENERAL"}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {entry.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <span className="text-slate-500 font-mono text-[11px]">
                            {new Date(entry.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
