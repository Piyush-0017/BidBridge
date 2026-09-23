"use client";

import React, { useState } from "react";

export interface TenderRuleProfile {
  id: string;
  categoryName: string;
  code: string;
  icon: string;
  description: string;
  mandatoryClauses: {
    clauseNo: string;
    title: string;
    authority: string;
    description: string;
    riskWeight: number;
  }[];
  statutoryWaivers: {
    rule: string;
    condition: string;
    benefit: string;
  }[];
}

export const TENDER_RULE_PROFILES: TenderRuleProfile[] = [
  {
    id: "RULE-CCTV-01",
    categoryName: "CCTV & Surveillance Hardware",
    code: "SURVEILLANCE_CCTV",
    icon: "📹",
    description: "Mandates BIS certification, OEM Authorization Form-A, and DPIIT Land Border security compliance.",
    mandatoryClauses: [
      {
        clauseNo: "NIT-SEC-01",
        title: "BIS CRS IS-13252 Certification",
        authority: "Bureau of Indian Standards",
        description: "All IP cameras, NVRs, and VMS controllers must carry valid BIS Registration numbers.",
        riskWeight: 25,
      },
      {
        clauseNo: "NIT-SEC-02",
        title: "OEM Manufacturer Authorization (Form-A)",
        authority: "Original Equipment Manufacturer",
        description: "Direct OEM authorization guaranteeing 5-year spares availability and SLA escalation.",
        riskWeight: 20,
      },
      {
        clauseNo: "NIT-SEC-03",
        title: "DPIIT Land Border Rule Order (2020)",
        authority: "Ministry of Finance / DPIIT",
        description: "Mandatory compliance certificate confirming no beneficial ownership from land border countries.",
        riskWeight: 30,
      },
    ],
    statutoryWaivers: [
      {
        rule: "Make in India (Class-I)",
        condition: "Local content >= 50%",
        benefit: "Purchase preference over L1 if within 20% margin",
      },
    ],
  },
  {
    id: "RULE-MANPOWER-02",
    categoryName: "Manpower & Facility Services",
    code: "MANPOWER_SERVICES",
    icon: "👷",
    description: "Strict statutory compliance covering EPFO, ESIC, Minimum Wages, and Contract Labour regulations.",
    mandatoryClauses: [
      {
        clauseNo: "NIT-LAB-01",
        title: "EPFO Establishment Code & ECR Clearance",
        authority: "Employees' Provident Fund Organisation",
        description: "Active establishment code with consistent electronic challan-cum-return (ECR) for past 12 months.",
        riskWeight: 25,
      },
      {
        clauseNo: "NIT-LAB-02",
        title: "ESIC Registration & Contribution Proof",
        authority: "Employees' State Insurance Corporation",
        description: "Valid ESIC registration covering deployed contractual personnel.",
        riskWeight: 20,
      },
      {
        clauseNo: "NIT-LAB-03",
        title: "Minimum Wages Act 1948 Undertaking",
        authority: "Chief Labour Commissioner",
        description: "Notarized affidavit agreeing to pay prevailing central/state minimum wages without deductions.",
        riskWeight: 25,
      },
    ],
    statutoryWaivers: [
      {
        rule: "MSME GFR Rule 170",
        condition: "Valid Udyam Registration",
        benefit: "100% Exemption from Earnest Money Deposit (EMD)",
      },
    ],
  },
  {
    id: "RULE-IT-03",
    categoryName: "IT & Sovereign Cloud Infrastructure",
    code: "IT_CYBER_INFRA",
    icon: "💻",
    description: "Evaluates ISO 27001 data security, CMMI Level 3+, and MeitY Sovereign Cloud empanelment.",
    mandatoryClauses: [
      {
        clauseNo: "NIT-IT-01",
        title: "ISO/IEC 27001:2022 ISMS Certification",
        authority: "Accredited ISO Registrar",
        description: "Information Security Management System covering hosting, development, and support.",
        riskWeight: 20,
      },
      {
        clauseNo: "NIT-IT-02",
        title: "CMMI Dev / Services Level 3+",
        authority: "CMMI Institute",
        description: "Demonstrated maturity in system architecture and SLA delivery.",
        riskWeight: 15,
      },
      {
        clauseNo: "NIT-IT-03",
        title: "Data Localization Undertaking",
        authority: "CERT-In / MeitY Guidelines",
        description: "All procurement and telemetry data must reside strictly within Indian sovereign boundaries.",
        riskWeight: 30,
      },
    ],
    statutoryWaivers: [
      {
        rule: "DPIIT Recognized Startup",
        condition: "DPIIT Certificate < 10 yrs old",
        benefit: "Turnover & prior experience criteria completely waived",
      },
    ],
  },
  {
    id: "RULE-CIVIL-04",
    categoryName: "Civil Works & Engineering Projects",
    code: "CIVIL_ENGINEERING",
    icon: "🏗️",
    description: "CPWD/State PWD registration grading, Bank Solvency Certificate, and plant machinery schedules.",
    mandatoryClauses: [
      {
        clauseNo: "NIT-CIV-01",
        title: "CPWD / PWD Class-I Enlistment",
        authority: "Central Public Works Department",
        description: "Valid enlistment certificate corresponding to the tender financial limit.",
        riskWeight: 25,
      },
      {
        clauseNo: "NIT-CIV-02",
        title: "Banker's Solvency Certificate (40% Value)",
        authority: "Scheduled Commercial Bank",
        description: "Solvency certificate issued within last 6 months from tender submission date.",
        riskWeight: 25,
      },
    ],
    statutoryWaivers: [
      {
        rule: "CPWD Green Building",
        condition: "GRIHA / IGBC Certified",
        benefit: "5% bonus scoring in technical evaluation",
      },
    ],
  },
];

interface Props {
  activeProfileId: string;
  onSelectProfile: (profile: TenderRuleProfile) => void;
}

export function TenderRuleEngineSelector({ activeProfileId, onSelectProfile }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const activeProfile =
    TENDER_RULE_PROFILES.find((p) => p.id === activeProfileId) || TENDER_RULE_PROFILES[0];

  return (
    <div className="space-y-3">
      {/* Profile Bar */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-blue-50 text-2xl border border-blue-100 shrink-0">
            {activeProfile.icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                Active Rule Profile
              </span>
              <span className="text-xs font-mono text-slate-500 font-bold">{activeProfile.code}</span>
            </div>
            <h4 className="text-sm font-black text-slate-900 mt-0.5">{activeProfile.categoryName}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{activeProfile.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-3.5 py-2 rounded-xl bg-[#003366] text-white text-xs font-bold hover:bg-[#002244] transition flex items-center gap-2 shadow-2xs"
          >
            <span>⚙️</span>
            <span>Switch Rule Preset</span>
            <span className="text-[10px]">▼</span>
          </button>
        </div>
      </div>

      {/* Preset Drawer / Dropdown */}
      {isOpen && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-lg space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Select Tender-Specific Statutory Compliance Preset
            </h5>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {TENDER_RULE_PROFILES.map((p) => {
              const isSelected = p.id === activeProfile.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProfile(p);
                    setIsOpen(false);
                  }}
                  className={`p-4 rounded-xl border-2 transition cursor-pointer text-left ${
                    isSelected
                      ? "bg-white border-[#003366] shadow-sm ring-2 ring-[#003366]/20"
                      : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{p.icon}</span>
                    {isSelected && (
                      <span className="text-[10px] font-bold bg-[#003366] text-white px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <h6 className="text-xs font-black text-slate-900 mt-2">{p.categoryName}</h6>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.description}</p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{p.mandatoryClauses.length} Mandatory Clauses</span>
                    <span className="font-bold text-[#003366]">Select ➔</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
