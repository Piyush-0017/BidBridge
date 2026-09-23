"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Award, Users, Scale, CheckCircle2, TrendingUp } from "lucide-react";
import { staggerContainer, fadeUp, cardReveal } from "./animations";

export default function AboutSection() {
  const stats = [
    { value: "100% GFR", label: "Statutory Alignment", sub: "GFR 2017 Rule 144 & CVC Norms" },
    { value: "2-Cover", label: "Envelope Isolation", sub: "Technical & Financial Separation" },
    { value: "Sec 65B", label: "WORM Cryptographic Trail", sub: "Indian Evidence Act Admissible" },
    { value: "Dual-Key", label: "Financial Opening Ceremony", sub: "Zero Pre-Mature Rate Leakage" },
  ];

  const pillars = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#0b5cad]" />,
      title: "Sovereign Compliance & GFR 2017 Standards",
      desc: "Engineered strictly aligned with General Financial Rules (GFR 2017), CVC vigilance manuals, and standard GeM procurement terms to eliminate procedural disqualifications.",
    },
    {
      icon: <Scale className="w-6 h-6 text-[#0b5cad]" />,
      title: "Dual-Key Opening & Forensic Audit Integrity",
      desc: "Dual-sided accountability for bidders and procurement officers with cryptographic SHA-256 forward-hash chaining, verifiable audit blocks, and split key opening ceremonies.",
    },
    {
      icon: <Users className="w-6 h-6 text-[#0b5cad]" />,
      title: "Empowering MSMEs & Startup Bidders",
      desc: "Democratizing access to high-value government tenders by pre-validating CA UDIN codes, calculating turnover eligibility, and highlighting mandatory NIT annexures.",
    },
  ];

  return (
    <section id="about" className="py-20 md:py-24 bg-white relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-50/80 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="container mx-auto px-6 lg:px-8 relative z-10 max-w-7xl">
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#003366] border border-blue-200 mb-3"
          >
            <Award className="w-3.5 h-3.5 text-[#0b5cad]" />
            BidBridge Architecture
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Reimagining Public Procurement with Sovereign AI & Forensics
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-slate-600 mt-4 text-sm md:text-base leading-relaxed"
          >
            BidBridge is engineered for sovereign public e-procurement.
            It provides a dual-portal architecture: giving bidders pre-submission AI document verification to eliminate
            technical disqualifications, while providing procurement officers with unbiased forensic evaluation and Section 65B WORM auditability.
          </motion.p>
        </motion.div>

        {/* 4 KPI Highlights */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-16"
        >
          {stats.map((s, idx) => (
            <motion.div
              key={idx}
              variants={cardReveal}
              className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 text-center shadow-2xs hover:shadow-md hover:border-blue-200 transition-all"
            >
              <span className="text-3xl lg:text-4xl font-black text-[#003366] block tracking-tight">
                {s.value}
              </span>
              <span className="text-xs font-bold text-slate-900 block mt-1.5">
                {s.label}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                {s.sub}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Two-Column Story & Pillars */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Mission & Guarantee */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#0b5cad]">
              <TrendingUp className="w-4 h-4" />
              <span>Public Procurement Mission</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
              Every qualified vendor deserves a fair chance; every officer deserves non-repudiation.
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              In conventional public tenders, over 30% of competitive bids are summarily disqualified over minor clerical omissions—such as CA UDIN formatting, expired affidavits, or Udyam category misalignment. Meanwhile, evaluation committees face protracted manual scrutiny and audit dispute exposure. BidBridge solves both sides simultaneously.
            </p>
            <div className="space-y-3 pt-2">
              {[
                "100% Sovereign Inference: Local document extraction keeping sensitive tender financials private",
                "Automated BOQ Excel integrity check preventing cell formula tampering and disqualification",
                "Dual-Key opening ceremony requiring multi-officer consensus to reveal financial envelopes",
                "Cryptographic SHA-256 forward-hash chain ensuring Section 65B compliance for CVC inquiries",
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: 3 Value Pillars */}
          <div className="lg:col-span-6 space-y-4">
            {pillars.map((pillar, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  {pillar.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{pillar.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
