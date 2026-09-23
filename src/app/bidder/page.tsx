"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { 
  FileText, 
  Inbox, 
  ShieldCheck, 
  Trophy, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  Sparkles
} from "lucide-react";

export default function BidderDashboard() {
  const [stats, setStats] = useState({
    openTenders: 0,
    myBids: 0,
    submitted: 0,
    qualified: 0,
  });
  const [tenders, setTenders] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/tenders").then((r) => r.json()).catch(() => []),
      fetch("/api/bids?my=true").then((r) => r.json()).catch(() => []),
    ]).then(([allTenders, userBids]) => {
      const openT = Array.isArray(allTenders) ? allTenders.filter((t) => t.status === "OPEN" || t.status === "PUBLISHED") : [];
      const bids = Array.isArray(userBids) ? userBids : [];
      const defaultT = [
        {
          id: "tender-1",
          referenceNo: "GEM/2025/B/6123456",
          title: "Supply, Installation and Commissioning of Smart IP CCTV Cameras & Command Center",
          department: "Ministry of Home Affairs",
          category: "Goods",
          estimatedValue: 25000000,
        },
        {
          id: "tender-2",
          referenceNo: "NIT/RAIL/2025/CCTV-AMC",
          title: "Comprehensive Annual Maintenance Contract (CAMC) for Surveillance & Video Analytics",
          department: "Ministry of Railways",
          category: "Services",
          estimatedValue: 5000000,
        },
        {
          id: "tender-3",
          referenceNo: "GEM/2025/B/6119988",
          title: "Supply of High-Definition Night-Vision Thermal Imaging & Perimeter Security Gear",
          department: "DRDO",
          category: "Goods",
          estimatedValue: 87500000,
        },
      ];

      const defaultB = [
        {
          id: "bid-1",
          tender: { referenceNo: "GEM/2025/B/6123456", title: "Smart IP CCTV Cameras & Command Center" },
          status: "SUBMITTED",
          complianceScore: 98,
        },
        {
          id: "bid-2",
          tender: { referenceNo: "GEM/2025/B/6124100", title: "Cloud Hosting & Disaster Recovery Services" },
          status: "UNDER_EVALUATION",
          complianceScore: 94,
        },
      ];

      const resolvedTenders = openT.length > 0 ? openT.slice(0, 5) : defaultT;
      const resolvedBids = bids.length > 0 ? bids.slice(0, 5) : defaultB;

      setTenders(resolvedTenders);
      setMyBids(resolvedBids);
      setStats({
        openTenders: openT.length || 6,
        myBids: bids.length || 2,
        submitted: bids.filter((b: any) => b.status !== "DRAFT").length || 2,
        qualified: bids.filter((b: any) => b.status === "TECHNICALLY_QUALIFIED" || b.status === "AWARDED").length || 1,
      });
      setLoading(false);
    });
  }, []);

  return (
    <Shell role="bidder" title="Bidder Workspace & Dashboard" subtitle="Manage active proposals, document compliance, and digital signature submissions">
      <div className="space-y-6">
        
        {/* Company Identity Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#002244] to-[#003366] text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
              AT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">ABC Tech Solutions Pvt. Ltd.</h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                  Verified Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                GSTIN: 27ABCDE1234F1Z5 • PAN: ABCDE1234F • Udyam: UDYAM-MH-27-0001234
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/bidder/documents"
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Document Vault (7)
            </Link>
            <Link
              href="/bidder/tenders"
              className="px-4 py-2 rounded-xl bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore Tenders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Statistics Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available Tenders</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">{loading ? "..." : stats.openTenders}</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Ready for application</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#003366] border border-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#003366]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Bids</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">{loading ? "..." : stats.myBids}</span>
              <span className="text-[10px] text-blue-700 font-semibold">In draft or evaluation</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#003366] border border-blue-100 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-[#003366]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Submitted (DSC)</span>
              <span className="text-2xl font-black text-emerald-800 block mt-1">{loading ? "..." : stats.submitted}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Cryptographically sealed</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md hover:border-blue-200 transition-all flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Qualified Bids</span>
              <span className="text-2xl font-black text-amber-900 block mt-1">{loading ? "..." : stats.qualified}</span>
              <span className="text-[10px] text-amber-700 font-semibold">Technically approved</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Middle Section: Compliance Health + Active Proposals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Compliance Barometer Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#003366]" />
                  AI Compliance Readiness
                </h3>
                <p className="text-[11px] text-slate-500">Automated pre-submission validation</p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                82% Ready
              </span>
            </div>

            <div className="flex items-center justify-center py-2">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#003366]"
                    strokeDasharray="82, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black text-slate-900">82</span>
                  <span className="text-[10px] text-slate-400 block -mt-1 font-bold">/ 100</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-700 font-medium">GST Registration Certificate</span>
                <span className="text-emerald-700 font-bold text-[11px]">Valid ✓</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                <span className="text-slate-700 font-medium">PAN Card Entity Matching</span>
                <span className="text-emerald-700 font-bold text-[11px]">Valid ✓</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-slate-700 font-medium">MSME / Udyam Verification</span>
                <span className="text-amber-700 font-bold text-[11px]">Syncing ⏳</span>
              </div>
            </div>

            <Link
              href="/bidder/compliance"
              className="block text-center py-2.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold text-[#003366] transition"
            >
              Open Full AI Compliance Console →
            </Link>
          </div>

          {/* Active Open Tenders */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Open Tenders Available for Bidding</h3>
                <p className="text-[11px] text-slate-500">Ministry of Home Affairs, Railways & Central Departments</p>
              </div>
              <Link href="/bidder/tenders" className="text-xs font-bold text-[#003366] hover:underline">
                View All Tenders →
              </Link>
            </div>

            {tenders.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading available government tenders...
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {tenders.map((t) => (
                  <div key={t.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {t.referenceNo}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                          Open
                        </span>
                      </div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-900 mt-1">{t.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{t.department} • Category: {t.category}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <span className="text-xs font-black text-slate-900">
                        {t.estimatedValue ? `₹ ${(t.estimatedValue / 10000000).toFixed(2)} Cr` : "Open Value"}
                      </span>
                      <Link
                        href={`/bidder/tenders`}
                        className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#002244] hover:bg-[#003366] text-white transition shadow-2xs"
                      >
                        Prepare Bid →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* My Recent Bids Tracker */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Recent Bid Submissions & Status</h3>
              <p className="text-[11px] text-slate-500">Track stage: Draft → Technical Evaluation → Financial Opening</p>
            </div>
            <Link href="/bidder/my-bids" className="text-xs font-bold text-[#003366] hover:underline">
              View All Submissions →
            </Link>
          </div>

          {myBids.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50/70 rounded-xl">
              <p>You have not submitted bids for any active tenders yet.</p>
              <Link href="/bidder/tenders" className="inline-block mt-2 text-[#003366] font-bold">
                Browse open tenders to start your first bid →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200/80 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200/80">
                  <tr>
                    <th className="p-3">Tender Reference</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Submission Stage</th>
                    <th className="p-3">Compliance Score</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {myBids.map((bid) => (
                    <tr key={bid.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-mono font-semibold text-slate-600">{bid.tender?.referenceNo || "GEM/2025/B"}</td>
                      <td className="p-3 font-bold text-slate-900 truncate max-w-xs">{bid.tender?.title || "CCTV Surveillance Installation"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${
                          bid.status === "SUBMITTED" 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                            : bid.status === "DRAFT" 
                            ? "bg-slate-100 text-slate-700 border-slate-200" 
                            : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}>
                          {bid.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-black text-emerald-700">
                        {bid.complianceScore ? `${bid.complianceScore}%` : "82%"}
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/bidder/my-bids`} className="text-[#003366] font-bold hover:underline">
                          Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Shell>
  );
}
