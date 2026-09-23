"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileCheck, 
  Hash, 
  Copy, 
  Check, 
  AlertCircle, 
  FileText, 
  Lock, 
  Award,
  ArrowRight,
  ExternalLink
} from "lucide-react";

function BidReviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenderRef = searchParams.get("ref") || "GEM/2025/B/6123456";
  const tenderId = searchParams.get("tenderId") || "tender-1";
  const totalAmount = searchParams.get("total") || "20558000";
  const tabParam = searchParams.get("tab") || "readiness";

  const [activeTab, setActiveTab] = useState<"readiness" | "validation" | "declaration">("readiness");
  const [copiedHash, setCopiedHash] = useState(false);
  const [declarationChecks, setDeclarationChecks] = useState({
    truthful: true,
    nonCollusion: true,
    miiCompliance: true,
    dscAuthorized: false,
  });

  const [bidHash] = useState("e8a719c2f5d3410b91e784501a3cd4b76e89021a8f9b4c3e2d1056789abcdef0");

  useEffect(() => {
    if (tabParam === "validation") setActiveTab("validation");
    else if (tabParam === "declaration") setActiveTab("declaration");
    else setActiveTab("readiness");
  }, [tabParam]);

  const handleTabChange = (tab: "readiness" | "validation" | "declaration") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "readiness") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/bidder/review${query}`);
  };

  const copyDigest = () => {
    navigator.clipboard.writeText(bidHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const validationChecks = [
    { 
      id: "VAL-01",
      title: "GSTN Registration Verification", 
      rule: "Rule 160(ii) GFR 2017",
      desc: "Verified Active status via GSTN Public API. GSTIN: 27ABCDE1234F1Z5.",
      evidence: "GSTR-3B & Tax Clearance Certificate",
      status: "PASSED",
      score: "100%"
    },
    { 
      id: "VAL-02",
      title: "Income Tax PAN Entity Matching", 
      rule: "CBDT Master Database Integration",
      desc: "Entity legal title matches Income Tax Department record (ABCDE1234F).",
      evidence: "CBDT e-Filing Acknowledgement FY 2024-25",
      status: "PASSED",
      score: "100%"
    },
    { 
      id: "VAL-03",
      title: "Technical Specification Matrix Compliance", 
      rule: "NIT Section 3 (Clauses 3.1 to 3.4)",
      desc: "All mandatory RFP parameters met (4K PTZ, RAID-6 storage, armoured outdoor Cat-6).",
      evidence: "OEM Compliance Datasheets & Test Reports",
      status: "PASSED",
      score: "98%"
    },
    { 
      id: "VAL-04",
      title: "Financial BOQ Mathematical Audit", 
      rule: "CVC Guidelines on Price Schedules",
      desc: "All 5 BOQ line items priced with valid 18% GST computations. Zero formula discrepancies.",
      evidence: "Itemized Schedule & Cryptographic Hash",
      status: "PASSED",
      score: "100%"
    },
    { 
      id: "VAL-05",
      title: "Make in India (MII) Content Threshold", 
      rule: "DPIIT Order No. P-45021/2/2017-PP (BE-II)",
      desc: "68% indigenous local value addition declared. Qualifies as Class-I Local Supplier.",
      evidence: "Statutory Auditor / Cost Accountant Certificate",
      status: "PASSED",
      score: "Class-I"
    },
    { 
      id: "VAL-06",
      title: "OEM Manufacturer Authorization (MAF)", 
      rule: "NIT Clause 4.8 (OEM Undertaking)",
      desc: "Direct manufacturer commitment for 3-year on-site support and genuine spare parts.",
      evidence: "Signed OEM Authorization Letter #MAF-2025-081",
      status: "PASSED",
      score: "Verified"
    },
    { 
      id: "VAL-07",
      title: "EMD & Security Exemption Eligibility", 
      rule: "GFR 2017 Rule 170(i) & MSME Act",
      desc: "EMD ₹ 5,00,000 exemption validly claimed under MSME / Udyam registration.",
      evidence: "Udyam Registration Certificate UDYAM-MH-02-0049182",
      status: "PASSED",
      score: "Exempted"
    },
  ];

  const allDeclared = declarationChecks.truthful && declarationChecks.nonCollusion && declarationChecks.miiCompliance && declarationChecks.dscAuthorized;

  return (
    <Shell
      role="bidder"
      title="Final Pre-Submission Review & Audit"
      subtitle={`Final verification check before digital signature sealing for Tender ${tenderRef}`}
    >
      <div className="space-y-6">

        {/* Top Summary Banner */}
        <div className="bg-gradient-to-r from-[#002244] via-[#003366] to-[#0b5cad] rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>All 7 Mandatory Criteria Cleared</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black">Bid Readiness & Pre-Flight Review</h2>
            <p className="text-xs text-blue-100 max-w-xl leading-relaxed">
              Tender Ref: <strong className="text-white font-mono">{tenderRef}</strong> • Total Evaluated Bid:{" "}
              <strong className="text-amber-300 font-mono text-sm">₹ {Number(totalAmount).toLocaleString("en-IN")}</strong>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/15 backdrop-blur-xs">
            <div className="w-14 h-14 rounded-full border-4 border-emerald-400 flex items-center justify-center font-black text-lg text-white shadow-inner">
              98%
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-300 block uppercase tracking-wider">Readiness Score</span>
              <span className="text-[11px] text-blue-200">Zero non-compliance alerts</span>
            </div>
          </div>
        </div>

        {/* Interactive Navigation Tabs */}
        <div className="border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => handleTabChange("readiness")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === "readiness"
                ? "bg-[#003366] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>1. Bid Readiness</span>
          </button>
          <button
            onClick={() => handleTabChange("validation")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === "validation"
                ? "bg-[#003366] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>2. Validation Results (7 Checks)</span>
          </button>
          <button
            onClick={() => handleTabChange("declaration")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === "declaration"
                ? "bg-[#003366] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Solemn Declaration & Integrity Pact</span>
          </button>
        </div>

        {/* TAB 1: READINESS OVERVIEW */}
        {activeTab === "readiness" && (
          <div className="space-y-6">
            {/* Cryptographic Package Digest */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#003366]" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Cryptographic Electronic Envelope Digest (SHA-256)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md">
                  Digital Packet: PKT-2025-0828-991 • 14.8 MB
                </span>
              </div>

              <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl flex items-center justify-between gap-4 border border-slate-800">
                <span className="break-all">{bidHash}</span>
                <button
                  onClick={copyDigest}
                  className="shrink-0 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Copy SHA-256 Digest"
                >
                  {copiedHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                This SHA-256 hash uniquely locks your Technical Proposal, Financial BOQ schedule, Make-in-India declaration, and OEM authorizations into a tamper-evident digital envelope per Section 3 of the Information Technology Act, 2000.
              </p>
            </div>

            {/* Quick Readiness Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Technical Bid</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">100% Compliant</span>
                </div>
                <p className="text-sm font-bold text-slate-900">Sony Starvis 4K + Dell SAN</p>
                <span className="text-[11px] text-slate-500 block">4/4 technical clauses matched with zero critical deviations</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Financial BOQ</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Verified Balance</span>
                </div>
                <p className="text-sm font-bold text-slate-900">₹ {Number(totalAmount).toLocaleString("en-IN")}</p>
                <span className="text-[11px] text-slate-500 block">5 line items calculated with 18% statutory GST</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Statutory Vault</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">5/5 Verified</span>
                </div>
                <p className="text-sm font-bold text-slate-900">GST, PAN, MSME, MAF, BIS</p>
                <span className="text-[11px] text-slate-500 block">All documents valid beyond tender closing deadline</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <button
                onClick={() => handleTabChange("validation")}
                className="text-xs font-bold text-[#003366] hover:underline flex items-center gap-1.5"
              >
                <span>Inspect All 7 Validation Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleTabChange("declaration")}
                className="btn-gov-primary text-xs flex items-center justify-center gap-2 px-5 py-2.5 shadow-sm"
              >
                <span>Proceed to Statutory Declaration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: VALIDATION RESULTS */}
        {activeTab === "validation" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    7-Point Statutory Compliance & Eligibility Audit Matrix
                  </h3>
                  <p className="text-[11px] text-slate-500">Autonomous verification report against NIT criteria and GFR 2017 requirements</p>
                </div>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-200">
                  Audit Passed: 7 / 7
                </span>
              </div>

              <div className="space-y-3">
                {validationChecks.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-extrabold text-[#003366] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.id}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                        <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {item.rule}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs">{item.desc}</p>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Supporting Evidence: <strong>{item.evidence}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-700 block">{item.score}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Pre-Verified</span>
                      </div>
                      <span className="gov-badge verified text-xs py-1 px-2.5">
                        ✓ {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <button
                onClick={() => handleTabChange("readiness")}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back to Readiness Barometer
              </button>
              <button
                onClick={() => handleTabChange("declaration")}
                className="btn-gov-primary text-xs flex items-center gap-2"
              >
                <span>Continue to Bidder Declaration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SOLEMN DECLARATION */}
        {activeTab === "declaration" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Statutory Non-Collusion & Integrity Pact Undertaking
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory confirmation required under Rule 151 of GFR 2017 and CVC Order 02/01/2017 prior to applying cryptographic signature.
              </p>
            </div>

            <div className="space-y-3.5">
              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs transition hover:bg-slate-100/70">
                <input
                  type="checkbox"
                  checked={declarationChecks.truthful}
                  onChange={(e) => setDeclarationChecks({ ...declarationChecks, truthful: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-[#003366] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-700 leading-relaxed font-medium">
                  <strong>Accuracy of Information:</strong> I declare that all statements made, documents attached, and prices offered in BOQ schedule (₹ {Number(totalAmount).toLocaleString("en-IN")}) for tender {tenderRef} are true, authentic, and complete.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs transition hover:bg-slate-100/70">
                <input
                  type="checkbox"
                  checked={declarationChecks.nonCollusion}
                  onChange={(e) => setDeclarationChecks({ ...declarationChecks, nonCollusion: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-[#003366] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-700 leading-relaxed font-medium">
                  <strong>Anti-Collusion & Integrity Pact:</strong> We have arrived at the bid prices independently without consultation, communication, or agreement with any other competing bidder for the purpose of restricting competition.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer text-xs transition hover:bg-slate-100/70">
                <input
                  type="checkbox"
                  checked={declarationChecks.miiCompliance}
                  onChange={(e) => setDeclarationChecks({ ...declarationChecks, miiCompliance: e.target.checked })}
                  className="mt-0.5 rounded border-slate-300 text-[#003366] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-700 leading-relaxed font-medium">
                  <strong>Make in India Undertaking:</strong> We certify that local value addition of 68% meets the Class-I Local Supplier criteria under Public Procurement (Preference to Make in India) Order 2017.
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-300 cursor-pointer text-xs transition hover:bg-amber-100/50">
                <input
                  type="checkbox"
                  checked={declarationChecks.dscAuthorized}
                  onChange={(e) => setDeclarationChecks({ ...declarationChecks, dscAuthorized: e.target.checked })}
                  className="mt-0.5 rounded border-amber-400 text-[#003366] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-amber-900 leading-relaxed font-semibold">
                  <strong>Class-3 DSC Signing Authorization:</strong> I am legally authorized by Board Resolution / Power of Attorney to affix our organization's Class-3 Digital Signature Certificate to submit this electronic proposal.
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <Link
                href={`/bidder/bid-preparation?tenderId=${tenderId}&ref=${encodeURIComponent(tenderRef)}`}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back to Bid Preparation Studio
              </Link>

              <Link
                href={allDeclared ? `/bidder/submission?tenderId=${tenderId}&ref=${encodeURIComponent(tenderRef)}&hash=${bidHash}&total=${totalAmount}` : "#"}
                className={`btn text-xs px-6 py-3 font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                  allDeclared
                    ? "bg-[#003366] text-white hover:bg-[#0b5cad] shadow-md cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>Proceed to Class-3 DSC Digital Signature Sealing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </Shell>
  );
}

export default function BidReviewPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Bid Audit Review...</div>}>
      <BidReviewContent />
    </Suspense>
  );
}
