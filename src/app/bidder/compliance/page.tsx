"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  TrendingUp, 
  Bot, 
  Check, 
  X, 
  AlertCircle,
  Clock,
  ArrowRight
} from "lucide-react";

function ComplianceContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") || "dashboard";

  const [activeTab, setActiveTab] = useState<string>("dashboard");

  useEffect(() => {
    if (tabParam === "score") setActiveTab("score");
    else if (tabParam === "risk") setActiveTab("risk");
    else if (tabParam === "recommendations" || tabParam === "recommendation") setActiveTab("recommendations");
    else if (tabParam === "checklist" || tabParam === "missing") setActiveTab("risk");
    else setActiveTab("dashboard");
  }, [tabParam]);

  return (
    <Shell
      role="bidder"
      title="AI Compliance & Verification Suite"
      subtitle="Autonomous GFR 2017 compliance validation, risk scoring, and RFP criteria matching"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs flex flex-wrap gap-2 text-xs font-bold">
          {[
            { id: "dashboard", label: "Compliance Dashboard", icon: "📊" },
            { id: "score", label: "Compliance Score (93%)", icon: "🎯" },
            { id: "risk", label: "Risk Preview & Missing Items", icon: "⚠️" },
            { id: "recommendations", label: "AI Recommendations", icon: "🤖" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#003366] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: Compliance Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="gov-card p-5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Overall Score</span>
                  <span className="text-2xl font-black text-emerald-800 block mt-1">93 / 100</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Ready for Tender Submission</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="gov-card p-5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mandatory Rules</span>
                  <span className="text-2xl font-black text-slate-900 block mt-1">14 / 14</span>
                  <span className="text-[10px] text-blue-700 font-semibold">100% GFR 2017 Compliant</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#003366] border border-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#003366]" />
                </div>
              </div>

              <div className="gov-card p-5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Risk Factors</span>
                  <span className="text-2xl font-black text-amber-900 block mt-1">1 Low Risk</span>
                  <span className="text-[10px] text-amber-700 font-semibold">No critical blockers</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
              </div>

              <div className="gov-card p-5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Verified Packets</span>
                  <span className="text-2xl font-black text-slate-900 block mt-1">7 Documents</span>
                  <span className="text-[10px] text-purple-700 font-semibold">SHA-256 Hashed</span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Checklist Matrix */}
            <div className="gov-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Mandatory Statutory & Technical Checklist</h3>
                  <p className="text-xs text-slate-500">Automated pre-bid audit matching against GEM NIT criteria</p>
                </div>
                <Link
                  href="/bidder/bid-preparation"
                  className="px-3.5 py-1.5 rounded-lg bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>Edit Proposal in Studio →</span>
                </Link>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {[
                  { name: "GSTIN Validated with Central GST Registry", status: "VERIFIED", note: "Active 27ABCDE1234F1Z5 · Normal taxpayer", mandatory: true },
                  { name: "PAN Card Entity Name Matching", status: "VERIFIED", note: "100% character match: ABC Tech Solutions Pvt Ltd", mandatory: true },
                  { name: "Make in India (MII) Local Content Declaration", status: "VERIFIED", note: "Class-1 Local Supplier: 68.5% calculated local content", mandatory: true },
                  { name: "Financial Turnover Audited Certificate (Last 3 FY)", status: "VERIFIED", note: "Average ₹ 14.8 Cr exceeds minimum ₹ 1.5 Cr threshold", mandatory: true },
                  { name: "Non-Debarment / Blacklisting Self-Affidavit", status: "VERIFIED", note: "Notarized certificate valid through 2026", mandatory: true },
                  { name: "OEM Authorization Form (MAF) Annexure", status: "WARNING", note: "Manufacturer authorization validity ends in 45 days. Renew recommended.", mandatory: false },
                ].map((item, idx) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        item.status === "VERIFIED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {item.status === "VERIFIED" ? "✓" : "!"}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.note}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        item.status === "VERIFIED" 
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Compliance Score */}
        {activeTab === "score" && (
          <div className="gov-card p-6 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Comprehensive AI Compliance Scoring Matrix</h3>
              <p className="text-xs text-slate-500">Breakdown of criteria used by procurement evaluation officers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Technical Parameter Score</span>
                <span className="text-3xl font-black text-[#003366] block">94%</span>
                <p className="text-[11px] text-slate-500">Camera Resolution, Sensor, VMS, ONVIF compliance fully verified</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Commercial & BOQ Score</span>
                <span className="text-3xl font-black text-[#003366] block">92%</span>
                <p className="text-[11px] text-slate-500">Rates structured within estimated budget thresholds without mathematical errors</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Statutory Qualification Score</span>
                <span className="text-3xl font-black text-emerald-700 block">100%</span>
                <p className="text-[11px] text-slate-500">All mandatory GFR certificates present, valid, and cryptographically sound</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#003366] flex items-center justify-between gap-3">
              <div>
                <strong>Qualification Assessment:</strong> Your packet exceeds the 70% technical cutoff score needed to qualify for Packet B commercial opening.
              </div>
              <Link
                href="/bidder/review"
                className="px-4 py-2 rounded-lg bg-[#003366] hover:bg-[#002244] text-white font-bold transition shrink-0"
              >
                Proceed to Final Review →
              </Link>
            </div>
          </div>
        )}

        {/* TAB 3: Risk Preview */}
        {activeTab === "risk" && (
          <div className="gov-card p-6 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Pre-Bid Risk Radar & Inconsistency Detection</h3>
              <p className="text-xs text-slate-500">AI scanning for clauses that historically cause government tender disqualification</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-950">Notice: OEM Authorization Letter Validity Window</h4>
                  <p className="text-slate-600">
                    The OEM authorization attached expires on 28-Sep-2025. While valid on tender opening date, procuring officers often require authorization valid for at least 180 days.
                  </p>
                  <span className="inline-block mt-1 text-[11px] font-bold text-[#003366] hover:underline cursor-pointer">
                    Upload Updated OEM Letter in Document Vault →
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-emerald-950">Zero Critical Inconsistencies Detected</h4>
                  <p className="text-slate-600">
                    Entity name across GST, PAN, Udyam, and Bank Mandate matches exactly. No cross-entity discrepancy flags found.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI Recommendations */}
        {activeTab === "recommendations" && (
          <div className="gov-card p-6 space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#003366]" />
                <span>AI Winning Recommendations & Strategic Guidance</span>
              </h3>
              <p className="text-xs text-slate-500">Optimizations generated from historical evaluation data for similar Ministry NITs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  1. Highlight Make-in-India Preference
                </span>
                <p className="text-slate-600">
                  Ensure the Class-1 MII Declaration is attached directly in the primary technical packet. This grants first right of refusal under DPIIT Order P-45021.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  2. Submit 24 Hours Ahead of Closing
                </span>
                <p className="text-slate-600">
                  Server congestion on GeM portal is high during the final 3 hours. Cryptographically seal your bid at least one day before deadline.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                href="/bidder/submission"
                className="px-5 py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition flex items-center gap-2"
              >
                <span>Proceed to DSC Signing & Submission</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </Shell>
  );
}

export default function BidderCompliancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading AI Compliance Suite...</div>}>
      <ComplianceContent />
    </Suspense>
  );
}
