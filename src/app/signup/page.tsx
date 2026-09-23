"use client";

import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        <div className="bg-[#002244] px-8 py-8 text-white">
          <div className="flex items-center gap-3"><ShieldCheck className="text-amber-400"/><span className="text-xl font-extrabold">BidBridge</span></div>
          <h1 className="mt-6 text-3xl font-black">Start your procurement workspace</h1>
          <p className="mt-2 text-sm text-blue-100">Choose the portal you want to enter. Your bidder and officer workflows are available from the same platform.</p>
        </div>
        <div className="grid gap-4 p-8 md:grid-cols-2">
          <Link href="/bidder" className="group rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition">
            <Building2 className="text-[#003366]"/>
            <h2 className="mt-4 font-bold">Bidder / Vendor</h2>
            <p className="mt-1 text-sm text-slate-500">Discover tenders, prepare bids, manage evidence and submit.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#003366]">Enter bidder portal <ArrowRight size={16}/></span>
          </Link>
          <Link href="/officer" className="group rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition">
            <CheckCircle2 className="text-emerald-600"/>
            <h2 className="mt-4 font-bold">Procurement Officer</h2>
            <p className="mt-1 text-sm text-slate-500">Create tenders, evaluate bids, verify compliance and award.</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#003366]">Enter officer portal <ArrowRight size={16}/></span>
          </Link>
        </div>
        <div className="border-t border-slate-100 px-8 py-5 text-center text-sm text-slate-500"><Link href="/" className="font-semibold text-[#003366]">← Back to BidBridge</Link></div>
      </div>
    </main>
  );
}
