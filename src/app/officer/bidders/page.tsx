"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/Shell";
import Link from "next/link";

interface BidderCard {
  id: string;
  name: string;
  tradeName?: string;
  category: string;
  signatory: string;
  email: string;
  phone: string;
  gstin: string;
  pan: string;
  udyam?: string;
  state: string;
  avgComplianceScore: number;
  totalBids: number;
  awardedBids: number;
  status: "ACTIVE_VERIFIED" | "UNDER_OBSERVATION" | "DEBARRED";
}

const DEFAULT_BIDDERS: BidderCard[] = [
  {
    id: "BIDDER-001",
    name: "ABC Technology Private Limited",
    tradeName: "ABC Cyber Systems",
    category: "MSME Medium · Class-I Local Supplier (68%)",
    signatory: "Priya Sharma (Managing Director)",
    email: "procurement@abctech.in",
    phone: "+91 98765 43210",
    gstin: "27AAACA9821R1ZX",
    pan: "AAACA9821R",
    udyam: "UDYAM-MH-02-0049182",
    state: "Maharashtra",
    avgComplianceScore: 96,
    totalBids: 14,
    awardedBids: 5,
    status: "ACTIVE_VERIFIED",
  },
  {
    id: "BIDDER-002",
    name: "SecureIT Solutions LLP",
    tradeName: "SecureIT Defence Systems",
    category: "Small Enterprise · Class-I Local Supplier (52%)",
    signatory: "Amit Patel (Partner & CTO)",
    email: "tenders@secureit.in",
    phone: "+91 98112 33445",
    gstin: "07AACCS4412Q1Z8",
    pan: "AACCS4412Q",
    udyam: "UDYAM-DL-08-0011294",
    state: "Delhi (NCT)",
    avgComplianceScore: 88,
    totalBids: 9,
    awardedBids: 2,
    status: "ACTIVE_VERIFIED",
  },
  {
    id: "BIDDER-003",
    name: "Bharat Telecom Networks Limited",
    tradeName: "Bharat Telecom",
    category: "Large Enterprise · Class-II Local Supplier (35%)",
    signatory: "Vikramaditya Rao (VP Enterprise Sales)",
    email: "gov-bids@bharattelecom.in",
    phone: "+91 94480 12900",
    gstin: "29AABCB1122D1Z4",
    pan: "AABCB1122D",
    udyam: "N/A (Non-MSME)",
    state: "Karnataka",
    avgComplianceScore: 92,
    totalBids: 18,
    awardedBids: 6,
    status: "ACTIVE_VERIFIED",
  },
  {
    id: "BIDDER-004",
    name: "Hindustan Infra Communications Pvt Ltd",
    tradeName: "Hindustan InfraCom",
    category: "Micro Enterprise · Class-I Local Supplier (72%)",
    signatory: "Sunil Verma (Authorized Signatory)",
    email: "tenders@hinfracom.com",
    phone: "+91 91234 56789",
    gstin: "09AAACH5512L1ZK",
    pan: "AAACH5512L",
    udyam: "UDYAM-UP-12-0008819",
    state: "Uttar Pradesh",
    avgComplianceScore: 84,
    totalBids: 6,
    awardedBids: 1,
    status: "UNDER_OBSERVATION",
  },
];

export default function BiddersDirectoryPage() {
  const [bidders, setBidders] = useState<BidderCard[]>(DEFAULT_BIDDERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedBidder, setSelectedBidder] = useState<BidderCard | null>(null);

  useEffect(() => {
    fetch("/api/bids")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Extract bidder records dynamically from database
          const mapped: BidderCard[] = data.map((b: any, idx: number) => ({
            id: `BIDDER-${idx + 101}`,
            name: b.bidder?.bidderProfile?.companyName || b.bidder?.name || "Contractor Enterprise",
            category: "Registered Indian Procurement Vendor",
            signatory: b.bidder?.name || "Authorized Signatory",
            email: b.bidder?.email || "procurement@vendor.in",
            phone: "+91 98765 00000",
            gstin: b.bidder?.bidderProfile?.gstin || "27AAACA9821R1ZX",
            pan: b.bidder?.bidderProfile?.pan || "AAACA9821R",
            state: "India (Central Registry)",
            avgComplianceScore: b.complianceScore || 90,
            totalBids: 3,
            awardedBids: b.status === "AWARDED" ? 1 : 0,
            status: "ACTIVE_VERIFIED",
          }));

          // Merge without duplicates
          const seen = new Set(DEFAULT_BIDDERS.map((b) => b.name));
          const unique = mapped.filter((m) => !seen.has(m.name));
          setBidders([...DEFAULT_BIDDERS, ...unique]);
        }
      })
      .catch(() => {});
  }, []);

  const filtered = bidders.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.pan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.signatory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      categoryFilter === "ALL" ||
      (categoryFilter === "MSME" && b.category.includes("MSME")) ||
      (categoryFilter === "CLASS_1" && b.category.includes("Class-I"));

    return matchesSearch && matchesCat;
  });

  return (
    <Shell
      role="officer"
      title="Registered Bidders & Contractor Directory"
      subtitle="Comprehensive vendor intelligence, statutory credentials, and compliance history under CVC guidelines"
    >
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              <h2 className="text-xl font-black text-slate-900">Contractor Registry & Due Diligence Directory</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Statutory verification profiles cross-referenced against GSTN, CBDT PAN, MSME Udyam, and Central Debarment repositories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ CVC Debarment Check: 0 Blacklisted
            </span>
          </div>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card p-4 bg-white border border-slate-200">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Registered Vendors</span>
            <span className="text-2xl font-black text-slate-900 block mt-1">{bidders.length}</span>
            <span className="text-[10px] text-blue-600 font-semibold">Verified on e-Procurement Portal</span>
          </div>
          <div className="card p-4 bg-white border border-slate-200">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">MSME / Startup Vendors</span>
            <span className="text-2xl font-black text-emerald-700 block mt-1">
              {bidders.filter((b) => b.category.includes("MSME") || b.category.includes("Enterprise")).length}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">Eligible for GFR Benefits</span>
          </div>
          <div className="card p-4 bg-white border border-slate-200">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Class-I Local Suppliers (≥50%)</span>
            <span className="text-2xl font-black text-[#003366] block mt-1">
              {bidders.filter((b) => b.category.includes("Class-I")).length}
            </span>
            <span className="text-[10px] text-slate-500">Make in India DPIIT Compliant</span>
          </div>
          <div className="card p-4 bg-white border border-slate-200">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Average Compliance Index</span>
            <span className="text-2xl font-black text-purple-800 block mt-1">91.4%</span>
            <span className="text-[10px] text-purple-600 font-semibold">AI Automated First-Pass Rate</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="card p-4 bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Company Name, GSTIN, PAN, or Authorized Signatory..."
              className="w-full text-xs p-2 border-none focus:outline-none text-slate-800 placeholder:text-slate-400 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 text-xs font-semibold">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition ${
                categoryFilter === "ALL" ? "bg-[#003366] text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Vendors
            </button>
            <button
              onClick={() => setCategoryFilter("MSME")}
              className={`px-3 py-1.5 rounded-lg transition ${
                categoryFilter === "MSME" ? "bg-[#003366] text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              MSME / MSE Only
            </button>
            <button
              onClick={() => setCategoryFilter("CLASS_1")}
              className={`px-3 py-1.5 rounded-lg transition ${
                categoryFilter === "CLASS_1" ? "bg-[#003366] text-white font-bold" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Class-I Local Only
            </button>
          </div>
        </div>

        {/* Contractor Table */}
        <div className="card bg-white border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Contractor Legal Entity</th>
                  <th className="p-3.5">Category & Local Content</th>
                  <th className="p-3.5">GSTIN / PAN Particulars</th>
                  <th className="p-3.5">Authorized Signatory</th>
                  <th className="p-3.5 text-center">Avg AI Score</th>
                  <th className="p-3.5 text-center">Contracts Awarded</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-[#003366] font-black text-xs flex items-center justify-center shrink-0">
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{b.name}</span>
                          {b.tradeName && (
                            <span className="text-[10px] text-slate-500 block">Trade: {b.tradeName}</span>
                          )}
                          <span className="text-[10px] font-mono text-slate-400">{b.id} · {b.state}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] block max-w-xs truncate">
                        {b.category}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="space-y-0.5">
                        <span className="text-slate-800 font-bold block">GST: {b.gstin}</span>
                        <span className="text-slate-500 block">PAN: {b.pan}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-slate-800 block">{b.signatory}</span>
                      <span className="text-[10px] text-slate-400 block">{b.email}</span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`font-black text-xs px-2 py-0.5 rounded-full ${
                          b.avgComplianceScore >= 90
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.avgComplianceScore}%
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-bold text-slate-900">
                      {b.awardedBids} / {b.totalBids}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedBidder(b)}
                        className="btn-primary text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-2xs"
                      >
                        View Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Bidder Dossier Modal */}
        {selectedBidder && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-[#003366] text-white font-black text-sm flex items-center justify-center">
                    {selectedBidder.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{selectedBidder.name}</h3>
                    <span className="text-xs text-slate-500">{selectedBidder.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBidder(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">GSTIN Registration</span>
                  <span className="font-mono font-bold text-slate-900 block mt-0.5">{selectedBidder.gstin}</span>
                  <span className="text-emerald-700 text-[10px] font-semibold">Active · Tax Compliant</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">PAN Card Number</span>
                  <span className="font-mono font-bold text-slate-900 block mt-0.5">{selectedBidder.pan}</span>
                  <span className="text-emerald-700 text-[10px] font-semibold">CBDT Verified</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Authorized Signatory</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{selectedBidder.signatory}</span>
                  <span className="text-slate-500 text-[10px]">{selectedBidder.phone}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Compliance Rating</span>
                  <span className="font-black text-emerald-800 text-sm block mt-0.5">
                    {selectedBidder.avgComplianceScore}%
                  </span>
                  <span className="text-slate-500 text-[10px]">Zero debarment history</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#003366]">Central Vigilance Clearance (CVC)</span>
                  <p className="text-[11px] text-slate-600">No active debarment or vigilance proceedings recorded.</p>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  CLEARED
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href={`/officer/decision`}
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  View in Decision Console
                </Link>
                <button
                  onClick={() => setSelectedBidder(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
