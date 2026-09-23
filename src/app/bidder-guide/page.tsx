"use client";

import Link from "next/link";
import { GovernmentHeader } from "@/components/GovernmentHeader";

export default function BidderGuidePage() {
  const steps = [
    {
      num: 1,
      title: "Register on E-Procurement Portal",
      sub: "Create your bidder account",
      icon: "👤",
      content: [
        "Visit official portal (https://eprocure.gov.in)",
        "Click on 'New Bidder Registration'",
        "Fill in company & authorized signatory details",
        "Verify email ID and mobile via OTP",
        "Register Class-3 Digital Signature Certificate (DSC)",
      ],
      badge: "Account Setup",
    },
    {
      num: 2,
      title: "Search and Select Tender",
      sub: "Find relevant tenders",
      icon: "🔎",
      content: [
        "Use advanced search filters (dept, category, value)",
        "Filter by GeM / Non-GeM / EMD Exemption",
        "Open the tender and read basic details & NIT",
        "Check important dates: EMD, Pre-bid, Closing",
      ],
      badge: "Discovery",
    },
    {
      num: 3,
      title: "Read and Download Documents",
      sub: "Understand the requirements",
      icon: "📥",
      content: [
        "Download Notice Inviting Tender (NIT)",
        "Read Tender Document / RFP & Scope of Work",
        "Review Technical Specifications & BOQ format",
        "Download GCC, SCC, Corrigenda, and Annexures",
      ],
      badge: "Due Diligence",
    },
    {
      num: 4,
      title: "Check Eligibility",
      sub: "Make sure you qualify",
      icon: "✅",
      content: [
        "Company/Firm registration (ROC/LLP/Partnership)",
        "Valid GSTIN and PAN registration",
        "Minimum average annual turnover (Past 3 FY)",
        "Similar work experience (completion certificates)",
        "OEM authorization & technical certifications",
      ],
      badge: "Screening",
    },
    {
      num: 5,
      title: "Prepare Required Documents",
      sub: "Organize all documents",
      icon: "📁",
      content: [
        "Folder 01: Company documents (ROC, PAN, GST)",
        "Folder 02: Eligibility documents (Turnover, ITR, Audited BS)",
        "Folder 03: Technical proposal & compliance matrix",
        "Folder 04: Financial BOQ with pricing",
        "Folder 05: EMD / Fee exemption proof (MSME/Udyam)",
      ],
      badge: "Preparation",
    },
    {
      num: 6,
      title: "Prepare Technical Bid",
      sub: "Show that you are eligible & capable",
      icon: "📑",
      content: [
        "Company profile & organizational structure",
        "Experience certificates & client appreciation letters",
        "Technical proposal & product datasheets",
        "Manpower, equipment & infrastructure list",
        "Make in India Local Content Declaration",
      ],
      badge: "Technical Packet",
    },
    {
      num: 7,
      title: "Prepare Financial Bid (BOQ)",
      sub: "Provide your price as per BOQ",
      icon: "💰",
      content: [
        "Download official BOQ Excel / template",
        "Enter unit rates without modifying formulas",
        "Ensure GST / taxes are quoted as instructed",
        "Verify grand total matches technical scope",
      ],
      badge: "Financial Packet",
    },
    {
      num: 8,
      title: "Upload Documents on Portal",
      sub: "Submit technical & financial bid",
      icon: "📤",
      content: [
        "Upload scanned PDF/A compliant documents",
        "Run AI Document Verification & OCR check",
        "Review AI Compliance Score & flag resolution",
        "Pay EMD / Tender fee or upload MSME exemption",
      ],
      badge: "Upload & Verify",
    },
    {
      num: 9,
      title: "Final Verification",
      sub: "Check everything before submission",
      icon: "🔍",
      content: [
        "Check all mandatory documents are green",
        "Verify file readability and official stamps",
        "Ensure financial bid total is calculated",
        "Attach DSC token & test certificate validity",
        "Check self-declaration tick box",
      ],
      badge: "Quality Check",
    },
    {
      num: 10,
      title: "Track Your Bid",
      sub: "After submission",
      icon: "🚀",
      content: [
        "Download and save digitally signed Acknowledgement",
        "Track status: Submitted → Technical → Financial",
        "Respond promptly to officer clarification requests",
        "Attend online bid opening session",
      ],
      badge: "Post-Submission",
    },
  ];

  const mandatoryDocs = [
    "1. Company Registration Certificate (ROC/LLP/Partnership)",
    "2. PAN Card of Company / Enterprise",
    "3. GST Registration Certificate (GSTIN)",
    "4. Financial Statements (Audited Balance Sheet & P&L)",
    "5. Experience Certificates / Work Completion Orders",
    "6. OEM Authorization Certificate (MAF)",
    "7. EMD / Bid Security (Bank Guarantee / DD / Online)",
    "8. Tender Fee Payment Proof or Exemption Certificate",
    "9. Technical Compliance Sheets & Product Brochures",
    "10. Declarations & Undertakings (Non-blacklisting, MII)",
    "11. Any Other Documents as specified in NIT",
  ];

  const commonMistakes = [
    "Not reading the tender document & corrigenda fully",
    "Missing mandatory documents or blurry scans",
    "Incorrect format or unreadable password-protected files",
    "Not meeting minimum average annual turnover criteria",
    "Modifying formula cells in the standard BOQ template",
    "Not submitting EMD or invalid MSME exemption claim",
    "Waiting until the last 30 minutes before bid end time",
    "Forgetting to click 'Submit with DSC' after upload",
    "Not downloading & archiving the digitally signed Acknowledgement",
  ];

  return (
    <div className="h-screen bg-[#f4f6f9] flex flex-col overflow-hidden font-sans">
      <div className="shrink-0 z-50">
        <GovernmentHeader
          activeRole="bidder"
          userName="ABC Tech Solutions Pvt. Ltd."
          userSub="Bidder Portal • Guide & Compliance Reference"
        />
      </div>

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Guide Banner */}
        <div className="bg-gradient-to-r from-[#003366] via-[#0b5cad] to-[#003366] text-white py-6 px-4 border-b border-blue-900 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-amber-400 text-slate-900 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Official E-Procurement Handbook
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            How to Fill and Submit a Government Tender (As a Bidder)
          </h1>
          <p className="text-sm md:text-base text-blue-100 mt-1 max-w-3xl mx-auto">
            Complete Step-by-Step Guide with Required Documents, AI Compliance Verification & Best Practices
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-amber-200">
            <span>✓ Be a Registered Bidder</span>
            <span>•</span>
            <span>✓ Follow the Tender Rules</span>
            <span>•</span>
            <span>✓ Submit Correct & Complete Documents</span>
            <span>•</span>
            <span>✓ Meet Deadlines</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto p-4 md:p-6 w-full space-y-6">
        {/* Navigation back bar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/" className="text-blue-700 font-semibold hover:underline">
              ← Back to 16-Panel Showcase
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">Bidder Workflow Guide</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/bidder/tenders"
              className="px-3 py-1.5 bg-[#003366] text-white text-xs font-bold rounded-lg hover:bg-[#0b5cad] transition"
            >
              Browse Live Tenders →
            </Link>
          </div>
        </div>

        {/* 10 Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((s) => (
            <div
              key={s.num}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between hover:shadow-md transition group hover:border-blue-400"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-full bg-[#003366] text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {s.num}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-900 transition">
                  {s.title}
                </h3>
                <p className="text-[11px] text-slate-500 mb-3 font-medium">{s.sub}</p>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  {s.content.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Step {s.num} of 10</span>
                <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition">Details →</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom 3 Reference Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Important Documents */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-3 text-[#003366]">
              <span className="text-lg">📁</span>
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Important Documents Required (Typical List)
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {mandatoryDocs.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-blue-700 font-bold text-[11px]">✓</span>
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Common Mistakes */}
          <div className="bg-white rounded-xl border border-red-200 p-5 shadow-2xs">
            <div className="flex items-center gap-2 mb-3 text-red-700">
              <span className="text-lg">⚠️</span>
              <h3 className="text-sm font-bold uppercase tracking-wide">
                Common Mistakes to Avoid
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {commonMistakes.map((mistake, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-red-50/50 p-2 rounded border border-red-100">
                  <span className="text-red-600 font-bold text-[11px]">✗</span>
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tender Process Flow + Trophy */}
          <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-emerald-800">
                <span className="text-lg">🔄</span>
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  Tender Process Flow (For a Bidder)
                </h3>
              </div>
              <ol className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">1</span> Register on portal</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">2</span> Search and select tender</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">3</span> Download & study documents</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">4</span> Check eligibility criteria</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">5</span> Prepare technical & financial packet</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">6</span> Run AI Compliance & document check</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">7</span> Pay fees / EMD exemption</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">8</span> Final submit with DSC</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">9</span> Track bid status</li>
                <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">10</span> Respond to clarifications</li>
              </ol>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-emerald-500 to-[#138808] text-white text-center shadow-xs">
              <span className="text-2xl">🏆</span>
              <p className="font-bold text-sm mt-1">Good Luck with Your Bidding!</p>
              <p className="text-[11px] text-emerald-100">
                Follow the process carefully to increase your chances of winning the tender.
              </p>
              <Link
                href="/bidder/tenders"
                className="inline-block mt-2 px-4 py-1.5 bg-white text-emerald-900 font-bold text-xs rounded-md shadow-xs hover:bg-emerald-50 transition"
              >
                Start Bidding Now →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#002244] text-white py-3 px-6 text-xs text-center border-t border-slate-300 mt-auto shrink-0">
        <p className="text-slate-300">
          Government e-Procurement Portal • Ministry of Electronics & Information Technology, Government of India
        </p>
      </footer>
      </div>
    </div>
  );
}
