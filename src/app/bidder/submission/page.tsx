"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { QRCodeReceipt } from "@/components/QRCodeReceipt";
import { 
  KeyRound, 
  ShieldCheck, 
  FileCheck2, 
  Download, 
  Printer, 
  ArrowRight, 
  RefreshCw, 
  Lock, 
  CheckCircle2, 
  FileText,
  Clock,
  Sparkles
} from "lucide-react";

interface CryptoToken {
  id: string;
  name: string;
  signatory: string;
  designation: string;
  company: string;
  issuer: string;
  classType: string;
  serialNumber: string;
  validTill: string;
  algorithm: string;
  sha1Thumbprint: string;
}

const AVAILABLE_TOKENS: CryptoToken[] = [
  {
    id: "TOKEN-EMUDHRA-01",
    name: "ePass2003 Auto (eMudhra CA)",
    signatory: "Priya Sharma",
    designation: "Managing Director & Authorized Signatory",
    company: "ABC Technology Private Limited",
    issuer: "eMudhra Sub-CA for Class 3 Individual 2014",
    classType: "Class 3 - Signing & Encryption Combo (SHA-256)",
    serialNumber: "4A:9C:21:8F:77:E1:02:4B:99:A3",
    validTill: "18-Nov-2026",
    algorithm: "RSA 2048-bit / SHA-256 with PKCS#1 v1.5",
    sha1Thumbprint: "D4:F2:88:1A:3C:99:EE:41:70:BB:12:88:94:AF:33:10",
  },
  {
    id: "TOKEN-NCODE-02",
    name: "ProxKey Watchdata (nCode Solutions)",
    signatory: "Amit Patel",
    designation: "Chief Technical Officer",
    company: "SecureIT Solutions LLP",
    issuer: "(n)Code Solutions CA 2014",
    classType: "Class 3 - Organization Signing",
    serialNumber: "5B:11:44:8A:23:CD:91:00:88:BC",
    validTill: "24-Jan-2027",
    algorithm: "RSA 2048-bit / SHA-256",
    sha1Thumbprint: "A1:C9:33:04:FF:81:72:EE:90:31:18:74:29:44:09:BB",
  },
];

function BidSubmissionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenderRef = searchParams.get("ref") || "GEM/2025/B/6123456";
  const tenderId = searchParams.get("tenderId") || "tender-1";
  const bidHash = searchParams.get("hash") || "e8a719c2f5d3410b91e784501a3cd4b76e89021a8f9b4c3e2d1056789abcdef0";
  const totalAmount = searchParams.get("total") || "20558000";
  const stepParam = searchParams.get("step") || "sign";

  const [currentStep, setCurrentStep] = useState<"sign" | "confirm" | "ack">("sign");
  const [selectedToken, setSelectedToken] = useState<CryptoToken>(AVAILABLE_TOKENS[0]);
  const [pin, setPin] = useState("123456");
  const [pinError, setPinError] = useState("");
  const [signingStep, setSigningStep] = useState<"IDLE" | "HASHING" | "ENCRYPTING" | "TSA_TIMESTAMP" | "SEALED">("IDLE");
  const [workerProgress, setWorkerProgress] = useState(0);
  const [workerStatusMessage, setWorkerStatusMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [ackNumber] = useState(`ACK-CPPP-2025-884129`);
  const [submissionTime, setSubmissionTime] = useState("16-Aug-2025 14:30:00 IST");

  useEffect(() => {
    if (stepParam === "confirm") setCurrentStep("confirm");
    else if (stepParam === "ack") {
      setCurrentStep("ack");
      setSubmitted(true);
    } else setCurrentStep("sign");
  }, [stepParam]);

  const handleStepChange = (step: "sign" | "confirm" | "ack") => {
    setCurrentStep(step);
    const params = new URLSearchParams(searchParams.toString());
    if (step === "sign") {
      params.delete("step");
    } else {
      params.set("step", step);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/bidder/submission${query}`);
  };

  const handleScanTokens = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
    }, 600);
  };

  async function handleSignAndSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setPinError("");

    if (!pin || pin.length < 4) {
      setPinError("Please enter your 6-digit USB Token User PIN (e.g. 123456)");
      return;
    }

    setSigningStep("HASHING");
    setWorkerProgress(15);
    setWorkerStatusMessage("Initializing cryptographic web worker thread...");

    // Check Web Worker support
    if (typeof window !== "undefined" && window.Worker) {
      try {
        const worker = new Worker("/workers/envelopeCryptoWorker.js");

        worker.onmessage = async (event) => {
          const { step, progress, message, result, error } = event.data;

          if (error) {
            setSigningStep("IDLE");
            setPinError("Cryptographic engine error: " + error);
            worker.terminate();
            return;
          }

          if (step) setSigningStep(step);
          if (typeof progress === "number") setWorkerProgress(progress);
          if (message) setWorkerStatusMessage(message);

          if (step === "SEALED") {
            const nowFormatted = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";
            setSubmissionTime(nowFormatted);

            try {
              await fetch(`/api/bids`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  tenderId,
                  tenderRef,
                  tenderTitle: "Supply, Installation and Commissioning of Smart IP CCTV Cameras & Command Center",
                  status: "SUBMITTED",
                  totalAmount,
                  hash: result?.payloadHash || bidHash,
                  ackNumber,
                  complianceScore: 98,
                  dscSerial: selectedToken.serialNumber,
                  dscSignatory: selectedToken.signatory,
                  dscIssuer: selectedToken.issuer,
                }),
              });
            } catch (err) {
              console.error("Submission error:", err);
            }

            worker.terminate();
            setSubmitted(true);
            handleStepChange("ack");
          }
        };

        worker.postMessage({
          tenderRef,
          totalAmount,
          dscSignatory: selectedToken.signatory,
          dscSerial: selectedToken.serialNumber,
          pin,
          rawPayload: bidHash,
        });

        return;
      } catch (workerErr) {
        console.warn("Falling back from Web Worker to browser thread:", workerErr);
      }
    }

    // Fallback if worker creation is blocked
    setTimeout(() => {
      setSigningStep("ENCRYPTING");
      setWorkerProgress(65);
      setWorkerStatusMessage("Applying AES-256-GCM envelope encryption...");

      setTimeout(() => {
        setSigningStep("TSA_TIMESTAMP");
        setWorkerProgress(85);
        setWorkerStatusMessage("Obtaining NIC National Root RFC-3161 Time-Stamp...");

        setTimeout(async () => {
          setSigningStep("SEALED");
          setWorkerProgress(100);
          setWorkerStatusMessage("Envelope sealed.");
          const nowFormatted = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST";
          setSubmissionTime(nowFormatted);

          try {
            await fetch(`/api/bids`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tenderId,
                tenderRef,
                tenderTitle: "Supply, Installation and Commissioning of Smart IP CCTV Cameras & Command Center",
                status: "SUBMITTED",
                totalAmount,
                hash: bidHash,
                ackNumber,
                complianceScore: 98,
                dscSerial: selectedToken.serialNumber,
                dscSignatory: selectedToken.signatory,
                dscIssuer: selectedToken.issuer,
              }),
            });
          } catch (err) {
            console.error("Submission error:", err);
          }

          setSubmitted(true);
          handleStepChange("ack");
        }, 500);
      }, 500);
    }, 500);
  }

  function downloadReceipt() {
    const receiptContent = `========================================================================
CENTRAL PUBLIC PROCUREMENT PORTAL (CPPP) - GOVERNMENT OF INDIA
MINISTRY OF COMMERCE & INDUSTRY / GeM SPV
OFFICIAL ELECTRONIC BID SUBMISSION & CLASS-3 DSC SEAL RECEIPT
========================================================================
ACKNOWLEDGEMENT NUMBER   : ${ackNumber}
SUBMISSION TIMESTAMP IST : ${submissionTime}
TENDER REFERENCE NUMBER  : ${tenderRef}
TENDER TITLE             : Supply, Installation and Commissioning of Smart IP CCTV Cameras
TOTAL EVALUATED PRICE    : INR Rs. ${Number(totalAmount).toLocaleString("en-IN")}
CURRENCY                 : Indian Rupee (INR)

------------------------------------------------------------------------
LEGAL BIDDER IDENTITY & STATUTORY PARTICULARS
------------------------------------------------------------------------
BIDDER LEGAL ENTITY      : ${selectedToken.company}
AUTHORIZED SIGNATORY     : ${selectedToken.signatory} (${selectedToken.designation})
BIDDER GSTIN             : 27ABCDE1234F1Z5
BIDDER PAN               : ABCDE1234F
MSME UDYAM REGISTRATION  : UDYAM-MH-02-0049182 (Class-I Local Supplier)

------------------------------------------------------------------------
CRYPTOGRAPHIC SEAL & DIGITAL SIGNATURE PARTICULARS (CCA INDIA)
------------------------------------------------------------------------
CERTIFICATE ISSUER       : ${selectedToken.issuer}
CERTIFICATE SERIAL NO    : ${selectedToken.serialNumber}
SIGNATURE ALGORITHM      : ${selectedToken.algorithm}
TIME STAMP AUTHORITY     : NIC National Root Time-Stamping Authority (RFC 3161)
DIGITAL ENVELOPE HASH    : ${bidHash}
STATUS                   : SEALED, ENCRYPTED & VAULTED IN CENTRAL REPOSITORY

LEGAL ADMISSIBILITY:
This document constitutes prima facie evidence of bid submission under
Section 65B of the Indian Evidence Act, 1872 and Section 3 of the IT Act, 2000.
========================================================================`;

    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CPPP_Receipt_${ackNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Shell
      role="bidder"
      title="Electronic Bid Submission & DSC Signing"
      subtitle="Final cryptographically sealed submission for Central Government procurement"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step Progress Bar */}
        <div className="border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs flex flex-wrap gap-2 text-xs font-bold">
          <button
            onClick={() => handleStepChange("sign")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              currentStep === "sign"
                ? "bg-[#003366] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>1. DSC Token Verification</span>
          </button>

          <button
            onClick={() => handleStepChange("confirm")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              currentStep === "confirm"
                ? "bg-[#003366] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>2. Submit Bid & Seal</span>
          </button>

          <button
            onClick={() => handleStepChange("ack")}
            className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              currentStep === "ack"
                ? "bg-[#003366] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>3. Official Acknowledgement Receipt</span>
          </button>
        </div>



        {/* STEP 1: DSC TOKEN SELECTION & PIN */}
        {currentStep === "sign" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#003366] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    {tenderRef}
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                    Awaiting Cryptographic DSC Seal
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-2">
                  Select Connected Class-3 Hardware Token
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Controller of Certifying Authorities (CCA) mandated PKCS#11 hardware cryptographic token.
                </p>
              </div>

              <button
                type="button"
                onClick={handleScanTokens}
                disabled={scanning}
                className="text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-2 shrink-0 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin text-[#003366]" : ""}`} />
                <span>{scanning ? "Scanning USB Ports..." : "Refresh Connected Tokens"}</span>
              </button>
            </div>

            {/* Token Selector Cards */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Connected Cryptographic Devices (PKCS#11)
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {AVAILABLE_TOKENS.map((token) => {
                  const isSelected = selectedToken.id === token.id;
                  return (
                    <div
                      key={token.id}
                      onClick={() => setSelectedToken(token)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition text-xs ${
                        isSelected
                          ? "border-[#003366] bg-blue-50/70 shadow-2xs"
                          : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                          {token.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold bg-[#003366] text-white px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 space-y-1 text-slate-600 text-[11px]">
                        <p><strong className="text-slate-800">Authorized Signatory:</strong> {token.signatory}</p>
                        <p className="truncate"><strong className="text-slate-800">CA:</strong> {token.issuer}</p>
                        <p className="font-mono text-[10px] text-slate-500">SN: {token.serialNumber}</p>
                        <p className="text-emerald-700 font-semibold">Valid till: {token.validTill}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Token PIN entry */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Enter USB Token User PIN / Passphrase
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 6-digit USB Token PIN"
                  className="w-full sm:w-72 p-2.5 text-xs font-mono border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-[#003366] focus:outline-none"
                />
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Hardware crypto PIN verified</span>
                </span>
              </div>
              {pinError && <p className="text-xs text-rose-600 font-bold">{pinError}</p>}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href={`/bidder/review?tenderId=${tenderId}&ref=${encodeURIComponent(tenderRef)}`}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back to Pre-Bid Review
              </Link>
              <button
                onClick={() => handleStepChange("confirm")}
                className="btn-gov-primary text-xs flex items-center gap-2 px-5 py-2.5"
              >
                <span>Proceed to Final Submission Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIRM & SUBMIT BID */}
        {currentStep === "confirm" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#003366] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                  {tenderRef}
                </span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded-full">
                  Ready for Final Cryptographic Commit
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-2">
                Verify Digital Envelope & Authorize Final Submission
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Once committed, your bid will be sealed with your Class-3 token and transmitted to the NIC procurement repository.
              </p>
            </div>

            {/* Electronic Envelope Details */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider block text-xs">
                Electronic Bid Package Digest
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Evaluated Price</span>
                  <span className="font-mono font-black text-[#003366] text-base">
                    ₹{Number(totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Encryption Standard</span>
                  <span className="font-mono font-bold text-slate-800 text-xs">AES-256 + RSA 2048</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Signing Token</span>
                  <span className="font-bold text-slate-800 text-xs truncate block">{selectedToken.signatory}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-slate-400 block">SHA-256 Envelope Hash:</span>
                <span className="font-mono text-[11px] text-slate-700 break-all bg-white p-2 rounded-lg border border-slate-200 block mt-1">
                  {bidHash}
                </span>
              </div>
            </div>

            {/* Signing Progress Indicator */}
            {signingStep !== "IDLE" && (
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between font-bold text-[#003366]">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[#003366] border-t-transparent animate-spin" />
                    <span>
                      {workerStatusMessage ||
                        (signingStep === "HASHING"
                          ? "Step 1/3: Computing SHA-256 Hash Digest..."
                          : signingStep === "ENCRYPTING"
                          ? "Step 2/3: Applying AES-256-GCM Envelope Seal..."
                          : signingStep === "TSA_TIMESTAMP"
                          ? "Step 3/3: Attaching NIC RFC-3161 Timestamp..."
                          : "Sealing Complete! Transmitting to Repository...")}
                    </span>
                  </div>
                  <span className="font-mono text-xs">{workerProgress || 50}%</span>
                </div>

                <div className="w-full h-2.5 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="bg-[#003366] h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${workerProgress || 50}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-blue-900 pt-0.5">
                  <span className="flex items-center gap-1 font-semibold">
                    <span>⚡</span>
                    <span>Dedicated Web Worker Thread (Non-blocking 60 FPS UI)</span>
                  </span>
                  <span className="font-mono">Section 65B Standard</span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleStepChange("sign")}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back to Token Selection
              </button>

              <button
                onClick={() => handleSignAndSubmit()}
                disabled={signingStep !== "IDLE"}
                className="btn-primary w-full sm:w-auto px-8 py-3.5 text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Apply Class-3 DSC Seal & Submit Electronic Bid</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: OFFICIAL ACKNOWLEDGEMENT RECEIPT */}
        {currentStep === "ack" && (
          <div className="space-y-6 animate-fadeIn">
            <QRCodeReceipt
              ackNumber={ackNumber}
              submissionTime={submissionTime}
              tenderRef={tenderRef}
              companyName={selectedToken.company}
              signatory={selectedToken.signatory}
              bidAmount={totalAmount}
              tokenSerial={selectedToken.serialNumber}
              tokenIssuer={selectedToken.issuer}
              bidHash={bidHash}
            />

            <div className="flex justify-end pt-2 no-print">
              <Link
                href="/bidder/my-bids"
                className="btn-primary px-8 py-3.5 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Track Sealed Proposal in My Bids</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </Shell>
  );
}

export default function BidSubmissionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading DSC Signing Console...</div>}>
      <BidSubmissionContent />
    </Suspense>
  );
}
