"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Shell } from "@/components/Shell";
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  FileText, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Building2, 
  ArrowRight,
  Filter,
  CheckCircle2
} from "lucide-react";

type Tender = {
  id: string;
  referenceNo: string;
  title: string;
  department: string;
  category: "Goods" | "Services" | "Works";
  estimatedValue: number;
  emdAmount: number;
  bidEndAt: string;
  isGem?: boolean;
  status: "OPEN" | "CLOSING SOON" | "PUBLISHED";
  documentsCount?: number;
  isMyTender?: boolean;
};

const defaultTenders: Tender[] = [
  {
    id: "tender-1",
    referenceNo: "GEM/2025/B/6123456",
    title: "Supply, Installation and Commissioning of Smart IP CCTV Cameras & Command Center",
    department: "Ministry of Home Affairs • Central Armed Police Forces",
    category: "Goods",
    estimatedValue: 25000000,
    emdAmount: 500000,
    bidEndAt: "2025-08-28T18:00:00.000Z",
    isGem: true,
    status: "OPEN",
    documentsCount: 4,
    isMyTender: true,
  },
  {
    id: "tender-2",
    referenceNo: "NIT/RAIL/2025/CCTV-AMC",
    title: "Comprehensive Annual Maintenance Contract (CAMC) for Surveillance & Video Analytics",
    department: "Ministry of Railways • Northern Railway Zone",
    category: "Services",
    estimatedValue: 5000000,
    emdAmount: 100000,
    bidEndAt: "2025-08-22T17:00:00.000Z",
    isGem: false,
    status: "CLOSING SOON",
    documentsCount: 3,
    isMyTender: true,
  },
  {
    id: "tender-3",
    referenceNo: "GEM/2025/B/6119988",
    title: "Supply of High-Definition Night-Vision Thermal Imaging & Perimeter Security Gear",
    department: "Defence Research & Development Organisation (DRDO)",
    category: "Goods",
    estimatedValue: 87500000,
    emdAmount: 1750000,
    bidEndAt: "2025-09-05T15:00:00.000Z",
    isGem: true,
    status: "OPEN",
    documentsCount: 5,
    isMyTender: true,
  },
  {
    id: "tender-4",
    referenceNo: "NIT/MORTH/2025/HIGHWAY-ITS",
    title: "Intelligent Traffic Management System (ITMS) & Highway Fiber Infrastructure",
    department: "Ministry of Road Transport & Highways • NHAI",
    category: "Works",
    estimatedValue: 342000000,
    emdAmount: 6840000,
    bidEndAt: "2025-09-12T17:30:00.000Z",
    isGem: false,
    status: "OPEN",
    documentsCount: 6,
    isMyTender: false,
  },
  {
    id: "tender-5",
    referenceNo: "GEM/2025/B/6124100",
    title: "Cloud Hosting, Disaster Recovery & High-Availability Database Cluster Services",
    department: "National Informatics Centre (NIC) • MeitY",
    category: "Services",
    estimatedValue: 41000000,
    emdAmount: 820000,
    bidEndAt: "2025-09-18T16:00:00.000Z",
    isGem: true,
    status: "OPEN",
    documentsCount: 4,
    isMyTender: false,
  },
  {
    id: "tender-6",
    referenceNo: "NIT/POWER/2025/SOLAR-ROOF",
    title: "Design, Supply & Erection of 5MW Grid-Connected Solar Rooftop Power Plant",
    department: "Ministry of New and Renewable Energy (MNRE)",
    category: "Works",
    estimatedValue: 168000000,
    emdAmount: 3360000,
    bidEndAt: "2025-09-25T14:00:00.000Z",
    isGem: true,
    status: "OPEN",
    documentsCount: 5,
    isMyTender: false,
  },
];

function BidderTendersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterParam = searchParams.get("filter");
  const savedParam = searchParams.get("saved");

  const [tenders, setTenders] = useState<Tender[]>(defaultTenders);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [savedIds, setSavedIds] = useState<string[]>(["tender-1", "tender-5"]);
  const [scope, setScope] = useState<"all" | "my" | "saved">("all");
  const [isSyncingGeM, setIsSyncingGeM] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);

  useEffect(() => {
    if (savedParam === "true") setScope("saved");
    else if (filterParam === "my") setScope("my");
    else setScope("all");
  }, [filterParam, savedParam]);

  const handleScopeChange = (newScope: "all" | "my" | "saved") => {
    setScope(newScope);
    const params = new URLSearchParams(searchParams.toString());
    if (newScope === "all") {
      params.delete("filter");
      params.delete("saved");
    } else if (newScope === "my") {
      params.set("filter", "my");
      params.delete("saved");
    } else if (newScope === "saved") {
      params.delete("filter");
      params.set("saved", "true");
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/bidder/tenders${query}`);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedIds((prev) => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  function loadTendersFromApi() {
    fetch("/api/tenders")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Tender[] = data.map((t: any) => ({
            id: t.id,
            referenceNo: t.referenceNo,
            title: t.title,
            department: t.department || "Central Ministry",
            category: (t.category || "Goods") as "Goods" | "Services" | "Works",
            estimatedValue: Number(t.estimatedValue || 0),
            emdAmount: Number(t.emdAmount || 0),
            bidEndAt: t.bidEndAt || new Date(Date.now() + 86400000 * 7).toISOString(),
            isGem: Boolean(t.isGem) || t.referenceNo?.startsWith("GEM"),
            status: (t.status === "CLOSING_SOON" ? "CLOSING SOON" : "OPEN") as any,
            documentsCount: 4,
            isMyTender: true,
          }));
          setTenders((prev) => {
            const extra = prev.filter(p => !mapped.some(m => m.referenceNo === p.referenceNo));
            return [...mapped, ...extra];
          });
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadTendersFromApi();
  }, []);

  async function handleSyncGeMFeed() {
    setIsSyncingGeM(true);
    setSyncToast(null);
    try {
      const res = await fetch("/api/gem/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ syncAll: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncToast("✓ Live GeM procurement feed synchronized.");
        loadTendersFromApi();
      } else {
        setSyncToast("⚠️ GeM sync fallback active.");
      }
    } catch {
      setSyncToast("⚠️ GeM communication glitch.");
    } finally {
      setIsSyncingGeM(false);
      setTimeout(() => setSyncToast(null), 4000);
    }
  }

  const filtered = tenders.filter((t) => {
    // Scope filter
    if (scope === "my" && !t.isMyTender) return false;
    if (scope === "saved" && !savedIds.includes(t.id)) return false;

    // Search query
    const matchQuery =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.referenceNo.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase());
    
    // Category filter
    let matchCat = true;
    if (category === "GEM") {
      matchCat = Boolean(t.isGem) || t.referenceNo.startsWith("GEM");
    } else if (category !== "ALL") {
      matchCat = t.category.toUpperCase() === category;
    }
    
    return matchQuery && matchCat;
  });

  return (
    <Shell 
      role="bidder" 
      title="Central Government Tender Opportunities" 
      subtitle="Discover published procurements, review RFP specifications, and initiate electronic bids"
    >
      <div className="space-y-6">

        {/* Scope Navigation Tabs (Available, My, Saved) */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => handleScopeChange("all")}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
                scope === "all"
                  ? "bg-white text-[#003366] font-bold shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>🌐</span>
              <span>Available Tenders ({tenders.length})</span>
            </button>

            <button
              onClick={() => handleScopeChange("my")}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
                scope === "my"
                  ? "bg-white text-[#003366] font-bold shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>📝</span>
              <span>My Tenders ({tenders.filter(t => t.isMyTender).length})</span>
            </button>

            <button
              onClick={() => handleScopeChange("saved")}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
                scope === "saved"
                  ? "bg-white text-[#003366] font-bold shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>⭐</span>
              <span>Saved Tenders ({savedIds.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-2">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "cards" ? "bg-[#003366] text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "table" ? "bg-[#003366] text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Sync Toast */}
        {syncToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-2xs">
            <span>{syncToast}</span>
            <button onClick={() => setSyncToast(null)} className="font-bold text-emerald-700">✕</button>
          </div>
        )}

        {/* Top Search & Category Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full flex items-center relative">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tender reference, keywords, ministry or department..."
              className="w-full pl-10 pr-28 py-2 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-[#003366]"
            />
            <button
              onClick={handleSyncGeMFeed}
              disabled={isSyncingGeM}
              className="absolute right-2 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-[11px] font-bold transition flex items-center gap-1 disabled:opacity-50"
            >
              {isSyncingGeM ? (
                <span className="w-3 h-3 border-2 border-amber-800 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <span>⚡</span>
              )}
              <span>Sync GeM</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600 overflow-x-auto w-full md:w-auto">
            {["ALL", "GEM", "GOODS", "SERVICES", "WORKS"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  category === cat
                    ? "bg-white text-[#003366] shadow-2xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                {cat === "GEM" ? "GeM Portal (SPV)" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode: Cards */}
        {viewMode === "cards" && (
          <div className="space-y-4">
            {filtered.map((t) => {
              const isSaved = savedIds.includes(t.id);
              return (
                <div
                  key={t.id}
                  className="gov-card p-5 hover:border-blue-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                        {t.referenceNo}
                      </span>
                      <span className={`gov-badge ${t.status === "OPEN" ? "open" : "warning"}`}>
                        {t.status}
                      </span>
                      <span className="gov-badge neutral">
                        {t.category}
                      </span>
                      {t.isGem && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                          GeM Integrated
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500">
                        📄 {t.documentsCount || 4} Attached Docs
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#003366] transition">
                      {t.title}
                    </h3>

                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.department}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-1">
                      <div>
                        <span className="text-slate-400">Estimated Value:</span>{" "}
                        <span className="font-bold text-[#003366]">
                          ₹ {t.estimatedValue.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">EMD:</span>{" "}
                        <span className="font-semibold text-slate-800">
                          ₹ {t.emdAmount.toLocaleString("en-IN")} (MSME Exempt)
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Closing Date:</span>{" "}
                        <span className="font-semibold text-red-600">
                          {new Date(t.bidEndAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={(e) => toggleBookmark(t.id, e)}
                      className={`p-2 rounded-lg border transition flex items-center gap-1.5 text-xs font-semibold ${
                        isSaved 
                          ? "bg-amber-50 border-amber-300 text-amber-800" 
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                      title={isSaved ? "Remove from Saved Tenders" : "Save Tender"}
                    >
                      {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" /> : <Bookmark className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/bidder/tender?id=${t.id}&ref=${encodeURIComponent(t.referenceNo)}`}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition"
                      >
                        Specifications & NIT
                      </Link>
                      <Link
                        href={`/bidder/bid-preparation?tenderId=${t.id}&ref=${encodeURIComponent(t.referenceNo)}`}
                        className="btn-gov-primary text-xs flex items-center gap-1 shadow-xs"
                      >
                        <span>Prepare Bid</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View Mode: Table */}
        {viewMode === "table" && (
          <div className="gov-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-3.5">Reference & Status</th>
                    <th className="p-3.5">Tender Title</th>
                    <th className="p-3.5">Ministry / Dept</th>
                    <th className="p-3.5">Estimated Value</th>
                    <th className="p-3.5">EMD</th>
                    <th className="p-3.5">Closing</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-900 block">{t.referenceNo}</span>
                        <span className={`gov-badge mt-1 ${t.status === "OPEN" ? "open" : "warning"}`}>{t.status}</span>
                      </td>
                      <td className="p-3.5 max-w-sm">
                        <p className="font-bold text-slate-900 line-clamp-2">{t.title}</p>
                        <span className="text-[10px] text-slate-400 font-medium">{t.category}</span>
                      </td>
                      <td className="p-3.5 text-slate-600">{t.department}</td>
                      <td className="p-3.5 font-bold text-[#003366]">₹ {t.estimatedValue.toLocaleString("en-IN")}</td>
                      <td className="p-3.5 text-slate-700">₹ {t.emdAmount.toLocaleString("en-IN")}</td>
                      <td className="p-3.5 font-semibold text-red-600">
                        {new Date(t.bidEndAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <Link
                          href={`/bidder/tender?id=${t.id}&ref=${encodeURIComponent(t.referenceNo)}`}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                        >
                          NIT
                        </Link>
                        <Link
                          href={`/bidder/bid-preparation?tenderId=${t.id}&ref=${encodeURIComponent(t.referenceNo)}`}
                          className="btn-gov-primary px-3 py-1.5 text-xs inline-flex items-center gap-1"
                        >
                          Bid →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 space-y-2">
            <p className="text-base font-bold text-slate-700">No tenders found matching your selection</p>
            <p className="text-xs text-slate-400">Try changing your search terms, reset category, or view all available tenders.</p>
            <button
              onClick={() => { setSearch(""); setCategory("ALL"); handleScopeChange("all"); }}
              className="mt-2 px-4 py-2 bg-[#003366] text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

export default function BidderTendersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Tenders Portal...</div>}>
      <BidderTendersContent />
    </Suspense>
  );
}
