"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, CheckCircle, ShieldAlert } from "lucide-react";

export function GovernmentHeader({
  activeRole = "visitor",
  userName,
  userSub,
}: {
  activeRole?: "bidder" | "officer" | "visitor";
  userName?: string;
  userSub?: string;
}) {
  const [showNotifications, setShowNotifications] = useState(false);

  const isBidder = activeRole === "bidder";
  const isOfficer = activeRole === "officer";

  const defaultName = isOfficer 
    ? "Rajesh Kumar (Deputy Director)" 
    : isBidder 
    ? "Priya Sharma (ABC Tech)" 
    : "Public Access";
    
  const defaultSub = isOfficer 
    ? "Procurement Officer · MHA" 
    : isBidder 
    ? "Bidder · GST: 27ABCDE1234F1Z5" 
    : "Citizen / Vendor";

  const displayName = userName || defaultName;
  const displaySub = userSub || defaultSub;

  return (
    <header className="w-full bg-white border-b border-slate-200/90 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] font-sans">
      
      {/* Official Top Tricolor Ribbon */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Main Bar */}
      <div className="max-w-[1700px] mx-auto px-4 lg:px-7 py-3 flex items-center justify-between gap-4">
        
        {/* Brand & Seal */}
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-2xl font-black text-slate-950 tracking-tight">quick</span>
            <span className="text-2xl font-black text-[#003366]">bid</span>
          </Link>

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Central e-Procurement Portal</span>
          </div>
        </div>

        {/* Right Controls: Notifications & User Profile */}
        <div className="flex items-center gap-2.5">
          
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 border border-transparent hover:border-slate-200 transition cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              <span className="absolute 1 top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black text-white shadow-xs bg-[#002244]">
                3
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-84 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 p-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                  <span className="text-xs font-bold text-slate-900">Procurement & AI Alerts</span>
                  <button 
                    onClick={() => setShowNotifications(false)} 
                    className="text-[11px] font-semibold hover:underline text-[#003366]"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
                    <p className="font-bold text-emerald-950 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> AI Document Verified
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">GST Certificate verified with GSTN registry at 100% confidence.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/80">
                    <p className="font-bold text-[#002244] flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#003366]" /> Tender Corrigendum
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">Tender submission deadline extended by 48 hours.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill - Strictly bound to current role */}
          <Link
            href={isBidder ? "/bidder/profile" : "/officer/settings"}
            className="flex items-center gap-2.5 pl-2 border-l border-slate-200 hover:opacity-90 transition group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-xs bg-gradient-to-tr from-[#002244] to-[#003366]">
              {isOfficer ? "RK" : isBidder ? "PS" : "US"}
            </div>
            <div className="hidden lg:block text-left leading-tight">
              <p className="text-xs font-bold text-slate-900 truncate max-w-[150px] group-hover:underline">
                {displayName}
              </p>
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                {displaySub}
              </p>
            </div>
          </Link>

        </div>

      </div>
    </header>
  );
}
