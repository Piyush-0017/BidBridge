"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { GovernmentHeader } from "./GovernmentHeader";
import { LogOut, CheckCircle2, Shield } from "lucide-react";

type User = { id: string; name: string; email: string; role: string };

export function Shell({
  role,
  title,
  subtitle,
  children,
}: {
  role: "bidder" | "officer";
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showSidebar?: boolean;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) {
          router.replace("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d && d.user) {
          const userRole = d.user.role;
          setUser(d.user);

          // Enforce role isolation
          if (role === "officer" && userRole === "BIDDER") {
            router.replace("/bidder");
            return;
          }
          if (role === "bidder" && (userRole === "OFFICER" || userRole === "ADMIN")) {
            router.replace("/officer");
            return;
          }

          setIsAuthorized(true);
        }
      })
      .catch(() => {
        // In local development, if DB call fails, still allow rendering
        setIsAuthorized(true);
      });
  }, [role, router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isBidder = role === "bidder";

  return (
    <div className="h-screen bg-[#EEF2F6] flex flex-col font-sans text-slate-800 selection:bg-blue-500/20 selection:text-blue-950 overflow-hidden">
      
      {/* Universal Header (Strictly scoped to current role, fixed at top) */}
      <div className="shrink-0 z-50">
        <GovernmentHeader
          activeRole={role}
          userName={user ? user.name : (isBidder ? "Priya Sharma (ABC Tech Solutions)" : "Rajesh Kumar (Deputy Director)")}
          userSub={user ? `${user.role} · ${user.email}` : (isBidder ? "Bidder · GST: 27ABCDE1234F1Z5" : "Procurement Officer · MHA")}
        />
      </div>

      {/* Main Layout Container with Fixed Sidebar & Scrollable Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar role={role} />
        
        {/* Scrollable Upper Data & Text Panel */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto custom-scrollbar">
          <main className="min-w-0 flex-1 p-4 lg:p-7">
            <div className="mx-auto max-w-[1580px]">
              
              {/* Top Page Action & Context Banner */}
              <div className="mb-6 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
                
                {/* Role accent line - Unified tender blue gradient */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#002244] via-[#003366] to-[#0b5cad]" />

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-50 text-[#003366] border border-blue-200">
                      {isBidder ? "💼 Bidder Workspace" : "🏛️ Officer Console"}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs font-semibold text-slate-500">{title}</span>
                  </div>
                  <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                    {title}
                  </h1>
                  {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Pill */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border bg-blue-50 text-[#003366] border-blue-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isBidder ? "Bidder Access Active" : "Officer Authority Active"}</span>
                  </span>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-700 transition cursor-pointer shadow-2xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* Page Body */}
              <div className="space-y-6">
                {children}
              </div>
            </div>
          </main>

          {/* Unified Footer */}
          <footer className="w-full bg-[#0A192F] text-white py-4 px-6 text-xs text-center border-t border-slate-800 shrink-0 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold text-white">quick<span className="text-[#0b5cad]">bid</span></span>
                <span className="text-slate-600">|</span>
                <p className="text-slate-400 font-medium">
                  Enterprise Tender Discovery, AI Verification & Statutory Decision System
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" /> 256-Bit Encrypted</span>
                <span>•</span>
                <span>GeM Compliant</span>
                <span>•</span>
                <span className="text-amber-400 font-bold">Government of India 🇮🇳</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
