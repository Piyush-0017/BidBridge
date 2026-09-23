"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { 
  Building2, 
  FileCheck2, 
  Cpu, 
  Calculator, 
  Award, 
  Files, 
  ArrowRight, 
  Download, 
  Upload, 
  Save, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

type BOQItem = {
  id: string;
  itemDescription: string;
  unit: string;
  qty: number;
  unitRate: number;
  gstRate: number;
};

const initialBOQ: BOQItem[] = [
  {
    id: "item-1",
    itemDescription: "4K UHD Smart IP PTZ Camera with 30x Optical Zoom, Night Vision & IP67 Housing",
    unit: "Nos",
    qty: 50,
    unitRate: 45000,
    gstRate: 18,
  },
  {
    id: "item-2",
    itemDescription: "64-Channel Enterprise Network Video Recorder (NVR) with RAID 6 Storage (128TB)",
    unit: "Nos",
    qty: 4,
    unitRate: 280000,
    gstRate: 18,
  },
  {
    id: "item-3",
    itemDescription: "High-Grade Armoured Outdoor Cat-6 Ethernet Cable Spool (305 meters/drum)",
    unit: "Drums",
    qty: 25,
    unitRate: 14500,
    gstRate: 18,
  },
  {
    id: "item-4",
    itemDescription: "AI Surveillance Video Analytics Server Cluster (Face Detection, ANPR & Intrusion)",
    unit: "Sets",
    qty: 2,
    unitRate: 650000,
    gstRate: 18,
  },
  {
    id: "item-5",
    itemDescription: "Installation, Commissioning, Civil Conduit Mounting & 3-Year Onsite Warranty Support",
    unit: "Lump Sum",
    qty: 1,
    unitRate: 480000,
    gstRate: 18,
  },
];

type ActiveTabType = "profile" | "forms" | "technical" | "boq" | "mii" | "documents";

function BidPreparationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tenderRef = searchParams.get("ref") || "GEM/2025/B/6123456";
  const tenderId = searchParams.get("tenderId") || "tender-1";
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<ActiveTabType>("profile");

  useEffect(() => {
    if (tabParam === "forms") setActiveTab("forms");
    else if (tabParam === "technical") setActiveTab("technical");
    else if (tabParam === "boq") setActiveTab("boq");
    else if (tabParam === "mii") setActiveTab("mii");
    else if (tabParam === "documents") setActiveTab("documents");
    else setActiveTab("profile");
  }, [tabParam]);

  const handleTabChange = (tab: ActiveTabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "profile") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/bidder/bid-preparation${query}`);
  };

  // State
  const [miiPercentage, setMiiPercentage] = useState<number>(68);
  const [oemDetails, setOemDetails] = useState({
    manufacturer: "Sony Electronics / Hikvision Security Systems",
    authRef: "MAF-IND-2025-0819",
    warrantyPeriod: "3 Years Comprehensive On-Site",
    countryOfOrigin: "India (68% Local Assembly & Components)",
  });

  const [declarations, setDeclarations] = useState({
    nonBlacklisted: true,
    gfrCompliance: true,
    miiCompliance: true,
    noConflictOfInterest: true,
    integrityPact: true,
  });

  const [techCompliance, setTechCompliance] = useState([
    { clause: "Clause 3.1: 4K Optical PTZ", offered: "Sony Starvis 4K PTZ Model AX-800", status: "COMPLIED", deviation: "None" },
    { clause: "Clause 3.2: 128TB Hot-Swappable RAID 6", offered: "Dell EMC PowerEdge Storage Array", status: "COMPLIED", deviation: "None" },
    { clause: "Clause 3.3: Outdoor Armoured Cat-6", offered: "Finolex Armoured Cat-6 UV resistant", status: "COMPLIED", deviation: "None" },
    { clause: "Clause 3.4: STQC / BIS Lab Certification", offered: "BIS Registration #R-41009876", status: "COMPLIED", deviation: "Attached in Vault" },
  ]);

  const [boqItems, setBoqItems] = useState<BOQItem[]>(initialBOQ);
  const [saveStatus, setSaveStatus] = useState("");

  function updateRate(id: string, newRate: number) {
    setBoqItems(
      boqItems.map((item) => (item.id === id ? { ...item, unitRate: Math.max(0, newRate) } : item))
    );
  }

  function downloadBOQTemplate() {
    const csvRows = [
      ["Item ID", "Item Description", "Unit", "Quantity", "Basic Unit Rate (INR)", "GST Rate (%)"],
      ...boqItems.map((item) => [
        item.id,
        `"${item.itemDescription.replace(/"/g, '""')}"`,
        item.unit,
        item.qty,
        item.unitRate,
        item.gstRate,
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((r) => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BOQ_Schedule_${tenderRef.replace(/\//g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleBOQUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        alert("Uploaded CSV file appears to be empty.");
        return;
      }

      const updated = [...boqItems];
      let updatedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (cols.length >= 5) {
          const itemId = cols[0].replace(/"/g, "").trim();
          const rate = parseFloat(cols[4].replace(/"/g, "").trim());
          const gst = parseFloat(cols[5]?.replace(/"/g, "").trim() || "18");

          const idx = updated.findIndex((item) => item.id === itemId);
          if (idx !== -1 && !isNaN(rate)) {
            updated[idx] = {
              ...updated[idx],
              unitRate: rate,
              gstRate: isNaN(gst) ? updated[idx].gstRate : gst,
            };
            updatedCount++;
          }
        }
      }

      setBoqItems(updated);
      setSaveStatus(`Successfully imported ${updatedCount} item rates from spreadsheet! Totals recalculated automatically.`);
      setTimeout(() => setSaveStatus(""), 4000);
    };
    reader.readAsText(file);
  }

  const basicTotal = boqItems.reduce((acc, item) => acc + item.qty * item.unitRate, 0);
  const gstTotal = boqItems.reduce((acc, item) => acc + item.qty * item.unitRate * (item.gstRate / 100), 0);
  const grandTotal = basicTotal + gstTotal;

  function saveDraft() {
    setSaveStatus("Bid proposal draft and itemized BOQ calculations saved securely.");
    setTimeout(() => setSaveStatus(""), 4000);
  }

  return (
    <Shell
      role="bidder"
      title="Bid Preparation Studio"
      subtitle={`Authoring Electronic Proposal for Tender ${tenderRef}`}
    >
      <div className="space-y-6">

        {/* Top Context Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                {tenderRef}
              </span>
              <span className="gov-badge open">Electronic Proposal Active</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1.5">
              Supply, Installation and Commissioning of Smart IP CCTV Cameras & Command Center
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={saveDraft}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Draft</span>
            </button>
            <Link
              href={`/bidder/review?tenderId=${tenderId}&ref=${encodeURIComponent(tenderRef)}&total=${grandTotal}`}
              className="btn-gov-primary text-xs flex items-center gap-1.5 shadow-xs px-4 py-2"
            >
              <span>Proceed to Pre-Bid Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {saveStatus && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* 6 Step Navigation Tabs */}
        <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-2xs flex flex-wrap gap-1.5 text-xs font-bold">
          {[
            { id: "profile", label: "1. Bidder Information", icon: <Building2 className="w-4 h-4" /> },
            { id: "forms", label: "2. Forms & Declarations", icon: <FileCheck2 className="w-4 h-4" /> },
            { id: "technical", label: "3. Technical Bid", icon: <Cpu className="w-4 h-4" /> },
            { id: "boq", label: "4. Financial Bid / BOQ", icon: <Calculator className="w-4 h-4" /> },
            { id: "mii", label: "5. Make in India / OEM", icon: <Award className="w-4 h-4" /> },
            { id: "documents", label: "6. Linked Certificates (4/4)", icon: <Files className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as ActiveTabType)}
              className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#003366] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: BIDDER INFORMATION */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Bidder Master Profile & Statutory Details
              </h4>
              <p className="text-xs text-slate-500">
                Verified enterprise data auto-synced with GSTN, Income Tax CBDT, and MSME Udyam portals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <span className="text-slate-500 text-[11px]">Legal Entity Name</span>
                <p className="font-bold text-slate-900 text-sm">ABC Technology Private Limited</p>
                <span className="text-emerald-700 font-medium text-[10px]">Registered in India (CIN: U72200MH2016PTC288100)</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <span className="text-slate-500 text-[11px]">GSTIN Registration (Active)</span>
                <p className="font-mono font-bold text-emerald-800 text-sm">27ABCDE1234F1Z5</p>
                <span className="text-emerald-700 font-medium text-[10px]">Verified via GST Portal API • Regular Taxpayer</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <span className="text-slate-500 text-[11px]">Permanent Account Number (PAN)</span>
                <p className="font-mono font-bold text-slate-900 text-sm">ABCDE1234F</p>
                <span className="text-slate-500 font-medium text-[10px]">Company Pan Valid with CBDT Master Database</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <span className="text-slate-500 text-[11px]">MSME / Udyam Registration</span>
                <p className="font-mono font-bold text-[#003366] text-sm">UDYAM-MH-02-0049182</p>
                <span className="text-blue-700 font-medium text-[10px]">Eligible for EMD & Tender Fee Exemption per GFR Rule 170</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 text-xs text-[#003366] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#003366]" />
                <div>
                  <span className="font-bold block">Class-3 Digital Signature Certificate Ready</span>
                  <span className="text-[11px] text-blue-800">Token: ePass2003 Auto (eMudhra CA) • Signatory: Priya Sharma</span>
                </div>
              </div>
              <button
                onClick={() => handleTabChange("forms")}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1"
              >
                <span>Next: Forms</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: FORMS & DECLARATIONS */}
        {activeTab === "forms" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Statutory Undertakings & Forms
              </h4>
              <p className="text-xs text-slate-500">
                Mandatory declarations required by Central Vigilance Commission (CVC) and GFR 2017.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                { key: "nonBlacklisted", title: "Non-Blacklisting & Debarment Affidavit", label: "We confirm that our company, directors, or partners have not been debarred or blacklisted by any Union Ministry, State Department, or PSU." },
                { key: "gfrCompliance", title: "GFR 2017 Acceptance", label: "We certify unconditional acceptance of General Financial Rules (GFR 2017) and all Special Conditions of Contract (SCC)." },
                { key: "noConflictOfInterest", title: "No Conflict of Interest", label: "We declare that no direct or indirect conflict of interest exists with the procuring authority or the tender evaluation committee." },
                { key: "integrityPact", title: "Integrity Pact Commitment", label: "We pledge to commit to transparent, honest, and ethical conduct throughout the tendering and execution period per CVC directives." },
              ].map((item) => (
                <label key={item.key} className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={(declarations as any)[item.key]}
                    onChange={(e) => setDeclarations({ ...declarations, [item.key]: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-[#003366] focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">{item.title}</span>
                    <span className="text-slate-600 font-medium leading-relaxed">{item.label}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleTabChange("profile")}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back to Bidder Info
              </button>
              <button
                onClick={() => handleTabChange("technical")}
                className="btn-gov-primary text-xs flex items-center gap-1.5 px-4 py-2"
              >
                <span>Next: Technical Bid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: TECHNICAL BID */}
        {activeTab === "technical" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Technical Specifications Compliance Matrix
                </h4>
                <p className="text-xs text-slate-500">Record offered equipment makes, models, and compliance status for each RFP clause.</p>
              </div>
              <span className="gov-badge open">All Clauses Complied</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Tender Specification Clause</th>
                    <th className="p-3">Make / Model Offered</th>
                    <th className="p-3">Compliance</th>
                    <th className="p-3">Deviations / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {techCompliance.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">{row.clause}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.offered}
                          onChange={(e) => {
                            const copy = [...techCompliance];
                            copy[idx].offered = e.target.value;
                            setTechCompliance(copy);
                          }}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-[#003366]"
                        />
                      </td>
                      <td className="p-3">
                        <select
                          value={row.status}
                          onChange={(e) => {
                            const copy = [...techCompliance];
                            copy[idx].status = e.target.value;
                            setTechCompliance(copy);
                          }}
                          className="p-2 border border-slate-300 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50"
                        >
                          <option value="COMPLIED">Complied</option>
                          <option value="DEVIATION">Deviation</option>
                          <option value="NOT_COMPLIED">Not Complied</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={row.deviation}
                          onChange={(e) => {
                            const copy = [...techCompliance];
                            copy[idx].deviation = e.target.value;
                            setTechCompliance(copy);
                          }}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs text-slate-600"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleTabChange("forms")}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back to Forms
              </button>
              <button
                onClick={() => handleTabChange("boq")}
                className="btn-gov-primary text-xs flex items-center gap-1.5 px-4 py-2"
              >
                <span>Next: Financial BOQ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: FINANCIAL BOQ */}
        {activeTab === "boq" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Bill of Quantities (BOQ) Interactive Pricing Schedule
                </h4>
                <p className="text-xs text-slate-500">
                  Enter basic unit rates. Tax calculations and total pricing compute automatically.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Evaluation Mode</span>
                <span className="text-xs font-bold text-[#003366]">L-1 Lowest Evaluated Price (All-Inclusive)</span>
              </div>
            </div>

            {/* Importer Toolbar */}
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <div>
                  <span className="font-bold text-[#003366] block">Excel / CSV Rate Schedule Importer</span>
                  <span className="text-[11px] text-slate-600">
                    Download official pre-filled template, populate rates, and upload for automated calculation.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={downloadBOQTemplate}
                  className="px-3.5 py-2 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Template</span>
                </button>

                <label className="btn-primary px-3.5 py-2 rounded-lg font-bold text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Filled CSV</span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleBOQUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Item Description</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Basic Unit Rate (₹)</th>
                      <th className="p-3 text-right">GST %</th>
                      <th className="p-3 text-right">Total Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {boqItems.map((item, idx) => {
                      const itemSubtotal = item.qty * item.unitRate;
                      const itemGst = itemSubtotal * (item.gstRate / 100);
                      const itemTotal = itemSubtotal + itemGst;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-3 font-semibold text-slate-800 max-w-sm">
                            {item.itemDescription}
                          </td>
                          <td className="p-3 text-slate-500">{item.unit}</td>
                          <td className="p-3 text-center font-bold text-slate-700">{item.qty}</td>
                          <td className="p-3 text-right">
                            <input
                              type="number"
                              min="0"
                              value={item.unitRate}
                              onChange={(e) => updateRate(item.id, Number(e.target.value))}
                              className="w-32 p-1.5 text-right font-mono font-bold border border-slate-300 rounded focus:ring-1 focus:ring-[#003366] text-xs"
                            />
                          </td>
                          <td className="p-3 text-right text-slate-600 font-mono">{item.gstRate}%</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            ₹ {itemTotal.toLocaleString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-800 block">Pricing Guidelines for Bidders</span>
                <p className="text-slate-600 leading-relaxed">
                  • Rates quoted must include supply, transportation, transit insurance, and 3-year warranty.
                  <br />• Any conditional rebate or deviation in price will render the bid non-responsive per GFR 2017.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-[#002244] text-white space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-300">Financial Bid Summary</h5>
                <div className="space-y-2 text-xs border-b border-white/15 pb-3">
                  <div className="flex justify-between text-slate-300">
                    <span>Basic Total (Excl. Taxes):</span>
                    <span className="font-mono font-bold">₹ {basicTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Applicable GST (18% Component):</span>
                    <span className="font-mono font-bold">₹ {gstTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="text-xs font-bold text-white block">Grand Total Evaluated Price (₹):</span>
                    <span className="text-[10px] text-slate-400">All-Inclusive Delivery at Site</span>
                  </div>
                  <span className="text-xl font-black text-amber-300 font-mono">
                    ₹ {grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleTabChange("technical")}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back to Technical Bid
              </button>
              <button
                onClick={() => handleTabChange("mii")}
                className="btn-gov-primary text-xs flex items-center gap-1.5 px-4 py-2"
              >
                <span>Next: Make in India</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: MAKE IN INDIA & OEM */}
        {activeTab === "mii" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Make In India (MII) & OEM Authorization Studio
              </h4>
              <p className="text-xs text-slate-500">
                Self-certification of local content threshold under Public Procurement Order 2017.
              </p>
            </div>

            {/* MII Local Content Slider */}
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-sm">Declared Local Content Percentage:</span>
                <span className="font-mono font-black text-emerald-800 text-lg bg-emerald-100 px-3 py-1 rounded-lg">
                  {miiPercentage}% (Class-I Local Supplier)
                </span>
              </div>

              <input
                type="range"
                min="20"
                max="100"
                value={miiPercentage}
                onChange={(e) => setMiiPercentage(Number(e.target.value))}
                className="w-full accent-[#003366] cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>Class-II (20% - 49%)</span>
                <span className="font-bold text-[#003366]">Class-I (≥ 50% Required for Purchase Preference)</span>
                <span>100% Fully Indigenous</span>
              </div>
            </div>

            {/* OEM Authorization Details */}
            <div className="border border-slate-200 rounded-xl p-5 space-y-4 text-xs">
              <h5 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                Manufacturer Authorization Form (MAF) Particulars
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">OEM / Manufacturer Name</label>
                  <input
                    type="text"
                    value={oemDetails.manufacturer}
                    onChange={(e) => setOemDetails({ ...oemDetails, manufacturer: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Authorization Reference No</label>
                  <input
                    type="text"
                    value={oemDetails.authRef}
                    onChange={(e) => setOemDetails({ ...oemDetails, authRef: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Warranty & Spare Support Commitment</label>
                  <input
                    type="text"
                    value={oemDetails.warrantyPeriod}
                    onChange={(e) => setOemDetails({ ...oemDetails, warrantyPeriod: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Country of Origin & Manufacturing Location</label>
                  <input
                    type="text"
                    value={oemDetails.countryOfOrigin}
                    onChange={(e) => setOemDetails({ ...oemDetails, countryOfOrigin: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-semibold text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleTabChange("boq")}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back to Financial BOQ
              </button>
              <button
                onClick={() => handleTabChange("documents")}
                className="btn-gov-primary text-xs flex items-center gap-1.5 px-4 py-2"
              >
                <span>Next: Linked Certificates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: LINKED CERTIFICATES */}
        {activeTab === "documents" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Attached Statutory Certificates & Digital Vault
                </h4>
                <p className="text-xs text-slate-500">
                  Documents auto-linked from Document Center and verified against NIT requirements.
                </p>
              </div>
              <Link href="/bidder/documents" className="text-xs font-bold text-[#003366] hover:underline">
                Manage Document Vault →
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { name: "GST_Registration_Certificate_2025.pdf", type: "GST Certificate", size: "340 KB", status: "VERIFIED" },
                { name: "Permanent_Account_Number_PAN.pdf", type: "PAN Card", size: "180 KB", status: "VERIFIED" },
                { name: "Audited_Financial_Statement_FY24.pdf", type: "3-Year Balance Sheet", size: "2.1 MB", status: "VERIFIED" },
                { name: "OEM_Manufacturer_Authorization_Form.pdf", type: "OEM Authorization (MAF)", size: "450 KB", status: "VERIFIED" },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <span className="font-bold text-slate-900 block text-sm">{doc.name}</span>
                      <span className="text-[11px] text-slate-500">{doc.type} • {doc.size}</span>
                    </div>
                  </div>
                  <span className="gov-badge verified">✓ Ready for Signing</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => handleTabChange("mii")}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back to Make in India
              </button>
              <Link
                href={`/bidder/review?tenderId=${tenderId}&ref=${encodeURIComponent(tenderRef)}&total=${grandTotal}`}
                className="btn-gov-primary text-xs flex items-center gap-1.5 px-5 py-2.5 shadow-sm"
              >
                <span>Proceed to Pre-Bid Review</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

      </div>
    </Shell>
  );
}

export default function BidPreparationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Bid Preparation Studio...</div>}>
      <BidPreparationContent />
    </Suspense>
  );
}
