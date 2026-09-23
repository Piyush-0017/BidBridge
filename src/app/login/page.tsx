"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Folder, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Lock
} from "lucide-react";
import { easeOut, fadeUp, staggerContainer, cardReveal } from "@/landing/animations";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your email or username");
      return;
    }
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed. Please check your credentials.");
      }

      setSuccessMsg(`Welcome back, ${data.user?.name || "User"}! Redirecting...`);

      setTimeout(() => {
        if (data.user?.role === "OFFICER" || data.user?.role === "ADMIN") {
          router.push("/officer");
        } else {
          router.push("/bidder");
        }
        router.refresh();
      }, 600);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleQuickFill = (email: string) => {
    setIdentifier(email);
    setPassword("Password@123");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#EEF2F6] bg-fixed flex flex-col lg:flex-row text-slate-800 font-sans selection:bg-blue-500/20 selection:text-blue-950 overflow-x-hidden">
      
      {/* LEFT PANEL */}
      <div className="lg:w-7/12 p-8 sm:p-12 lg:p-16 xl:p-20 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#F8FAFC] via-[#EEF4F8] to-[#E3EAF2]">
        
        {/* Soft Ambient Floating Glow Orbs in Delicate Sky/Blue */}
        <motion.div 
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.15, 0.28, 0.15],
            x: [0, 15, 0],
            y: [0, -15, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-12 -left-12 w-[480px] h-[480px] bg-sky-300/30 rounded-full blur-3xl pointer-events-none"
        />

        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.22, 0.1],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-0 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10">
          
          {/* Animated Logo */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
          >
            <Link href="/" className="inline-flex flex-col mb-12 group">
              <div className="flex items-center text-3xl sm:text-4xl font-black tracking-tight">
                <span className="text-slate-950">Bid</span>
                <span className="text-[#0b5cad] transition-transform group-hover:scale-105 inline-block origin-left duration-200">Bridge</span>
              </div>
              <motion.span 
                initial={{ opacity: 0, letterSpacing: "0.15em" }}
                animate={{ opacity: 1, letterSpacing: "0.2em" }}
                transition={{ duration: 0.9, delay: 0.2 }}
                className="text-[10px] font-bold text-[#0b5cad] uppercase -mt-0.5"
              >
                CENTRAL e-PROCUREMENT & FORENSIC COMPLIANCE
              </motion.span>
            </Link>
          </motion.div>

          {/* Main Headline & Description with Staggered Entrance */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="max-w-xl space-y-4"
          >
            <motion.h1 
              variants={fadeUp}
              className="text-2xl sm:text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight uppercase"
            >
              Statutory Trust & <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-950 via-[#003366] to-[#0b5cad]">Forensic Control</span>
            </motion.h1>

            <motion.p 
              variants={fadeUp}
              className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal"
            >
              BidBridge Dual-Portal System: AI-driven pre-submission document verification for vendors and tamper-proof forensic evaluation for procurement officers.
            </motion.p>
          </motion.div>

          {/* 3 Step Feature Cards with Staggered Animation & Hover Physics */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-10 space-y-4 max-w-xl"
          >
            
            {/* Card 01 */}
            <motion.div 
              variants={cardReveal}
              whileHover={{ 
                y: -4, 
                x: 4,
                boxShadow: "0 14px 30px -4px rgba(11,92,173,0.15)",
                borderColor: "rgba(11,92,173,0.35)"
              }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="group relative bg-white/95 backdrop-blur-xs rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  className="w-10 h-10 rounded-xl bg-blue-50/90 border border-blue-200/80 flex items-center justify-center text-[#0b5cad] shrink-0 shadow-2xs"
                >
                  <Folder className="w-5 h-5 text-[#0b5cad]" />
                </motion.div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b5cad] block">
                    STAGE 01 · BIDDER WORKSPACE
                  </span>
                  <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 mt-0.5 group-hover:text-[#0b5cad] transition-colors">
                    Statutory Document AI & Real-Time GST/PAN/Udyam Extraction
                  </h3>
                </div>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-slate-200/80 group-hover:text-blue-300 select-none pl-4 transition-colors">
                01
              </span>
            </motion.div>

            {/* Card 02 */}
            <motion.div 
              variants={cardReveal}
              whileHover={{ 
                y: -4, 
                x: 4,
                boxShadow: "0 14px 30px -4px rgba(11,92,173,0.15)",
                borderColor: "rgba(11,92,173,0.35)"
              }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="group relative bg-white/95 backdrop-blur-xs rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  className="w-10 h-10 rounded-xl bg-blue-50/90 border border-blue-200/80 flex items-center justify-center text-[#0b5cad] shrink-0 shadow-2xs"
                >
                  <BarChart3 className="w-5 h-5 text-[#0b5cad]" />
                </motion.div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b5cad] block">
                    STAGE 02 · FORENSIC ENGINE
                  </span>
                  <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 mt-0.5 group-hover:text-[#0b5cad] transition-colors">
                    GFR 2017 Rule 144 Compliance & Disqualification Risk Radar
                  </h3>
                </div>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-slate-200/80 group-hover:text-blue-300 select-none pl-4 transition-colors">
                02
              </span>
            </motion.div>

            {/* Card 03 */}
            <motion.div 
              variants={cardReveal}
              whileHover={{ 
                y: -4, 
                x: 4,
                boxShadow: "0 14px 30px -4px rgba(11,92,173,0.15)",
                borderColor: "rgba(11,92,173,0.35)"
              }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="group relative bg-white/95 backdrop-blur-xs rounded-2xl p-5 border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  className="w-10 h-10 rounded-xl bg-blue-50/90 border border-blue-200/80 flex items-center justify-center text-[#0b5cad] shrink-0 shadow-2xs"
                >
                  <Zap className="w-5 h-5 text-[#0b5cad]" />
                </motion.div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b5cad] block">
                    STAGE 03 · OFFICER GOVERNANCE
                  </span>
                  <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 mt-0.5 group-hover:text-[#0b5cad] transition-colors">
                    Dual-Key BOQ Opening Ceremony & Section 65B WORM Audit
                  </h3>
                </div>
              </div>
              <span className="text-3xl sm:text-4xl font-black text-slate-200/80 group-hover:text-blue-300 select-none pl-4 transition-colors">
                03
              </span>
            </motion.div>

          </motion.div>
        </div>

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-xs text-slate-500 font-medium"
        >
          © {new Date().getFullYear()} BidBridge Central e-Procurement Portal · GFR 2017 & CVC Audited.
        </motion.div>
      </div>

      {/* RIGHT PANEL: REFINED LIGHTER LOGIN CARD */}
      <div className="lg:w-5/12 p-6 sm:p-10 lg:p-14 flex flex-col justify-center items-center bg-gradient-to-b from-[#F0F5FA] via-[#E8EFF6] to-[#DEE8F2] border-t lg:border-t-0 lg:border-l border-blue-100/80 relative overflow-hidden">
        
        {/* Soft Ambient Light Glow in Right Panel */}
        <div className="absolute top-12 right-12 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-8 left-8 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          
          {/* Animated Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.15, ease: easeOut }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200/80 text-[#0b5cad] text-[11px] font-bold mb-3 shadow-2xs">
              <Lock className="w-3 h-3 text-[#0b5cad]" />
              <span>Official Portal Authentication</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Access your BidBridge e-Procurement workspace to{" "}
              <motion.span 
                animate={{ color: ["#0b5cad", "#2563eb", "#0b5cad"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="font-semibold inline-block"
              >
                Evaluate • Verify • Comply
              </motion.span>{" "}
              with GFR 2017 standards.
            </p>
          </motion.div>

          {/* Login Form Box with Reveal Animation & Lighter Detailed Styling */}
          <motion.div 
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.25, ease: easeOut }}
            className="bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_20px_50px_-15px_rgba(11,92,173,0.12),0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-blue-100/90 p-6 sm:p-8 relative overflow-hidden"
          >
            {/* Detailed Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-[#0b5cad] to-blue-600" />
            
            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Alert */}
            <AnimatePresence>
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5 overflow-hidden"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              
              {/* Email or Username Input */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.35 }}
              >
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email or Username <span className="text-[#0b5cad]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com or username"
                    autoComplete="username"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b5cad]/20 focus:border-[#0b5cad] transition shadow-2xs"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.42 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password <span className="text-[#0b5cad]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Demo mode: You can log in using Password@123 or select a Quick Demo role below.")}
                    className="text-xs font-medium text-[#0b5cad] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50/70 border border-slate-200/90 rounded-xl text-slate-900 placeholder:text-slate-400 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0b5cad]/20 focus:border-[#0b5cad] transition pr-10 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Animated Sign In Button - Lighter, Detailed Royal Blue with Rich Gradient & Shadow */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#0b5cad] via-[#1270d4] to-[#1d7ee8] hover:from-[#004b99] hover:via-[#0b5cad] hover:to-[#1270d4] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border border-blue-300/30 disabled:opacity-70 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Quick 1-Click Demo Accounts */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-6 pt-5 border-t border-slate-100"
            >
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2.5 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0b5cad]" />
                1-Click Quick Demo Sign In
              </p>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleQuickFill("officer@sih.gov.in")}
                  className="px-2.5 py-2 text-xs font-bold bg-blue-50/60 hover:bg-blue-100/80 text-[#003366] hover:text-[#0b5cad] border border-blue-200/80 hover:border-blue-300 rounded-xl transition text-center cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <span>🏛️</span> Officer Console
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleQuickFill("bidder1@abctech.com")}
                  className="px-2.5 py-2 text-xs font-bold bg-blue-50/60 hover:bg-blue-100/80 text-[#003366] hover:text-[#0b5cad] border border-blue-200/80 hover:border-blue-300 rounded-xl transition text-center cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
                >
                  <span>💼</span> Bidder Portal
                </motion.button>
              </div>
            </motion.div>

            {/* Security Badge */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.58 }}
              className="mt-6 pt-4 text-center border-t border-slate-100 space-y-2"
            >
              <div className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Enterprise-Grade Security</span>
              </div>
              <div>
                <Link
                  href="/"
                  className="inline-block text-xs font-bold text-[#1D4ED8] hover:underline"
                >
                  ← Back to Portal Home
                </Link>
              </div>
            </motion.div>

          </motion.div>

        </div>

      </div>

    </div>
  );
}
