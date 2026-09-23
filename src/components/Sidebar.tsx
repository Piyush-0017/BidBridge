"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

type NavItem = {
  title: string;
  icon: string;
  href?: string;
  badge?: string;
  children?: { title: string; href: string; badge?: string }[];
};

const officerNav: NavItem[] = [
  {
    title: "Dashboard",
    icon: "🏠",
    href: "/officer",
  },
  {
    title: "Tender Management",
    icon: "📋",
    children: [
      { title: "Create Tender", href: "/officer/tenders/create" },
      { title: "Import GeM & e-RA", href: "/officer/tenders/import" },
      { title: "Tenders Directory", href: "/officer/tenders" },
      { title: "GFR Eligibility Builder", href: "/officer/tenders/requirements" },
      { title: "Corrigendum & Versions", href: "/officer/tenders/corrigendum" },
    ],
  },
  {
    title: "Contractors & Bids",
    icon: "📥",
    children: [
      { title: "All Submitted Bids", href: "/officer/bids" },
      { title: "Registered Contractors", href: "/officer/bidders" },
    ],
  },
  {
    title: "AI Compliance Suite",
    icon: "🤖",
    children: [
      { title: "AI Forensic Console", href: "/officer/compliance" },
      { title: "Verification Center (10+ APIs)", href: "/officer/verification-center", badge: "LIVE" },
      { title: "Document OCR Vault", href: "/officer/compliance/documents" },
    ],
  },
  {
    title: "Bid Evaluation",
    icon: "📊",
    children: [
      { title: "Technical Scrutiny", href: "/officer/evaluation/technical" },
      { title: "Financial Opening", href: "/officer/evaluation/financial" },
      { title: "Comparative Statement", href: "/officer/evaluation/comparative" },
      { title: "Shortlist & Clearance", href: "/officer/evaluation/shortlisting" },
    ],
  },
  {
    title: "Decision & Award",
    icon: "⚖️",
    href: "/officer/decision",
  },
  {
    title: "Audit & Evidence",
    icon: "🔎",
    href: "/officer/audit",
  },
  {
    title: "Procurement Reports",
    icon: "📈",
    href: "/officer/reports",
  },
  {
    title: "Settings & Governance",
    icon: "⚙️",
    href: "/officer/settings",
  },
];

const bidderNav: NavItem[] = [
  {
    title: "Dashboard",
    icon: "🏠",
    href: "/bidder",
  },
  {
    title: "Tender Discovery",
    icon: "🔎",
    children: [
      { title: "Available Tenders", href: "/bidder/tenders" },
      { title: "My Tenders", href: "/bidder/tenders?filter=my" },
      { title: "Saved Tenders", href: "/bidder/tenders?saved=true" },
      { title: "Tender Details", href: "/bidder/tender" },
    ],
  },
  {
    title: "Bid Preparation",
    icon: "📝",
    children: [
      { title: "Bidder Information", href: "/bidder/bid-preparation" },
      { title: "Eligibility", href: "/bidder/tender?tab=eligibility" },
      { title: "Forms & Declarations", href: "/bidder/bid-preparation?tab=forms" },
      { title: "Technical Bid", href: "/bidder/bid-preparation?tab=technical" },
      { title: "Financial Bid / BOQ", href: "/bidder/bid-preparation?tab=boq" },
      { title: "Make in India / OEM", href: "/bidder/bid-preparation?tab=mii" },
    ],
  },
  {
    title: "Documents",
    icon: "📤",
    children: [
      { title: "Document Center", href: "/bidder/documents" },
      { title: "AI Verification", href: "/bidder/documents?tab=ai" },
      { title: "Missing Documents", href: "/bidder/documents?tab=missing" },
      { title: "Inconsistencies", href: "/bidder/documents?tab=inconsistencies" },
      { title: "Expiry Tracker", href: "/bidder/documents?tab=expiry" },
    ],
  },
  {
    title: "Compliance",
    icon: "🤖",
    children: [
      { title: "Compliance Dashboard", href: "/bidder/compliance" },
      { title: "Compliance Score", href: "/bidder/compliance?tab=score" },
      { title: "Risk Preview", href: "/bidder/compliance?tab=risk" },
      { title: "AI Recommendations", href: "/bidder/compliance?tab=recommendations" },
    ],
  },
  {
    title: "Final Review",
    icon: "🔍",
    children: [
      { title: "Bid Readiness", href: "/bidder/review" },
      { title: "Validation Results", href: "/bidder/review?tab=validation" },
      { title: "Declaration", href: "/bidder/review?tab=declaration" },
    ],
  },
  {
    title: "Submission",
    icon: "🚀",
    children: [
      { title: "DSC Signing", href: "/bidder/submission" },
      { title: "Submit Bid", href: "/bidder/submission?step=confirm" },
      { title: "Acknowledgement", href: "/bidder/submission?step=ack" },
    ],
  },
  {
    title: "My Bids",
    icon: "📊",
    children: [
      { title: "Draft", href: "/bidder/my-bids?status=draft" },
      { title: "Submitted", href: "/bidder/my-bids?status=submitted" },
      { title: "Under Evaluation", href: "/bidder/my-bids?status=evaluation" },
      { title: "Award Status", href: "/bidder/my-bids?status=awarded" },
    ],
  },
  {
    title: "Notifications",
    icon: "🔔",
    href: "/bidder/notifications",
  },
  {
    title: "Profile & Settings",
    icon: "👤",
    href: "/bidder/profile",
  },
];

function SidebarInner({ role }: { role: "bidder" | "officer" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isBidder = role === "bidder";
  const items = isBidder ? bidderNav : officerNav;

  // Active section finder (single open section accordion, does not auto-open on dashboard)
  const findActiveSection = () => {
    for (const it of items) {
      if (it.children) {
        if (
          it.children.some(
            (c) =>
              pathname === c.href ||
              (c.href !== "/" && (pathname === c.href.split("?")[0] || pathname.startsWith(c.href.split("?")[0] + "/")))
          )
        ) {
          return it.title;
        }
      }
    }
    return null;
  };

  const [openSection, setOpenSection] = useState<string | null>(findActiveSection());

  useEffect(() => {
    const matched = findActiveSection();
    setOpenSection(matched);
  }, [pathname, isBidder]);

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200/90 bg-white h-full flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] select-none">
      <div className="p-3.5 flex flex-col flex-1 min-h-0">
        {/* Role Header Banner - Unified Tender Blue Theme */}
        <div className="shrink-0 mb-3.5 rounded-xl p-3 text-white shadow-xs bg-gradient-to-r from-[#002244] via-[#003366] to-[#0b5cad]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider">
              {isBidder ? "Bidder Suite" : "Officer Console"}
            </span>
            <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-md">
              v1.2 Live
            </span>
          </div>
          <p className="text-[11px] text-white/90 mt-0.5 font-medium">
            {isBidder ? "e-Submission & Compliance" : "Tender & Evaluation Console"}
          </p>
        </div>

        {/* Navigation Tree */}
        <nav className="flex-1 space-y-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
          {items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = openSection === item.title;
            const isActiveParent = item.href
              ? pathname === item.href ||
                (item.href !== "/bidder" &&
                  item.href !== "/officer" &&
                  (pathname.startsWith(item.href + "/") ||
                    (item.href === "/bidder/tenders" && pathname.startsWith("/bidder/tender"))))
              : false;

            return (
              <div key={item.title} className="text-xs">
                {hasChildren ? (
                  <div>
                    <button
                      onClick={() => toggleSection(item.title)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl font-bold transition-all duration-200 group text-left ${
                        isExpanded
                          ? "bg-slate-100/90 text-[#002244] shadow-2xs"
                          : "text-slate-700 hover:bg-slate-50 hover:text-[#002244]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.icon}</span>
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-900">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <svg
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ease-in-out ${
                          isExpanded ? "rotate-90 text-[#002244]" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <div
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                        isExpanded ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="ml-5 pl-2 border-l-2 border-blue-100 my-0.5 space-y-0.5">
                          {item.children!.map((child) => {
                            const [childPath, childQuery] = child.href.split("?");
                            let isChildActive = false;
                            if (childQuery) {
                              const childParams = new URLSearchParams(childQuery);
                              if (pathname === childPath) {
                                let allMatch = true;
                                childParams.forEach((val, key) => {
                                  if (searchParams.get(key) !== val) {
                                    allMatch = false;
                                  }
                                });
                                isChildActive = allMatch;
                              }
                            } else {
                              if (pathname === childPath) {
                                const hasSpecialParams =
                                  searchParams.has("tab") ||
                                  searchParams.has("status") ||
                                  searchParams.has("step") ||
                                  searchParams.has("filter") ||
                                  searchParams.has("saved");
                                isChildActive = !hasSpecialParams;
                              }
                            }

                            return (
                              <Link
                                key={child.title}
                                href={child.href}
                                className={`block px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150 ${
                                  isChildActive
                                    ? "bg-blue-50 text-[#003366] font-bold border border-blue-200 shadow-2xs translate-x-0.5"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{child.title}</span>
                                  {child.badge && (
                                    <span className="text-[8px] bg-slate-200 text-slate-700 px-1 rounded font-bold">
                                      {child.badge}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl font-bold transition ${
                      isActiveParent
                        ? "bg-blue-50 text-[#003366] font-bold border border-blue-200 shadow-2xs"
                        : "text-slate-700 hover:bg-slate-100 hover:text-[#002244]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.icon}</span>
                      <span>{item.title}</span>
                    </div>
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Support in Sidebar */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/70 text-xs">
        <Link
          href="/bidder-guide"
          className="flex items-center gap-1.5 text-[11px] font-bold rounded-xl p-2 transition text-slate-800 bg-slate-100 border border-slate-200 hover:bg-slate-200"
        >
          <span>📘</span>
          <span>{isBidder ? "Bidder Submission Guide" : "Procurement Standard Manual"}</span>
        </Link>
      </div>
    </aside>
  );
}

export function Sidebar({ role }: { role: "bidder" | "officer" }) {
  return (
    <Suspense fallback={<aside className="w-64 shrink-0 border-r border-slate-200/90 bg-white h-full" />}>
      <SidebarInner role={role} />
    </Suspense>
  );
}
