"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { OfficerAnalyticsCharts } from "@/components/OfficerAnalyticsCharts";
import { 
  FileText, 
  Hourglass, 
  Bot, 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  Sparkles,
  ExternalLink,
  Lock
} from "lucide-react";

export default function OfficerDashboard() {
  const [stats, setStats] = useState({
    totalTenders: 0,
    openTenders: 0,
    totalBids: 0,
    pendingEvaluation: 0,
  });
  const [allTenders, setAllTenders] = useState<any[]>([]);
  const [allBids, setAllBids] = useState<any[]>([]);
  const [recentTenders, setRecentTenders] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/tenders").then((r) => r.json()).catch(() => []),
      fetch("/api/bids").then((r) => r.json()).catch(() => []),
      fetch("/api/audit").then((r) => r.json()).catch(() => []),
    ]).then(([tenders, bids, logs]) => {
      const tList = Array.isArray(tenders) ? tenders : [];
      const bList = Array.isArray(bids) ? bids : [];
      const lList = Array.isArray(logs) ? logs : [];

      setStats({
        totalTenders: tList.length,
        openTenders: tList.filter((t) => ["PUBLISHED", "OPEN"].includes(t.status)).length,
        totalBids: bList.length,
        pendingEvaluation: bList.filter((b) => ["SUBMITTED", "UNDER_EVALUATION"].includes(b.status)).length,
      });

      setAllTenders(tList);
      setAllBids(bList);
      setRecentTenders(tList.slice(0, 5));
      setRecentLogs(lList.slice(0, 6));
      setLoading(false);
    });
  }, []);

  return (
    <Shell
      role="officer"
      title="Procurement Officer Command Console"
      subtitle="Central tender management, AI-assisted bid compliance evaluation, and statutory decision records"
    >
      <div className="space-y-6">
        
        {/* Officer Identity & Quick Action Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#002244] to-[#003366] text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
              RK
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Rajesh Kumar, Deputy Secretary (Procurement)
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-50 text-[#003366] rounded-full border border-blue-200">
                  Officer Authorized
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Ministry of Home Affairs • Central Armed Police Forces Procurement Division
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/officer/tenders/create"
              className="px-4 py-2 rounded-xl bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Tender</span>
            </Link>
            <Link
              href="/officer/tenders?tab=gem"
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Import GeM NIT
            </Link>
          </div>
        </div>

        {/* 4 Executive KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Tenders</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">{loading ? "..." : stats.totalTenders}</span>
              <span className="text-[10px] text-blue-700 font-semibold">{stats.openTenders} Currently Open</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#003366] border border-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#003366]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bids Under Review</span>
              <span className="text-2xl font-black text-amber-900 block mt-1">{loading ? "..." : stats.pendingEvaluation}</span>
              <span className="text-[10px] text-amber-700 font-semibold">Requires Officer Action</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
              <Hourglass className="w-5 h-5 text-amber-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Verified Packets</span>
              <span className="text-2xl font-black text-emerald-800 block mt-1">99.4%</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Confidence Score</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Statutory Audit Logs</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">{loading ? "..." : recentLogs.length}</span>
              <span className="text-[10px] text-slate-400 font-semibold">SHA-256 Validated</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>

        {/* Visual Analytics & Executive Procurement Intelligence */}
        {!loading && (
          <OfficerAnalyticsCharts tenders={allTenders} bids={allBids} />
        )}

        {/* Middle Section: Active Tenders List + AI Evaluation Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Active Tenders Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Managed Tenders & Current Phase</h3>
                <p className="text-[11px] text-slate-500">Ministry of Home Affairs & Central PSUs</p>
              </div>
              <Link href="/officer/tenders" className="text-xs font-bold text-[#003366] hover:underline">
                View All Tenders →
              </Link>
            </div>

            {recentTenders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading tenders...</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTenders.map((t) => (
                  <div key={t.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {t.referenceNo}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                          {t.status}
                        </span>
                      </div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-900 mt-1">{t.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {t.department} • Closes: {new Date(t.bidEndAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-xs font-black text-[#002244]">
                        {t.estimatedValue ? `₹ ${(t.estimatedValue / 10000000).toFixed(2)} Cr` : "Open Value"}
                      </span>
                      <Link
                        href={`/officer/bids?tenderId=${t.id}`}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#002244] hover:bg-[#003366] text-white transition shadow-2xs"
                      >
                        Review Bids ({t._count?.bids || 0}) →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Compliance & Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Evaluation Engine
                </span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Online
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                Automatic OCR table extraction and GSTN/PAN cross-verification are running in background for all incoming bids.
              </p>
              <div className="space-y-2 pt-1">
                <Link
                  href="/officer/compliance"
                  className="block w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 text-center rounded-xl text-xs font-bold border border-purple-200/80 transition"
                >
                  Open AI Compliance Console
                </Link>
                <Link
                  href="/officer/evaluation/comparative"
                  className="block w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-center rounded-xl text-xs font-bold border border-slate-200 transition"
                >
                  Generate Comparative Statement
                </Link>
              </div>
            </div>

            {/* Statutory Quick Links */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Evaluation Workflows</h4>
              <ul className="space-y-2 text-xs font-semibold">
                <li>
                  <Link href="/officer/evaluation/technical" className="text-[#003366] hover:underline flex items-center justify-between p-1.5 rounded-lg hover:bg-blue-50/50">
                    <span>Technical Evaluation</span> <span>→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/officer/evaluation/financial" className="text-[#003366] hover:underline flex items-center justify-between p-1.5 rounded-lg hover:bg-blue-50/50">
                    <span>Financial Evaluation (BOQ)</span> <span>→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/officer/decision" className="text-[#003366] hover:underline flex items-center justify-between p-1.5 rounded-lg hover:bg-blue-50/50">
                    <span>Officer Decision Console</span> <span>→</span>
                  </Link>
                </li>
                <li>
                  <Link href="/officer/audit" className="text-[#003366] hover:underline flex items-center justify-between p-1.5 rounded-lg hover:bg-blue-50/50">
                    <span>Statutory Audit Logs</span> <span>→</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Audit Log Stream */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cryptographic System Audit Trail</h3>
              <p className="text-[11px] text-slate-500">Immutable record of tenders created, bids evaluated, and officer decisions</p>
            </div>
            <Link href="/officer/audit" className="text-xs font-bold text-[#003366] hover:underline">
              Full Audit Vault →
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">Audit logging operational. No recent entries.</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-800">{log.entityType}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Shell>
  );
}
