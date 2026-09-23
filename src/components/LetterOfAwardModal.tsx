"use client";

import React, { useRef } from "react";
import { X, Printer, Download, Award, ShieldCheck, CheckCircle2 } from "lucide-react";
import { downloadReport } from "@/lib/reports";

interface LOAModalProps {
  isOpen: boolean;
  onClose: () => void;
  tender: any;
  winningBid: any;
}

export function LetterOfAwardModal({
  isOpen,
  onClose,
  tender,
  winningBid,
}: LOAModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !tender || !winningBid) return null;

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const company =
    winningBid.bidder?.bidderProfile?.companyName ||
    winningBid.bidder?.name ||
    "ABC Tech Solutions Private Limited";

  const gstin =
    winningBid.bidder?.bidderProfile?.gstin || "27ABCDE1234F1Z5";

  const evaluatedPrice = Number(winningBid.evaluatedPrice || 20558000);
  const pbgAmount = Math.round(evaluatedPrice * 0.05);

  // Deterministic LOA dispatch number derived from tender reference + year
  // Consistent across renders, prints, and downloads (no Math.random jitter)
  const tenderSeed = tender?.referenceNo || tender?.id || winningBid?.id || "TENDER";
  const loaSerial = React.useMemo(() => {
    return tenderSeed
      .replace(/[^A-Z0-9]/gi, "")
      .toUpperCase()
      .split("")
      .reduce((acc: number, ch: string) => (acc * 31 + ch.charCodeAt(0)) & 0xffffff, 0)
      .toString()
      .padStart(6, "0")
      .slice(-6);
  }, [tenderSeed]);
  const loaNumber = `MHA/PROC/2026/LOA-${loaSerial}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadTXT = () => {
    const content = `========================================================================================
GOVERNMENT OF INDIA
MINISTRY OF HOME AFFAIRS
CENTRAL ARMED POLICE FORCES PROCUREMENT DIVISION
NORTH BLOCK, NEW DELHI - 110001
========================================================================================
SPEED POST / REGISTERED E-MAIL
DISPATCH NUMBER: ${loaNumber}
DATE OF ISSUE: ${dateStr}

TO:
${company}
GSTIN: ${gstin}

SUBJECT: STATUTORY LETTER OF AWARD (LOA) FOR CONTRACT AGAINST TENDER ${tender.referenceNo}
REF: 1. GeM Tender Notice No: ${tender.referenceNo}
     2. Your Technical & Financial Electronic Bid No: ${winningBid.id}

Sir / Madam,

1. ACCEPTANCE OF TENDER:
   The Competent Authority in the Ministry of Home Affairs is pleased to accept your
   electronic proposal for the work:
   "${tender.title}"
   at your quoted evaluated contract price of:
   Rs. ${evaluatedPrice.toLocaleString("en-IN")}
   all-inclusive of GST, transit insurance, packing, delivery, installation and 3-year warranty.

2. PERFORMANCE SECURITY:
   In accordance with Rule 170 of the General Financial Rules (GFR 2017), you are
   hereby required to submit a Performance Bank Guarantee (PBG) equivalent to 5% of
   the contract value, amounting to:
   Rs. ${pbgAmount.toLocaleString("en-IN")}
   from any Scheduled Commercial Bank in India in favour of "Pay & Accounts Officer, MHA",
   valid for a period of sixty (60) days beyond the date of completion of all contractual obligations.

3. COMMENCEMENT OF WORK:
   You are directed to execute the formal contract agreement on non-judicial stamp paper of
   requisite value within fifteen (15) calendar days from the date of issue of this letter.

Yours faithfully,

For and on behalf of the President of India,

(Rajesh Kumar)
Deputy Secretary to the Government of India
Ministry of Home Affairs, New Delhi
Seal of the Ministry of Home Affairs
========================================================================================`;

    downloadReport(`Letter_of_Award_${tender.referenceNo.replace(/\//g, "_")}.txt`, content);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 relative my-8 overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Official Letter of Award (LOA)</h3>
              <p className="text-[11px] text-slate-500">Ministry of Home Affairs • GFR Rule 173 Compliance</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#003366]" />
              <span>Print LOA</span>
            </button>
            <button
              onClick={handleDownloadTXT}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#003366] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .TXT</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Government Award Document */}
        <div ref={printRef} className="p-6 sm:p-10 font-serif text-slate-900 space-y-6 printable-document">
          {/* Official Emblem Banner */}
          <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
            <div className="flex justify-center mb-1 text-2xl">🏛️</div>
            <h2 className="text-base font-bold uppercase tracking-wider font-sans">Government of India</h2>
            <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight font-sans text-[#002244]">
              Ministry of Home Affairs
            </h1>
            <p className="text-xs uppercase font-semibold text-slate-600 font-sans">
              Procurement & Contracts Division • North Block, New Delhi - 110001
            </p>
          </div>

          {/* Dispatch Notice Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-sans text-slate-700 gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className="font-bold text-slate-500">Dispatch Reference: </span>
              <span className="font-mono font-bold text-slate-900">{loaNumber}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Date of Issue: </span>
              <span className="font-bold text-slate-900">{dateStr}</span>
            </div>
          </div>

          {/* Recipient Box */}
          <div className="text-xs font-sans space-y-0.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Addressed To:</span>
            <p className="font-bold text-sm text-slate-900">{company}</p>
            <p className="text-slate-600">GSTIN: <span className="font-mono font-bold text-slate-800">{gstin}</span></p>
            <p className="text-slate-500">Authorized e-Procurement Portal Vendor</p>
          </div>

          {/* Subject Line */}
          <div className="text-xs font-sans bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
            <p className="font-bold text-[#003366]">
              SUBJECT: LETTER OF AWARD (LOA) FOR CONTRACT AGAINST TENDER {tender.referenceNo}
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              REF: GeM Electronic NIT No. {tender.referenceNo} & Your Evaluated Responsive Proposal
            </p>
          </div>

          {/* Formal Body Paragraphs */}
          <div className="text-xs leading-relaxed space-y-4 font-sans text-slate-800">
            <p>
              <strong>1. ACCEPTANCE OF PROPOSAL:</strong> The Competent Authority in the Ministry of Home Affairs is pleased to inform you that your electronic bid for <em>&quot;{tender.title}&quot;</em> has been evaluated as the <strong>Lowest Evaluated Responsive Bid (L1)</strong> under Rule 173 of General Financial Rules (GFR 2017). Your proposal is hereby formally accepted at your quoted evaluated contract value of:
            </p>

            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-center font-sans">
              <span className="text-xs uppercase font-bold text-emerald-800 block">Accepted Total Contract Value (All Inclusive of GST)</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-950 block mt-1">
                ₹ {evaluatedPrice.toLocaleString("en-IN")}
              </span>
            </div>

            <p>
              <strong>2. PERFORMANCE SECURITY (PBG):</strong> In accordance with Clause 14 of GFR 2017, you are required to furnish a <strong>Performance Bank Guarantee (PBG) of 5%</strong> amounting to <strong>₹ {pbgAmount.toLocaleString("en-IN")}</strong> from any Scheduled Commercial Bank in India, valid for sixty (60) days beyond the scheduled completion of all contractual obligations.
            </p>

            <p>
              <strong>3. CONTRACT EXECUTION:</strong> You are directed to sign the tripartite contract agreement on requisite non-judicial stamp paper within fifteen (15) working days from the date of dispatch of this letter.
            </p>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-8 border-t-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans text-xs">
            <div className="text-center sm:text-left space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Digitally Sealed by Competent Authority</span>
              </div>
              <p className="text-[10px] text-slate-500">Ministry of Home Affairs • Central Government of India</p>
            </div>

            <div className="text-center sm:text-right space-y-0.5">
              <p className="font-bold text-slate-900 text-sm">Rajesh Kumar</p>
              <p className="text-xs text-slate-600 font-medium">Deputy Secretary (Procurement)</p>
              <p className="text-[10px] text-slate-500">For and on behalf of the President of India</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
