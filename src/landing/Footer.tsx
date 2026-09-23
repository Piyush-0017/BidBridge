"use client";

import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#E8EDF2] border-t border-slate-200/80 pt-16 pb-12 text-slate-600 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#003366] flex items-center justify-center text-white font-extrabold text-lg">
              B
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900 leading-tight">Bid<span className="text-amber-500">Bridge</span></span>
              <span className="text-[10px] font-bold text-[#0b5cad] uppercase tracking-wider">Central e-Procurement Portal</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Central e-Procurement Portal & Forensic Compliance Engine. Eliminating vendor disqualification traps through pre-submission document AI and enforcing tamper-evident officer evaluations under GFR 2017.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-slate-900 font-semibold text-xs uppercase tracking-wider mb-4">Portal Modules</h4>
          <ul className="space-y-2.5">
            <li><a href="/bidder" className="hover:text-blue-600 transition-colors">Bidder Workspace & Document AI</a></li>
            <li><a href="/officer" className="hover:text-blue-600 transition-colors">Officer Evaluation Console</a></li>
            <li><a href="/login" className="hover:text-blue-600 transition-colors">Official Portal Authentication</a></li>
            <li><a href="#solutions" className="hover:text-blue-600 transition-colors">Forensic Architecture & GFR 2017</a></li>
          </ul>
        </div>

        {/* Security & Compliance */}
        <div>
          <h4 className="text-slate-900 font-semibold text-xs uppercase tracking-wider mb-4">Statutory Governance</h4>
          <ul className="space-y-2.5">
            <li><span className="text-slate-600">GFR 2017 Rule 144 Compliance</span></li>
            <li><span className="text-slate-600">Section 65B WORM Cryptographic Logs</span></li>
            <li><span className="text-slate-600">Dual-Key BOQ Opening Ceremony</span></li>
            <li><span className="text-slate-600">CVC Vigilance Manual Alignment</span></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-slate-900 font-semibold text-xs uppercase tracking-wider mb-4">Official Helpdesk</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#0b5cad]" />
              <span>support@bidbridge.gov.in</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#0b5cad]" />
              <span>officer@bidbridge.gov.in</span>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#0b5cad]" />
              <span>New Delhi, India</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© 2026 BidBridge Central e-Procurement Portal · All statutory rights reserved.</p>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <a href="/bidder-guide" className="hover:text-slate-900">Bidder Guide</a>
          <a href="/login" className="hover:text-slate-900">Officer Console</a>
          <a href="/" className="hover:text-slate-900">Portal Home</a>
        </div>
      </div>
    </footer>
  );
}
