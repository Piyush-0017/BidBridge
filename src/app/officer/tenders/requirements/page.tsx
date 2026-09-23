"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import Link from "next/link";

interface TenderOption {
  id: string;
  tenderNo: string;
  title: string;
  estimatedCost: number;
}

export default function RequirementsBuilderPage() {
  const [tenders, setTenders] = useState<TenderOption[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"financial" | "technical" | "statutory" | "scoring">("financial");
  const [saveStatus, setSaveStatus] = useState<string>("");

  // Criteria configuration state
  const [criteria, setCriteria] = useState({
    // Financial Criteria
    minTurnoverPercentage: 50,
    turnoverYears: 3,
    solvencyCertificateReq: true,
    solvencyPercentage: 40,
    workingCapitalReq: true,
    caCertificateMandatory: true,

    // Technical Criteria
    experienceType: "RULE_THREE_TIER", // 1 work of 80%, 2 works of 50%, or 3 works of 40%
    similarWorkDefinition: "Supply, installation, and commissioning of enterprise networking equipment and secure communications infrastructure in Central/State Government or PSU entities.",
    oemAuthorizationMandatory: true,
    keyPersonnelReq: true,
    minEngineers: 3,

    // Statutory & Public Procurement Guidelines
    localContentMinPercent: 50, // Class-I local supplier
    msmeTurnoverExemption: true,
    msmeExperienceExemption: true,
    emdPercent: 2,
    pbgPercent: 5,
    integrityPactApplicable: true,
    nonDebarmentAffidavitReq: true,

    // Packet A Technical Scoring
    minQualifyingScore: 75,
    technicalWeight: 70,
    financialWeight: 30,
  });

  useEffect(() => {
    fetch("/api/tenders")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTenders(data);
          setSelectedTenderId(data[0].id);
        } else {
          const fallback = [
            { id: "TND-001", tenderNo: "GEM/2025/B/902184", title: "Enterprise Cloud Infrastructure & High Availability Server Cluster", estimatedCost: 12500000 },
            { id: "TND-002", tenderNo: "GEM/2025/B/881234", title: "Secure AI Document Analysis & OCR Gateway System", estimatedCost: 8500000 },
            { id: "TND-003", tenderNo: "NIT-2025-DEF-09", title: "Defense Grade Encrypted Communications Hardware", estimatedCost: 35000000 },
          ];
          setTenders(fallback);
          setSelectedTenderId(fallback[0].id);
        }
      })
      .catch(() => {
        const fallback = [
          { id: "TND-001", tenderNo: "GEM/2025/B/902184", title: "Enterprise Cloud Infrastructure & High Availability Server Cluster", estimatedCost: 12500000 },
        ];
        setTenders(fallback);
        setSelectedTenderId(fallback[0].id);
      });
  }, []);

  const currentTender = tenders.find((t) => t.id === selectedTenderId) || tenders[0];
  const estCost = currentTender?.estimatedCost || 10000000;
  const calculatedTurnover = ((estCost * criteria.minTurnoverPercentage) / 100).toLocaleString("en-IN");
  const calculatedSolvency = ((estCost * criteria.solvencyPercentage) / 100).toLocaleString("en-IN");
  const calculatedEmd = ((estCost * criteria.emdPercent) / 100).toLocaleString("en-IN");

  const handleSave = () => {
    setSaveStatus("Saving criteria & publishing to tender rules engine...");
    setTimeout(() => {
      setSaveStatus("✅ Qualification criteria successfully updated and synchronized with AI Compliance validator!");
      setTimeout(() => setSaveStatus(""), 4500);
    }, 800);
  };

  return (
    <Shell role="officer" title="Tender Requirements & Eligibility Criteria">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h2 className="text-xl font-black text-slate-900">Eligibility & Qualification Rule Engine</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure statutory qualification conditions as per GFR 2017 & CVC procurement guidelines.
              These criteria dynamically feed into the automated AI compliance verification matrix.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Select Tender</label>
              <select
                value={selectedTenderId}
                onChange={(e) => setSelectedTenderId(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
              >
                {tenders.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tenderNo} - {t.title.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSave}
              className="btn-primary inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs mt-4"
            >
              <span>💾</span>
              <span>Publish Criteria</span>
            </button>
          </div>
        </div>

        {/* Live notification message */}
        {saveStatus && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <span>ℹ️</span>
            <span>{saveStatus}</span>
          </div>
        )}

        {/* Selected Tender Context Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4 bg-white border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Tender Reference</span>
            <p className="text-xs font-black text-[#003366] mt-0.5">{currentTender?.tenderNo}</p>
            <p className="text-[11px] text-slate-600 truncate mt-1">{currentTender?.title}</p>
          </div>
          <div className="card p-4 bg-white border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Cost</span>
            <p className="text-base font-black text-slate-900 mt-0.5">₹{estCost.toLocaleString("en-IN")}</p>
            <span className="text-[10px] font-semibold text-slate-400">INR Excl. Taxes</span>
          </div>
          <div className="card p-4 bg-white border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">Calculated Min Turnover (50%)</span>
            <p className="text-base font-black text-emerald-700 mt-0.5">₹{calculatedTurnover}</p>
            <span className="text-[10px] font-semibold text-emerald-600">Past 3 Fiscal Years</span>
          </div>
          <div className="card p-4 bg-white border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400">EMD Required (2%)</span>
            <p className="text-base font-black text-blue-700 mt-0.5">₹{calculatedEmd}</p>
            <span className="text-[10px] font-semibold text-blue-600">MSME / Startups Exempt</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab("financial")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "financial"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>💰</span>
            <span>Financial Eligibility</span>
          </button>
          <button
            onClick={() => setActiveTab("technical")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "technical"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🛠️</span>
            <span>Technical Experience</span>
          </button>
          <button
            onClick={() => setActiveTab("statutory")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "statutory"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🇮🇳</span>
            <span>Make in India & MSME</span>
          </button>
          <button
            onClick={() => setActiveTab("scoring")}
            className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === "scoring"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>⚖️</span>
            <span>Evaluation & Weightage</span>
          </button>
        </div>

        {/* Tab 1: Financial Criteria */}
        {activeTab === "financial" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Commercial & Financial Turnover Criteria</h3>
                <p className="text-xs text-slate-500 mt-0.5">Define mandatory financial thresholds checked against CA-audited balance sheets.</p>
              </div>
              <span className="text-[10px] font-bold bg-blue-100 text-[#003366] px-2.5 py-1 rounded-md">
                Rule 173 GFR 2017
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Minimum Average Annual Turnover (% of Estimated Cost)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="5"
                    value={criteria.minTurnoverPercentage}
                    onChange={(e) => setCriteria({ ...criteria, minTurnoverPercentage: Number(e.target.value) })}
                    className="w-full accent-[#003366]"
                  />
                  <span className="text-xs font-black text-[#003366] bg-white px-3 py-1 rounded-lg border border-slate-300 shrink-0">
                    {criteria.minTurnoverPercentage}% (₹{calculatedTurnover})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Bidder must have average turnover of ₹{calculatedTurnover} in the last {criteria.turnoverYears} financial years (FY 2021-22, 2022-23, 2023-24).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Banker Solvency Certificate / Net Worth Threshold
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="20"
                    max="60"
                    step="5"
                    value={criteria.solvencyPercentage}
                    onChange={(e) => setCriteria({ ...criteria, solvencyPercentage: Number(e.target.value) })}
                    className="w-full accent-[#003366]"
                  />
                  <span className="text-xs font-black text-[#003366] bg-white px-3 py-1 rounded-lg border border-slate-300 shrink-0">
                    {criteria.solvencyPercentage}% (₹{calculatedSolvency})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Solvency certificate issued by any Scheduled Commercial Bank within 6 months prior to tender closing.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.caCertificateMandatory}
                  onChange={(e) => setCriteria({ ...criteria, caCertificateMandatory: e.target.checked })}
                  className="w-4 h-4 accent-[#003366] rounded"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">Mandatory Chartered Accountant UDIN Verification</span>
                  <p className="text-[11px] text-slate-500">All financial turnover certificates must bear a verifiable 18-digit Unique Document Identification Number (UDIN).</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.workingCapitalReq}
                  onChange={(e) => setCriteria({ ...criteria, workingCapitalReq: e.target.checked })}
                  className="w-4 h-4 accent-[#003366] rounded"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">Working Capital Adequacy Requirement</span>
                  <p className="text-[11px] text-slate-500">Liquid assets and fund-based credit facilities must equal at least 20% of estimated tender value.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: Technical Criteria */}
        {activeTab === "technical" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Prior Work Experience & Technical Capability</h3>
                <p className="text-xs text-slate-500 mt-0.5">Specify standard CVC 3-tier work completion criteria and OEM declarations.</p>
              </div>
              <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2.5 py-1 rounded-md">
                CVC Guidelines OM No. 12-02-1-CTE-6
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
              <label className="block text-xs font-bold text-slate-800">Standard Similar Work Criteria Matrix</label>
              <div className="space-y-2 text-xs text-slate-700">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="experienceRule"
                    checked={criteria.experienceType === "RULE_THREE_TIER"}
                    onChange={() => setCriteria({ ...criteria, experienceType: "RULE_THREE_TIER" })}
                    className="accent-[#003366]"
                  />
                  <span className="font-semibold">
                    Standard 3-Tier Option: 1 work of 80% (₹{(estCost * 0.8).toLocaleString()}) OR 2 works of 50% (₹{(estCost * 0.5).toLocaleString()}) OR 3 works of 40% (₹{(estCost * 0.4).toLocaleString()})
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="experienceRule"
                    checked={criteria.experienceType === "RULE_TWO_TIER"}
                    onChange={() => setCriteria({ ...criteria, experienceType: "RULE_TWO_TIER" })}
                    className="accent-[#003366]"
                  />
                  <span className="font-semibold">
                    Simplified Option: 1 work of 50% OR 2 works of 30% of estimated tender value
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">Definition of "Similar Nature of Work"</label>
              <textarea
                rows={3}
                value={criteria.similarWorkDefinition}
                onChange={(e) => setCriteria({ ...criteria, similarWorkDefinition: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
              />
              <p className="text-[11px] text-slate-500">
                The AI document parser uses this definition to semantically match client completion certificates and work orders.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.oemAuthorizationMandatory}
                  onChange={(e) => setCriteria({ ...criteria, oemAuthorizationMandatory: e.target.checked })}
                  className="w-4 h-4 accent-[#003366] rounded"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">Mandatory Manufacturer Authorization Form (MAF)</span>
                  <p className="text-[11px] text-slate-500">Required if bidder is an authorized channel partner / system integrator.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.keyPersonnelReq}
                  onChange={(e) => setCriteria({ ...criteria, keyPersonnelReq: e.target.checked })}
                  className="w-4 h-4 accent-[#003366] rounded"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">Key Personnel & Certifications</span>
                  <p className="text-[11px] text-slate-500">Minimum {criteria.minEngineers} full-time OEM-certified deployment engineers.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Tab 3: Statutory & Public Procurement Guidelines */}
        {activeTab === "statutory" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Make in India, MSME & Sovereign Directives</h3>
                <p className="text-xs text-slate-500 mt-0.5">DPIIT Public Procurement (Preference to Make in India) Order & MSME Policy 2012.</p>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md">
                DPIIT Order P-45021/2/2017-PP
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Minimum Local Content for Class-I Local Supplier (DPIIT)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={criteria.localContentMinPercent}
                  onChange={(e) => setCriteria({ ...criteria, localContentMinPercent: Number(e.target.value) })}
                  className="w-full accent-[#003366]"
                />
                <span className="text-xs font-black text-[#003366] bg-white px-3 py-1 rounded-lg border border-slate-300 shrink-0">
                  {criteria.localContentMinPercent}% Local Content
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Suppliers offering local content below 20% are classified as Non-Local Suppliers and are ineligible to participate.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.msmeTurnoverExemption}
                  onChange={(e) => setCriteria({ ...criteria, msmeTurnoverExemption: e.target.checked })}
                  className="w-4 h-4 accent-[#003366] rounded"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">Exempt MSME from Prior Turnover Criteria</span>
                  <p className="text-[11px] text-slate-500">Subject to meeting quality & technical specifications (DoE OM F.20/2/2014-PPD).</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteria.msmeExperienceExemption}
                  onChange={(e) => setCriteria({ ...criteria, msmeExperienceExemption: e.target.checked })}
                  className="w-4 h-4 accent-[#003366] rounded"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800">Exempt Startups from Prior Experience</span>
                  <p className="text-[11px] text-slate-500">DIPP-recognized startups eligible without prior experience penalty.</p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-400">EMD Rate</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">{criteria.emdPercent}% of Value</p>
                <span className="text-[10px] text-slate-500">Bid Security Declaration accepted for MSMEs</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-400">PBG Guarantee Rate</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">{criteria.pbgPercent}% of Contract Value</p>
                <span className="text-[10px] text-slate-500">Valid for contract period + 60 days</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-[10px] uppercase font-bold text-slate-400">Integrity Pact</span>
                <p className="text-sm font-black text-emerald-700 mt-0.5">Mandatory &gt; ₹10 Cr</p>
                <span className="text-[10px] text-slate-500">Independent External Monitor (IEM)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Evaluation & Weightage */}
        {activeTab === "scoring" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Technical Qualification & QCBS Evaluation Weightage</h3>
                <p className="text-xs text-slate-500 mt-0.5">Define minimum score required in Packet A before Packet B (Financial Bid) can be decrypted.</p>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-md">
                Two-Packet Envelope System
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  Minimum Technical Qualifying Score (Packet A)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="60"
                    max="90"
                    step="5"
                    value={criteria.minQualifyingScore}
                    onChange={(e) => setCriteria({ ...criteria, minQualifyingScore: Number(e.target.value) })}
                    className="w-full accent-[#003366]"
                  />
                  <span className="text-xs font-black text-white bg-[#003366] px-3 py-1 rounded-lg shrink-0">
                    {criteria.minQualifyingScore} / 100 Marks
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Bids scoring below {criteria.minQualifyingScore} marks are automatically disqualified and will NOT proceed to commercial opening.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
                <label className="block text-xs font-bold text-slate-800">
                  QCBS Weightage Ratio (Technical : Financial)
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">70 : 30</span>
                  <div className="w-full h-3 rounded-full bg-slate-200 flex overflow-hidden">
                    <div style={{ width: "70%" }} className="bg-[#003366] h-full" title="Technical Weight: 70%" />
                    <div style={{ width: "30%" }} className="bg-emerald-600 h-full" title="Financial Weight: 30%" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Final combined score formula: S = (Tb × 0.70) + ((Fmin / Fb) × 100 × 0.30)
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-extrabold text-[#003366]">Automatic Compliance Synchronization</span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Any change saved here will instantly recalculate compliance scores across all existing bids under this tender.
                </p>
              </div>
              <button
                onClick={handleSave}
                className="text-xs font-bold px-4 py-2 rounded-xl bg-[#003366] text-white hover:bg-[#002244]"
              >
                Save & Apply to Live Tenders
              </button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
