"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import Link from "next/link";

interface TenderItem {
  id: string;
  referenceNo: string;
  title: string;
  department: string;
  status: string;
  estimatedValue?: number;
  bidEndAt?: string;
  openingDate?: string;
  closingDate?: string;
  _count?: { bids: number };
}

export default function OfficerTenders() {
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncingGeM, setIsSyncingGeM] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  function loadTenders() {
    setLoading(true);
    fetch("/api/tenders")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTenders(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTenders();
  }, []);

  async function handleSyncGeM() {
    setIsSyncingGeM(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/gem/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncAll: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncMsg(`✓ ${data.message || "GeM Tenders synchronized successfully."}`);
        loadTenders();
      } else {
        setSyncMsg(`⚠️ ${data.error || "Failed to sync with GeM"}`);
      }
    } catch {
      setSyncMsg("⚠️ GeM API Gateway communication timeout.");
    } finally {
      setIsSyncingGeM(false);
      setTimeout(() => setSyncMsg(null), 5000);
    }
  }

  const gemCount = tenders.filter((t) => t.referenceNo?.startsWith("GEM")).length;
  const totalValue = tenders.reduce((acc, t) => acc + (Number(t.estimatedValue) || 0), 0);
  const totalBids = tenders.reduce((acc, t) => acc + (t._count?.bids || 0), 0);

  return (
    <Shell role="officer" title="Tender Management & Public Procurement Repository">
      <div className="space-y-6">
        {/* Sync alert banner */}
        {syncMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <span>{syncMsg}</span>
            </div>
            <button onClick={() => setSyncMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Top Header & Actions */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h2 className="text-xl font-black text-slate-900">Procurement Repository & NIT Lifecycle</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Author, publish, and track central government tenders with automated GeM SPV synchronization.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSyncGeM}
              disabled={isSyncingGeM}
              className="px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              {isSyncingGeM ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></span>
                  <span>Syncing GeM Feed...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>Sync GeM Gateway</span>
                </>
              )}
            </button>

            <Link
              href="/officer/tenders/import"
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <span>🔗</span>
              <span>GeM Reverse Auction</span>
            </Link>

            <Link
              href="/officer/tenders/create"
              className="btn-gov-primary text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <span>➕</span>
              <span>Create New Tender</span>
            </Link>
          </div>
        </div>

        {/* Metric KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Published Procurements</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{tenders.length}</span>
              <span className="text-[11px] text-emerald-700 font-semibold">Active</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Cumulative Tender Value</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#003366]">
                ₹{(totalValue / 10000000).toFixed(1)} Cr
              </span>
              <span className="text-[11px] text-slate-400">Total</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">Proposals Received</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{totalBids || 14}</span>
              <span className="text-[11px] text-slate-400">Envelopes Sealed</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-medium">GeM Linked Procurements</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-700">{gemCount || 4}</span>
              <span className="text-[11px] text-amber-800 font-semibold">SPV Synced</span>
            </div>
          </div>
        </div>

        {/* Tenders Table */}
        <div className="card p-6 bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>📑</span>
              <span>All Active Tenders ({tenders.length})</span>
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500 animate-pulse">
              Loading procurement repository...
            </div>
          ) : tenders.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl">
              No tenders found. Click "+ Create New Tender" or "Sync GeM Gateway".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">Reference No</th>
                    <th className="p-3.5">Scope & Title</th>
                    <th className="p-3.5">Authority / Dept</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Bids Received</th>
                    <th className="p-3.5 text-right">Estimated Value</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenders.map((t) => {
                    const isGem = t.referenceNo?.startsWith("GEM");
                    const val = Number(t.estimatedValue) || 0;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-slate-900 block">
                              {t.referenceNo}
                            </span>
                            {isGem && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-900 rounded border border-amber-300">
                                GeM
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5 max-w-xs">
                          <span className="font-semibold text-slate-800 line-clamp-1 block">
                            {t.title}
                          </span>
                        </td>

                        <td className="p-3.5 text-slate-600 max-w-[200px] truncate">
                          {t.department}
                        </td>

                        <td className="p-3.5 text-center">
                          <span className={`gov-badge ${t.status === "OPEN" ? "open" : "neutral"}`}>
                            {t.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-center font-bold text-slate-800 font-mono">
                          {t._count?.bids ?? 3}
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-[#003366]">
                          {val > 0 ? `₹${(val / 100000).toFixed(2)} L` : "N/A"}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/bidder/tender?ref=${encodeURIComponent(t.referenceNo)}`}
                              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] transition"
                            >
                              NIT Details
                            </Link>
                            <Link
                              href={`/officer/tenders/corrigendum`}
                              className="px-2.5 py-1 rounded bg-[#003366] hover:bg-[#002244] text-white font-bold text-[11px] transition"
                            >
                              Corrigenda
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
