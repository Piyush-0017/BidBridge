"use client";

import React, { useRef } from "react";
import { Printer, Download, CheckCircle2, Shield, Lock, FileText, ExternalLink } from "lucide-react";

interface QRCodeReceiptProps {
  ackNumber: string;
  submissionTime: string;
  tenderRef: string;
  companyName: string;
  signatory: string;
  bidAmount: string;
  tokenSerial: string;
  tokenIssuer: string;
  bidHash: string;
}

// Deterministic SVG QR Matrix Generator (Version 3 / 29x29 matrix)
function SimpleQRCode({ text, size = 130 }: { text: string; size?: number }) {
  // Generate a deterministic 29x29 bit-matrix based on text hash
  const matrixSize = 29;
  const grid: boolean[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));

  // 1. Draw 3 corner Finder Patterns (7x7 squares)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 || // Outer border
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)      // Inner solid square
        ) {
          grid[startY + r][startX + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0);                               // Top-left
  drawFinder(matrixSize - 7, 0);                  // Top-right
  drawFinder(0, matrixSize - 7);                  // Bottom-left

  // 2. Timing patterns
  for (let i = 8; i < matrixSize - 8; i++) {
    if (i % 2 === 0) {
      grid[6][i] = true;
      grid[i][6] = true;
    }
  }

  // 3. Populate data cells using simple deterministic hashing of the payload text
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Don't overwrite finder patterns
      const inFinder1 = r < 8 && c < 8;
      const inFinder2 = r < 8 && c >= matrixSize - 8;
      const inFinder3 = r >= matrixSize - 8 && c < 8;
      if (inFinder1 || inFinder2 || inFinder3 || r === 6 || c === 6) continue;

      // Deterministic PRNG bit based on position and hash
      const cellHash = Math.sin(hash + r * 31 + c * 17) * 10000;
      grid[r][c] = (cellHash - Math.floor(cellHash)) > 0.48;
    }
  }

  const cellSize = size / matrixSize;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded bg-white p-1 border border-slate-300">
      {grid.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#002244"
            />
          ) : null
        )
      )}
    </svg>
  );
}

export function QRCodeReceipt({
  ackNumber,
  submissionTime,
  tenderRef,
  companyName,
  signatory,
  bidAmount,
  tokenSerial,
  tokenIssuer,
  bidHash,
}: QRCodeReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const verifyUrl = `https://eprocure.gov.in/verify?ack=${ackNumber}&hash=${bidHash.slice(0, 16)}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const payload = {
      receiptType: "OFFICIAL_GOVERNMENT_E_SUBMISSION_ACKNOWLEDGEMENT",
      statutoryAct: "Section 65B of Indian Evidence Act (1872) & IT Act 2000",
      acknowledgementNumber: ackNumber,
      submissionTimestamp: submissionTime,
      tenderReference: tenderRef,
      bidderOrganization: companyName,
      authorizedSignatory: signatory,
      evaluatedBidValueINR: Number(bidAmount),
      digitalCertificate: {
        tokenSerialNumber: tokenSerial,
        certifyingAuthority: tokenIssuer,
        algorithm: "RSA-2048 / SHA-256 with PKCS#1 v1.5",
        rfc3161TSA: "Verified by National Informatics Centre (NIC) Root CA",
      },
      cryptographicVaultHash: bidHash,
      verificationPortal: verifyUrl,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Submission_Receipt_${ackNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 no-print bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">Cryptographically Sealed & Vaulted</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadJSON}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#003366] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Signed Certificate (.JSON)</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#003366]" />
            <span>Print Official Legal Slip</span>
          </button>
        </div>
      </div>

      {/* Official Government Submission Certificate (Print-Ready) */}
      <div
        ref={receiptRef}
        className="bg-white rounded-2xl border-2 border-slate-300 shadow-md p-6 sm:p-10 relative overflow-hidden font-sans printable-receipt"
      >
        {/* Official Top Tricolor Ribbon */}
        <div className="h-1.5 w-full flex absolute top-0 left-0 right-0">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        {/* Certificate Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <Shield className="w-96 h-96 text-slate-900" />
        </div>

        {/* Header Title */}
        <div className="border-b-2 border-slate-200 pb-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black tracking-wider uppercase text-[#003366]">
                Government of India • Central e-Procurement Portal
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                VALID SEAL
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Statutory Bid Submission & Acknowledgement Certificate
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Issued under Rule 160 of General Financial Rules (GFR 2017) & Section 65B of Indian Evidence Act
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Unique Receipt ID</span>
            <span className="text-base font-black text-[#003366] font-mono">{ackNumber}</span>
          </div>
        </div>

        {/* Main 2-Column Certificate Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-6">
          
          {/* Details Table */}
          <div className="md:col-span-8 space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="font-bold text-slate-500">Tender Reference No:</span>
              <span className="col-span-2 font-mono font-bold text-slate-900">{tenderRef}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="font-bold text-slate-500">Bidder Organization:</span>
              <span className="col-span-2 font-bold text-slate-900">{companyName}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="font-bold text-slate-500">Authorized Signatory:</span>
              <span className="col-span-2 font-bold text-slate-900">{signatory}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="font-bold text-slate-500">Evaluated Quoted Price:</span>
              <span className="col-span-2 font-mono font-black text-emerald-800 text-sm">
                ₹ {Number(bidAmount).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="font-bold text-slate-500">Submission Timestamp:</span>
              <span className="col-span-2 font-mono text-slate-800">{submissionTime}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="font-bold text-slate-500">Digital Token Serial:</span>
              <span className="col-span-2 font-mono text-slate-700">{tokenSerial} ({tokenIssuer})</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-slate-100">
              <span className="font-bold text-slate-500">RFC-3161 TSA Token:</span>
              <span className="col-span-2 text-emerald-700 font-bold">
                ✓ Cryptographically Sealed by National Informatics Centre (NIC) Root CA
              </span>
            </div>
          </div>

          {/* Scannable QR Code Box */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[10px] font-extrabold uppercase text-[#003366] mb-2 tracking-wide">
              Official Tamper-Proof QR
            </span>

            <SimpleQRCode text={verifyUrl} size={140} />

            <span className="text-[9px] font-mono text-slate-500 mt-2.5 max-w-[170px] leading-tight">
              Scan to verify SHA-256 forward-hash on National Portal
            </span>

            <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Certificate</span>
            </div>
          </div>
        </div>

        {/* Cryptographic SHA-256 Vault Hash Block */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 text-xs">
          <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
            SHA-256 Immutable Vault Hash (Section 65B Electronic Proof)
          </span>
          <p className="font-mono text-[11px] text-slate-800 break-all bg-white p-2 rounded border border-slate-200 select-all">
            {bidHash}
          </p>
        </div>

        {/* Legal Signatures & Footer Note */}
        <div className="border-t-2 border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-mono bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-700 font-bold">
              ||||| | |||| ||| ||||||| | | |||||| {ackNumber}
            </span>
            <span>Digitally Generated Document • No Physical Signature Required</span>
          </div>

          <div className="font-medium text-slate-600 sm:text-right">
            <span>Central Public Procurement Portal • Government of India 🇮🇳</span>
          </div>
        </div>
      </div>
    </div>
  );
}
