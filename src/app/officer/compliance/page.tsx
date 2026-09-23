"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Shell } from "@/components/Shell";
import Link from "next/link";
import {
  InteractiveEvidenceGraph,
  EvidenceGraphChain,
} from "@/components/compliance/InteractiveEvidenceGraph";
import { SideBySideInspectorModal } from "@/components/compliance/SideBySideInspectorModal";
import {
  TenderRuleEngineSelector,
  TENDER_RULE_PROFILES,
  TenderRuleProfile,
} from "@/components/compliance/TenderRuleEngineSelector";

interface BidEvaluation {
  id: string;
  bidderName: string;
  tenderRef: string;
  category: string;
  score: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  inconsistenciesCount: number;
  entities: {
    gstin: string;
    pan: string;
    udyam: string;
    turnover: string;
  };
  inconsistencies: {
    title: string;
    description: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
    field: string;
  }[];
  evidence: {
    documentName: string;
    extractedField: string;
    extractedValue: string;
    sourceApi: string;
    matchStatus: "MATCHED" | "DISCREPANCY" | "EXPIRED";
  }[];
  aiRecommendation: {
    verdict: "QUALIFIED_PACKET_A" | "CLARIFICATION_REQUIRED" | "DISQUALIFY";
    rationale: string;
    confidence: number;
  };
}

const SAMPLE_DATA: BidEvaluation[] = [
  {
    id: "BID-2025-01",
    bidderName: "ABC Technology Private Limited",
    tenderRef: "GEM/2025/B/902184",
    category: "MSME Class-I (Local Content: 68%)",
    score: 95,
    riskLevel: "LOW",
    inconsistenciesCount: 0,
    entities: {
      gstin: "27AAACA9821R1ZX",
      pan: "AAACA9821R",
      udyam: "UDYAM-MH-02-0049182",
      turnover: "₹18.40 Cr (Avg last 3 yrs)",
    },
    inconsistencies: [],
    evidence: [
      {
        documentName: "GST_Registration_Certificate.pdf",
        extractedField: "GSTIN",
        extractedValue: "27AAACA9821R1ZX (Active)",
        sourceApi: "GSTN Common Portal Live API",
        matchStatus: "MATCHED",
      },
      {
        documentName: "Audited_Balance_Sheet_FY23-24.pdf",
        extractedField: "CA UDIN",
        extractedValue: "24049182AAAA129384",
        sourceApi: "ICAI UDIN Verification Registry",
        matchStatus: "MATCHED",
      },
      {
        documentName: "Make_In_India_Declaration.pdf",
        extractedField: "Local Content %",
        extractedValue: "68.5% (Class-I Supplier)",
        sourceApi: "DPIIT Local Content Formula Engine",
        matchStatus: "MATCHED",
      },
    ],
    aiRecommendation: {
      verdict: "QUALIFIED_PACKET_A",
      rationale: "All statutory credentials, CA UDIN certificates, and Make in India thresholds satisfy 100% of NIT criteria without deviation.",
      confidence: 98,
    },
  },
  {
    id: "BID-2025-02",
    bidderName: "SecureIT Solutions LLP",
    tenderRef: "GEM/2025/B/902184",
    category: "Non-MSME Class-I (Local Content: 52%)",
    score: 72,
    riskLevel: "MEDIUM",
    inconsistenciesCount: 2,
    entities: {
      gstin: "07AACCS4412Q1Z8",
      pan: "AACCS4412Q",
      udyam: "N/A (Non-MSME)",
      turnover: "₹11.20 Cr (Avg last 3 yrs)",
    },
    inconsistencies: [
      {
        title: "Trade Name Mismatch Across Statutory Filings",
        description: "PAN registered as 'SecureIT Solutions LLP', while GST Certificate lists Trade Name as 'SecureIT Cyber Systems'.",
        severity: "MEDIUM",
        field: "Legal Identity",
      },
      {
        title: "OEM Authorization Validity Period Close to Expiry",
        description: "Server hardware Manufacturer Authorization Form (MAF) expires in 45 days, violating the 180-day NIT requirement.",
        severity: "MEDIUM",
        field: "Technical Capability",
      },
    ],
    evidence: [
      {
        documentName: "PAN_Card.pdf",
        extractedField: "Entity Name",
        extractedValue: "SecureIT Solutions LLP",
        sourceApi: "CBDT PAN Verification Service",
        matchStatus: "MATCHED",
      },
      {
        documentName: "GST_Certificate.pdf",
        extractedField: "Trade Name",
        extractedValue: "SecureIT Cyber Systems",
        sourceApi: "GSTN Registry API",
        matchStatus: "DISCREPANCY",
      },
      {
        documentName: "OEM_MAF_Authorization.pdf",
        extractedField: "Validity Date",
        extractedValue: "30-Apr-2025 (45 days left)",
        sourceApi: "Document OCR Date Extractor",
        matchStatus: "DISCREPANCY",
      },
    ],
    aiRecommendation: {
      verdict: "CLARIFICATION_REQUIRED",
      rationale: "Requires official clarification from bidder regarding Trade Name alignment and an extended OEM Manufacturer Authorization Form.",
      confidence: 89,
    },
  },
  {
    id: "BID-2025-03",
    bidderName: "Global Infra Systems India",
    tenderRef: "GEM/2025/B/902184",
    category: "Class-II Supplier (Local Content: 28%)",
    score: 41,
    riskLevel: "HIGH",
    inconsistenciesCount: 3,
    entities: {
      gstin: "29AAACG9912K1Z2",
      pan: "AAACG9912K",
      udyam: "N/A",
      turnover: "₹4.80 Cr (NIT requires ₹6.25 Cr)",
    },
    inconsistencies: [
      {
        title: "Minimum Turnover Shortfall",
        description: "Average turnover ₹4.80 Cr is below mandatory NIT threshold of ₹6.25 Cr (50% of estimated cost).",
        severity: "HIGH",
        field: "Financial Eligibility",
      },
      {
        title: "Make in India Class-I Non-Compliance",
        description: "Quoted local content is 28%. Tender clause 4.2 specifically restricts bidding to Class-I Local Suppliers (min 50%).",
        severity: "HIGH",
        field: "Statutory Order",
      },
      {
        title: "Unverifiable CA UDIN Number",
        description: "ICAI UDIN portal returned 'Record Not Found' for the turnover declaration submitted under Annexure IV.",
        severity: "HIGH",
        field: "Document Integrity",
      },
    ],
    evidence: [
      {
        documentName: "Turnover_Certificate.pdf",
        extractedField: "Turnover Amount",
        extractedValue: "₹4,80,00,000",
        sourceApi: "NIT Rule Validator",
        matchStatus: "DISCREPANCY",
      },
      {
        documentName: "MII_Local_Content.pdf",
        extractedField: "Local Content",
        extractedValue: "28.0% (Non-compliant)",
        sourceApi: "DPIIT Order Checker",
        matchStatus: "DISCREPANCY",
      },
    ],
    aiRecommendation: {
      verdict: "DISQUALIFY",
      rationale: "Fails mandatory financial turnover threshold and violates DPIIT Class-I purchase preference mandate. CA UDIN cannot be verified.",
      confidence: 99,
    },
  },
];

function getEvidenceChainsForBid(bid: BidEvaluation): EvidenceGraphChain[] {
  const isBid1 = bid.id === "BID-2025-01";
  const isBid2 = bid.id === "BID-2025-02";
  const isBid3 = bid.id === "BID-2025-03";

  return [
    {
      id: `${bid.id}-chain-gstin`,
      title: "Statutory GSTN Registration & Filing Standing",
      tenderClause: "NIT-STAT-01",
      status: isBid2 ? "DISCREPANCY" : "VERIFIED",
      riskDelta: isBid2 ? "+15" : "+0",
      nodes: {
        clause: {
          id: "clause-gst",
          label: "Active GSTIN Registration (GFR Rule 144)",
          category: "CLAUSE",
          status: "VERIFIED",
          clauseRef: "NIT Section 3.1",
          details: "Vendor must possess active GSTIN registered under the applicable state jurisdiction with regular GSTR-3B filings.",
        },
        field: {
          id: "field-gst",
          label: "GSTIN Identifier",
          category: "FIELD",
          status: isBid2 ? "DISCREPANCY" : "VERIFIED",
          documentName: "GST_Certificate_REG06.pdf",
          extractedValue: bid.entities.gstin,
          shaHash: "f3b20498acde91240984ba092834b9281a942048f029348123ab",
          confidence: 99.2,
          details: isBid2
            ? "Trade Name extracted as 'SecureIT Cyber Systems' whereas Legal Name on PAN is 'SecureIT Solutions LLP'."
            : "GSTIN extracted with 99.2% OCR confidence from Page 1 of Form GST REG-06.",
          rawPayload: {
            extractedGSTIN: bid.entities.gstin,
            legalName: bid.bidderName,
            tradeName: isBid2 ? "SecureIT Cyber Systems" : bid.bidderName,
            state: "Delhi (07)",
          },
        },
        govApi: {
          id: "gov-gst",
          label: "GSTN API Gateway",
          category: "GOV_API",
          status: "VERIFIED",
          govSource: "GSTN Live Registry (taxpayer/v2.1)",
          govValue: bid.entities.gstin,
          confidence: 100,
          details: "Authority response indicates Active taxpayer with no default flags over the last 24 return filing periods.",
          rawPayload: {
            gstin: bid.entities.gstin,
            legalName: bid.bidderName,
            status: "ACTIVE",
            filingFrequency: "MONTHLY",
            mode: "SIMULATED_SOURCE",
          },
        },
        match: {
          id: "match-gst",
          label: "Statutory Identification Match",
          category: "MATCH",
          status: isBid2 ? "DISCREPANCY" : "VERIFIED",
          details: isBid2
            ? "Trade name mismatch flag (+15 risk). Bidder must furnish an amendment certificate or trade name declaration."
            : "100% entity consistency between uploaded GST certificate and live GSTN tax portal.",
        },
      },
    },
    {
      id: `${bid.id}-chain-pan`,
      title: "Permanent Account Number (PAN) & Tax Clearance",
      tenderClause: "NIT-STAT-02",
      status: "VERIFIED",
      riskDelta: "+0",
      nodes: {
        clause: {
          id: "clause-pan",
          label: "Valid Corporate PAN Card (CBDT Seeding)",
          category: "CLAUSE",
          status: "VERIFIED",
          clauseRef: "NIT Section 3.2",
          details: "PAN must be registered in the name of the bidding entity with active Aadhaar/Bank seeding.",
        },
        field: {
          id: "field-pan",
          label: "PAN Number",
          category: "FIELD",
          status: "VERIFIED",
          documentName: "PAN_Card_Incorporation.pdf",
          extractedValue: bid.entities.pan,
          shaHash: "e481029348123ab84ba092834b9281a942048f02934f3b20498ac",
          confidence: 99.8,
          details: "PAN extracted from high-resolution scan of NSDL laminated card.",
        },
        govApi: {
          id: "gov-pan",
          label: "CBDT Verification Gateway",
          category: "GOV_API",
          status: "VERIFIED",
          govSource: "Income Tax Department (CBDT)",
          govValue: bid.entities.pan,
          details: "PAN is VALID, OPERATIVE, and seeded with MCA21 corporate identity.",
          rawPayload: {
            pan: bid.entities.pan,
            status: "OPERATIVE",
            entityType: "COMPANY",
            mode: "SIMULATED_SOURCE",
          },
        },
        match: {
          id: "match-pan",
          label: "Taxpayer Identity Match",
          category: "MATCH",
          status: "VERIFIED",
          details: "Positions 3-10 of GSTIN perfectly match the corporate PAN record.",
        },
      },
    },
    {
      id: `${bid.id}-chain-turnover`,
      title: "Audited Annual Turnover & CA UDIN Certificate",
      tenderClause: "NIT-FIN-03",
      status: isBid3 ? "DISCREPANCY" : "VERIFIED",
      riskDelta: isBid3 ? "+30" : "+0",
      nodes: {
        clause: {
          id: "clause-turnover",
          label: "Minimum Average Annual Turnover >= ₹6.25 Cr",
          category: "CLAUSE",
          status: isBid3 ? "DISCREPANCY" : "VERIFIED",
          clauseRef: "NIT Section 4.1",
          details: "Bidder must furnish CA-certified turnover for last 3 financial years with valid 18-digit ICAI UDIN.",
        },
        field: {
          id: "field-turnover",
          label: "Turnover & UDIN",
          category: "FIELD",
          status: isBid3 ? "DISCREPANCY" : "VERIFIED",
          documentName: "CA_Audited_Turnover_Cert.pdf",
          extractedValue: isBid3 ? "₹2.10 Cr (Fails ₹6.25 Cr)" : bid.entities.turnover,
          shaHash: "92834b9281a942048f029348123ab84ba0f3b20498acde91240984",
          confidence: 98.6,
          details: isBid3
            ? "Turnover of ₹2.10 Cr falls below minimum eligibility threshold of ₹6.25 Cr. UDIN missing 18-digit checksum."
            : "Turnover satisfies eligibility. UDIN 24098234ABC12345 verified with ICAI register.",
        },
        govApi: {
          id: "gov-turnover",
          label: "ICAI UDIN Registry",
          category: "GOV_API",
          status: isBid3 ? "DISCREPANCY" : "VERIFIED",
          govSource: "ICAI UDIN Portal API",
          govValue: isBid3 ? "INVALID_UDIN" : "24098234ABC12345",
          details: isBid3
            ? "UDIN not found on ICAI repository. Document marked non-authentic."
            : "UDIN actively registered by CA Rajesh Sharma (FCA 098234).",
          rawPayload: {
            udin: isBid3 ? "UNREGISTERED" : "24098234ABC12345",
            status: isBid3 ? "FAILED" : "VERIFIED",
            caName: "Rajesh Sharma & Associates",
          },
        },
        match: {
          id: "match-turnover",
          label: "Financial Qualification Verdict",
          category: "MATCH",
          status: isBid3 ? "DISCREPANCY" : "VERIFIED",
          details: isBid3
            ? "Financial qualification failed. Deficit of ₹4.15 Cr against NIT requirement (+30 risk)."
            : "Complies with financial turnover mandate.",
        },
      },
    },
    {
      id: `${bid.id}-chain-msme`,
      title: "MSME Udyam Standing & GFR Rule 170 EMD Waiver",
      tenderClause: "NIT-STAT-04",
      status: "VERIFIED",
      riskDelta: "+0",
      nodes: {
        clause: {
          id: "clause-msme",
          label: "GFR 2017 Rule 170 / Public Procurement Policy 2012",
          category: "CLAUSE",
          status: "VERIFIED",
          clauseRef: "NIT Section 2.3",
          details: "Micro and Small Enterprises (MSEs) registered with Udyam are entitled to 100% EMD exemption and tender document cost waiver.",
        },
        field: {
          id: "field-msme",
          label: "Udyam Certificate",
          category: "FIELD",
          status: "VERIFIED",
          documentName: "Udyam_Registration_Certificate.pdf",
          extractedValue: bid.entities.udyam,
          shaHash: "123ab84ba092834b9281a942048f029348f3b20498acde91240984",
          confidence: 99.5,
          details: `Udyam category: ${bid.category}`,
        },
        govApi: {
          id: "gov-msme",
          label: "Ministry of MSME Gateway",
          category: "GOV_API",
          status: "VERIFIED",
          govSource: "Udyam Registration Portal (msme.gov.in)",
          govValue: bid.entities.udyam,
          details: "Registration is ACTIVE. Enterprise qualifies under Small Enterprise manufacturing & services schedule.",
          rawPayload: {
            udyam: bid.entities.udyam,
            enterpriseType: "Small",
            majorActivity: "Services / IT",
          },
        },
        match: {
          id: "match-msme",
          label: "EMD Statutory Waiver",
          category: "MATCH",
          status: "VERIFIED",
          details: "EMD waiver approved under GFR Rule 170. Bidder is exempt from submitting ₹2,50,000 bank guarantee.",
        },
      },
    },
    {
      id: `${bid.id}-chain-debarment`,
      title: "CPPP & GeM National Debarment / Debarment Affidavit",
      tenderClause: "NIT-VET-05",
      status: "VERIFIED",
      riskDelta: "+0",
      nodes: {
        clause: {
          id: "clause-debarment",
          label: "Debarment & Non-Blacklisting Certification",
          category: "CLAUSE",
          status: "VERIFIED",
          clauseRef: "NIT Section 1.4",
          details: "Vendor must not be banned or debarred by any Central/State Ministry, PSU, or autonomous body.",
        },
        field: {
          id: "field-debarment",
          label: "Non-Debarment Affidavit",
          category: "FIELD",
          status: "VERIFIED",
          documentName: "Non_Debarment_Affidavit.pdf",
          extractedValue: `Affidavit for ${bid.bidderName}`,
          shaHash: "092834b9281a942048f029348123ab84ba0f3b20498acde91240984",
          confidence: 98.9,
          details: "Notarized affidavit executed on 100-rupee non-judicial stamp paper.",
        },
        govApi: {
          id: "gov-debarment",
          label: "Central Public Procurement Clearinghouse",
          category: "GOV_API",
          status: "VERIFIED",
          govSource: "CPPP & GeM Debarred Vendor Registry",
          govValue: "CLEARED_NOT_LISTED",
          details: "Entity and director names cross-checked across 412 active debarment orders. 0 matches found.",
          rawPayload: {
            entity: bid.bidderName,
            status: "CLEAR",
            databaseCheckTimestamp: new Date().toISOString(),
          },
        },
        match: {
          id: "match-debarment",
          label: "Integrity Clearance",
          category: "MATCH",
          status: "VERIFIED",
          details: "Bidder cleared for public procurement participation under CVC integrity pact.",
        },
      },
    },
  ];
}

function OfficerComplianceContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedBidId, setSelectedBidId] = useState<string>(SAMPLE_DATA[0].id);
  const [actionNotice, setActionNotice] = useState<string>("");
  const [selectedInspectChain, setSelectedInspectChain] = useState<EvidenceGraphChain | null>(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState<boolean>(false);
  const [activeRuleProfile, setActiveRuleProfile] = useState<TenderRuleProfile>(TENDER_RULE_PROFILES[0]);
  const [replayAttempt, setReplayAttempt] = useState<number>(1);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);

  const currentBid = SAMPLE_DATA.find((b) => b.id === selectedBidId) || SAMPLE_DATA[0];
  const evidenceChains = getEvidenceChainsForBid(currentBid);

  const handleApplyVerdict = (verdict: string) => {
    setActionNotice(`Applied verdict: ${verdict} for ${currentBid.bidderName}. Synchronized to Officer Evaluation Sheet.`);
    setTimeout(() => setActionNotice(""), 4500);
  };

  const handleReverify = () => {
    setIsReplaying(true);
    setTimeout(() => {
      setIsReplaying(false);
      const nextAttempt = replayAttempt + 1;
      setReplayAttempt(nextAttempt);
      setActionNotice(`Re-verification snapshot Attempt #${nextAttempt} generated & SHA-256 forward-hash chained into WORM ledger.`);
      setTimeout(() => setActionNotice(""), 4500);
    }, 1000);
  };

  return (
    <Shell
      role="officer"
      title="AI Compliance & Document Intelligence Suite"
      subtitle="Automated forensic entity verification, inconsistency detection, and CVC rule engine"
    >
      <div className="space-y-6">
        {/* Statutory Governance & Authority Notice */}
        <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs font-semibold flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base">⚖️</span>
            <span>
              <strong>AI Decision Support:</strong> Under GFR 2017 & CVC Guidelines, all automated extraction, scoring, and cross-matching results are advisory. The final qualification/disqualification decision rests exclusively with the designated Procurement Officer / Tender Committee.
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-amber-200/60 px-2 py-0.5 rounded text-amber-900 shrink-0">
            GFR RULE 144 ADVISORY
          </span>
        </div>

        {/* Tender-Specific Rule Engine Selector */}
        <TenderRuleEngineSelector
          activeProfileId={activeRuleProfile.id}
          onSelectProfile={(p) => {
            setActiveRuleProfile(p);
            setActionNotice(`Active statutory evaluation criteria updated to "${p.categoryName}". Scored rules refreshed.`);
            setTimeout(() => setActionNotice(""), 4500);
          }}
        />

        {/* Top Header */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <h2 className="text-xl font-black text-slate-900">AI Compliance & Forensic Audit Center</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Cross-examines submitted credentials against live statutory databases (GSTN, CBDT, MCA21, ICAI UDIN, GeM Debarment).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Inspecting Proposal</span>
              <select
                value={selectedBidId}
                onChange={(e) => setSelectedBidId(e.target.value)}
                className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
              >
                {SAMPLE_DATA.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bidderName} (Score: {b.score}%)
                  </option>
                ))}
              </select>
            </div>

            <div className="text-right pl-2 border-l border-slate-200">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Audit Snapshot</span>
              <button
                onClick={handleReverify}
                disabled={isReplaying}
                className="mt-0.5 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-300 transition cursor-pointer"
              >
                <span>{isReplaying ? "⏳" : "🔄"}</span>
                <span>{isReplaying ? "Re-verifying..." : `Re-Verify (Attempt #${replayAttempt})`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Action Message */}
        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <span>✓</span>
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex items-center gap-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "dashboard"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📊</span>
            <span>Compliance Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`pb-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "risk"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>⚠️</span>
            <span>Compliance & Risk Matrix</span>
          </button>
          <button
            onClick={() => setActiveTab("inconsistencies")}
            className={`pb-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "inconsistencies"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🔍</span>
            <span>Inconsistencies & Flags ({currentBid.inconsistencies.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("crossmatch")}
            className={`pb-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "crossmatch"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🔗</span>
            <span>Cross-Document Reasoner (4)</span>
          </button>
          <button
            onClick={() => setActiveTab("debarment")}
            className={`pb-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "debarment"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🛡️</span>
            <span>Debarment / Blacklist Scan</span>
          </button>
          <button
            onClick={() => setActiveTab("evidence")}
            className={`pb-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "evidence"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📑</span>
            <span>Evidence Graph</span>
          </button>
          <button
            onClick={() => setActiveTab("recommendation")}
            className={`pb-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "recommendation"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>⚖️</span>
            <span>AI Recommendation</span>
          </button>
          <button
            onClick={() => setActiveTab("certificate")}
            className={`pb-3 px-4 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "certificate"
                ? "border-[#003366] text-[#003366]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>📜</span>
            <span>Assessment Certificate</span>
          </button>
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-5 bg-white border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Selected Bidder</span>
                <p className="text-base font-black text-slate-900 mt-1">{currentBid.bidderName}</p>
                <span className="text-[11px] text-slate-500">{currentBid.category}</span>
              </div>
              <div className="card p-5 bg-white border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">AI Compliance Score</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-3xl font-black text-[#003366]">{currentBid.score}%</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      currentBid.score >= 80
                        ? "bg-emerald-100 text-emerald-800"
                        : currentBid.score >= 60
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {currentBid.score >= 80 ? "Fully Compliant" : currentBid.score >= 60 ? "Requires Review" : "Disqualified"}
                  </span>
                </div>
              </div>
              <div className="card p-5 bg-white border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Forensic Risk Rating</span>
                <p
                  className={`text-xl font-black mt-1 ${
                    currentBid.riskLevel === "LOW"
                      ? "text-emerald-700"
                      : currentBid.riskLevel === "MEDIUM"
                      ? "text-amber-700"
                      : "text-rose-700"
                  }`}
                >
                  {currentBid.riskLevel} RISK
                </p>
                <span className="text-[11px] text-slate-500">
                  {currentBid.inconsistenciesCount === 0
                    ? "Zero irregularities detected"
                    : `${currentBid.inconsistenciesCount} anomalies flagged`}
                </span>
              </div>
            </div>

            {/* Statutory Entity Cards */}
            <div className="card p-6 bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Extracted Statutory Credentials</h3>
                  <p className="text-xs text-slate-500">Cross-referenced against national registries</p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-[#003366]">
                  DEMO VERIFIED — SIMULATED SOURCE
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 block">GSTIN NUMBER</span>
                  <span className="font-mono text-xs font-bold text-slate-900">{currentBid.entities.gstin}</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-700 font-semibold">✓ Active Regular</span>
                    <span className="text-[9px] font-mono text-slate-400">GSTN</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 block">PERMANENT ACCOUNT NUMBER (PAN)</span>
                  <span className="font-mono text-xs font-bold text-slate-900">{currentBid.entities.pan}</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-700 font-semibold">✓ CBDT Linked</span>
                    <span className="text-[9px] font-mono text-slate-400">NSDL/IT</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 block">UDYAM MSME NUMBER</span>
                  <span className="font-mono text-xs font-bold text-slate-900">{currentBid.entities.udyam}</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-700 font-semibold">✓ Small Enterprise</span>
                    <span className="text-[9px] font-mono text-slate-400">MSME</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-400 block">AUDITED ANNUAL TURNOVER</span>
                  <span className="text-xs font-bold text-slate-900">{currentBid.entities.turnover}</span>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-700 font-semibold">✓ UDIN Verified</span>
                    <span className="text-[9px] font-mono text-slate-400">ICAI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Compliance & Risk Matrix */}
        {activeTab === "risk" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Multi-Dimensional Risk Matrix</h3>
                <p className="text-xs text-slate-500">Evaluates Statutory, Technical, Financial, and Integrity vectors</p>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                CVC Integrity Standard
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">1. Statutory Tax & Corporate Standing</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">LOW RISK</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  GST returns filed consecutively for the past 24 months without default. Corporate status is Active under MCA21.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">2. Financial Solvency & Working Capital</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${currentBid.score < 50 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {currentBid.score < 50 ? "CRITICAL RISK" : "COMPLIANT"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {currentBid.score < 50
                    ? "Turnover shortfall against Rule 173 GFR. Fails 50% threshold of estimated tender value."
                    : "Turnover comfortably exceeds ₹6.25 Cr threshold with certified bank solvency certificate."}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">3. Make in India & Local Content Mandate</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${currentBid.score < 50 ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {currentBid.score < 50 ? "NON-LOCAL" : "CLASS-I LOCAL"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Self-declaration verified with Bill of Materials (BOM) location breakdown.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">4. Document Integrity & DSC Validation</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">100% VERIFIED</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  All PDF attachments cryptographically validated with CCA Class-3 hardware signature token.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Inconsistencies & Flags */}
        {activeTab === "inconsistencies" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Detected Cross-Document Inconsistencies</h3>
                <p className="text-xs text-slate-500">Flags raised by AI cross-referencing uploaded files with statutory registries</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {currentBid.inconsistencies.length} Flags
              </span>
            </div>

            {currentBid.inconsistencies.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <span className="text-3xl block">🛡️</span>
                <p className="text-sm font-bold text-emerald-900">Zero Inconsistencies Detected</p>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  All names, addresses, PAN, GSTIN, and financial numbers are 100% consistent across all uploaded annexures and statutory government portals.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentBid.inconsistencies.map((inc, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      inc.severity === "HIGH"
                        ? "bg-rose-50/60 border-rose-200"
                        : "bg-amber-50/60 border-amber-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                            inc.severity === "HIGH" ? "bg-rose-200 text-rose-900" : "bg-amber-200 text-amber-900"
                          }`}
                        >
                          {inc.severity} SEVERITY
                        </span>
                        <span className="text-xs font-bold text-slate-900">{inc.title}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">{inc.description}</p>
                      <span className="text-[10px] text-slate-500 font-semibold block mt-1">
                        Category: {inc.field}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const matchedChain =
                            evidenceChains.find((c) =>
                              c.nodes.field.label.toLowerCase().includes(inc.field.toLowerCase()) ||
                              c.title.toLowerCase().includes(inc.field.toLowerCase()) ||
                              c.nodes.field.details?.toLowerCase().includes(inc.title.toLowerCase())
                            ) || evidenceChains[0];
                          setSelectedInspectChain(matchedChain);
                          setIsInspectModalOpen(true);
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#003366] text-white hover:bg-[#002244] shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <span>🔍</span>
                        <span>Side-by-Side</span>
                      </button>
                      <button
                        onClick={() => {
                          setActionNotice(`Clarification query officially issued & recorded into WORM audit ledger for ${currentBid.bidderName}.`);
                          setTimeout(() => setActionNotice(""), 4500);
                        }}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-2xs transition cursor-pointer"
                      >
                        Issue Clarification
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Interactive Statutory Evidence Graph */}
        {activeTab === "evidence" && (
          <div className="space-y-6">
            <InteractiveEvidenceGraph
              chains={evidenceChains}
              onInspectDocument={(chain) => {
                setSelectedInspectChain(chain);
                setIsInspectModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Tab 5: AI Recommendation */}
        {activeTab === "recommendation" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Automated Evaluation Recommendation</h3>
                <p className="text-xs text-slate-500">Synthesized rationale based on GFR 2017 & NIT Tender Rules</p>
              </div>
              <span className="text-xs font-black bg-blue-100 text-[#003366] px-3 py-1 rounded-full">
                AI Confidence: {currentBid.aiRecommendation.confidence}%
              </span>
            </div>

            <div
              className={`p-6 rounded-2xl border-2 space-y-3 ${
                currentBid.aiRecommendation.verdict === "QUALIFIED_PACKET_A"
                  ? "border-emerald-500 bg-emerald-50/50"
                  : currentBid.aiRecommendation.verdict === "CLARIFICATION_REQUIRED"
                  ? "border-amber-500 bg-amber-50/50"
                  : "border-rose-500 bg-rose-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Official Verdict</span>
                <span
                  className={`text-sm font-black px-3 py-1 rounded-lg uppercase ${
                    currentBid.aiRecommendation.verdict === "QUALIFIED_PACKET_A"
                      ? "bg-emerald-600 text-white"
                      : currentBid.aiRecommendation.verdict === "CLARIFICATION_REQUIRED"
                      ? "bg-amber-600 text-white"
                      : "bg-rose-600 text-white"
                  }`}
                >
                  {currentBid.aiRecommendation.verdict.replace(/_/g, " ")}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-800 pt-1">
                "{currentBid.aiRecommendation.rationale}"
              </p>

              <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Ready to apply verdict to official committee evaluation proceedings.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApplyVerdict(currentBid.aiRecommendation.verdict)}
                    className="btn-primary text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
                  >
                    Accept AI Recommendation & Sync
                  </button>
                  <Link
                    href={`/officer/decision?bidId=${currentBid.id}`}
                    className="text-xs font-bold px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                  >
                    Manual Override →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Cross-Document Reasoner */}
        {activeTab === "crossmatch" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>🔗</span> Cross-Document Entity Reasoner
                </h3>
                <p className="text-xs text-slate-500">
                  Detects name variations, PAN-GSTIN linkage, and statutory contradictions across uploaded bid artifacts.
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                4/4 CHECKS EVALUATED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Check 1: PAN in GSTIN */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">1. PAN Embedded Inside GSTIN</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    EXACT MATCH (100%)
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 font-mono text-xs space-y-1 text-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">GST Certificate:</span>
                    <span className="font-bold text-[#003366]">27<span className="bg-amber-100 text-amber-900 px-0.5 rounded">AABCU9603R</span>1ZM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PAN Card:</span>
                    <span className="font-bold text-[#003366] bg-amber-100 text-amber-900 px-0.5 rounded">AABCU9603R</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Characters 3-12 of GSTIN match the submitted PAN card. Confirms the legal tax entity is identical.
                </p>
              </div>

              {/* Check 2: Legal Name Variation */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">2. Corporate Entity Name Consistency</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    ACCEPTABLE VARIATION (94%)
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 font-mono text-xs space-y-1 text-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">PAN Card:</span>
                    <span className="font-bold">ABC Technology Private Limited</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GST Portal:</span>
                    <span className="font-bold">ABC Technology Pvt Ltd</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Permissible abbreviation standard ('Pvt Ltd' vs 'Private Limited'). Verified against MCA21 CIN database.
                </p>
              </div>

              {/* Check 3: Registered Address */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">3. Registered Office & Operating Address</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    STATE MATCH (82%)
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 font-mono text-xs space-y-1 text-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">GST Jurisdiction:</span>
                    <span className="font-bold">State Code 27 (Mumbai, MH)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tender Office:</span>
                    <span className="font-bold">Pune Branch, MH</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Operating branch in Pune operates under principal business registration in Mumbai under same State GSTIN.
                </p>
              </div>

              {/* Check 4: CA UDIN Validity */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">4. Chartered Accountant UDIN Registry</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    VERIFIED (100%)
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 font-mono text-xs space-y-1 text-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">CA Certificate:</span>
                    <span className="font-bold text-emerald-700">UDIN: 25048192AAAAAB1920</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ICAI Membership:</span>
                    <span className="font-bold">Active Member No: 048192</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  18-Digit UDIN generated for FY 2024-25. Admissible as statutory evidence under CVC guidelines.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Debarment / Blacklist Scan */}
        {activeTab === "debarment" && (
          <div className="card p-6 bg-white border border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>🛡️</span> National Procurement Debarment & Vigilance Watchlist
                </h3>
                <p className="text-xs text-slate-500">
                  Statutory debarment check under Rule 151 GFR 2017 across CPPP, GeM 4.0, and Ministry registries.
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                STATUS: CLEAR
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Central Public Procurement Portal</span>
                <p className="text-sm font-black text-emerald-700">CPPP Watchlist: CLEARED</p>
                <p className="text-xs text-slate-600">No active debarment or suspension orders issued by central ministries.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">GeM Marketplace</span>
                <p className="text-sm font-black text-emerald-700">GeM Seller Status: ACTIVE</p>
                <p className="text-xs text-slate-600">0 administrative incidents or strikes logged in GeM incident management.</p>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400">Fuzzy Entity Similarity</span>
                <p className="text-sm font-black text-emerald-700">Banned Match: 0% (Clean)</p>
                <p className="text-xs text-slate-600">Entity bears zero correlation to known debarred shell entities.</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 text-white text-xs font-mono flex items-center justify-between">
              <span>Debarment Ledger Hash: e8a719c2f5d94821a00c...</span>
              <span className="text-emerald-400 font-bold">Checked: 14 Sep 2026</span>
            </div>
          </div>
        )}

        {/* Tab 8: Official Assessment Certificate */}
        {activeTab === "certificate" && (
          <div className="card p-8 bg-white border-2 border-slate-300 shadow-md max-w-4xl mx-auto space-y-6 print:m-0 print:border-none">
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#003366] block">
                GOVERNMENT OF INDIA · CENTRAL e-PROCUREMENT COMPLIANCE ENGINE
              </span>
              <h2 className="text-xl font-black text-slate-900 uppercase">
                Bid Compliance & Statutory Assessment Certificate
              </h2>
              <span className="text-xs font-mono text-slate-500 block">
                Certificate ID: CERT-BIDBRIDGE-2026-902184 · GFR 2017 Rule 144 Compliant
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tender Reference</span>
                <span className="font-bold text-slate-900">GEM/2025/B/902184</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Evaluated Bidder</span>
                <span className="font-bold text-slate-900">{currentBid.bidderName}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Compliance Score</span>
                <span className="font-black text-emerald-700 text-sm">{currentBid.score}% (Technical Packet A Qualified)</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Debarment / Blacklist Status</span>
                <span className="font-black text-emerald-700 text-sm">CLEARED (CPPP & GeM Registry)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#003366] space-y-1">
              <span className="font-bold block">Statutory Source Verification Proof:</span>
              <p className="text-[11px] text-slate-600">
                GSTIN: 27AABCU9603R1ZM (Active Regular) · PAN: AABCU9603R (Operative) · UDIN: 25048192AAAAAB1920 (ICAI Validated) · Udyam: Small Enterprise (PPP-MSE EMD Exemption Granted).
              </p>
              <span className="text-[9px] font-mono font-bold text-slate-500 block pt-1">
                Transparency Notice: DEMO VERIFIED — SIMULATED SOURCE
              </span>
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
              <div className="text-[10px] text-slate-400 font-mono">
                SHA-256 Digest: 9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b1c2d3e4f...
              </div>
              <button
                onClick={() => window.print()}
                className="btn-primary px-5 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer print:hidden"
              >
                🖨️ Print Official Certificate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Forensic PDF & Registry Inspector Modal */}
      <SideBySideInspectorModal
        isOpen={isInspectModalOpen}
        onClose={() => setIsInspectModalOpen(false)}
        chain={selectedInspectChain}
        onApplyOfficerOverride={(action, notes) => {
          setActionNotice(`Officer Adjudication recorded under GFR 2017: "${action}" (Notes: ${notes || "None"})`);
          setTimeout(() => setActionNotice(""), 4500);
        }}
      />
    </Shell>
  );
}

export default function OfficerCompliancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading AI Compliance Suite...</div>}>
      <OfficerComplianceContent />
    </Suspense>
  );
}
