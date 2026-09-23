"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { fadeUp, staggerContainer, float, easeOut } from './animations';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden pt-20 bg-[#E8EDF2]">
      {/* Soft ambient cloud */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: easeOut }}
          className="absolute top-[28%] left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-white/55 rounded-full blur-3xl"
        />
      </div>

      {/* Floating character */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.25, ease: easeOut }}
        className="absolute left-4 md:left-8 lg:left-12 top-20 md:top-24 z-10 hidden sm:block"
      >
        <motion.div animate={float}>
          <img
            src="/manpower-worker.png"
            alt="BidBridge character"
            className="w-28 md:w-36 lg:w-44 h-auto select-none pointer-events-none"
            style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.15))' }}
          />
        </motion.div>

        {/* Real Portal Quick Link Card */}
        <motion.a
          href="/signup"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.75, ease: easeOut }}
          whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(0,0,0,0.1)' }}
          className="mt-2 block bg-white rounded-xl shadow-lg border border-slate-100/80 p-3.5 w-44 cursor-pointer"
        >
          <p className="text-[10px] font-bold text-slate-800 uppercase leading-tight">OFFICER + BIDDER</p>
          <p className="text-[10px] font-bold text-slate-800 uppercase leading-tight">DUAL WORKSPACE</p>
          <p className="text-[10px] font-semibold text-amber-500 mt-0.5 uppercase">ZERO-DEFECT SUBMISSION</p>
          <span className="text-[10px] font-medium text-[#0b5cad] mt-1.5 inline-block">
            Enter Workspace →
          </span>
        </motion.a>
      </motion.div>

      {/* Center content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-6 relative z-10 flex-1 flex flex-col justify-center items-center text-center py-16"
      >
        <motion.div variants={fadeUp} className="mb-5">
          <span className="inline-flex items-center gap-2 bg-white/90 border border-slate-200/80 text-slate-700 text-xs font-medium px-4 py-1.5 rounded-full shadow-sm">
            <span className="text-sm">🏛️</span> Central e-Procurement Portal & Compliance System
          </span>
        </motion.div>

        <motion.p variants={fadeUp} className="text-sm md:text-base text-slate-600 mb-4 max-w-xl font-medium">
          Central e-Procurement Portal & AI Forensic Compliance Engine
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-slate-900 leading-[1.08] tracking-tight max-w-4xl"
        >
          Fair. Transparent.
          <br />
          Auditable by Design.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-6 text-sm md:text-base text-slate-600 max-w-2xl leading-relaxed"
        >
          BidBridge transforms Indian public procurement under GFR 2017 standards.
          It eliminates technical bid disqualifications for vendors with pre-submission document AI,
          while empowering procurement officers with dual-key encrypted financial opening and Section 65B immutable WORM audit logs.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <motion.a
            href="/signup"
            whileHover={{ scale: 1.04, boxShadow: '0 12px 28px rgba(245,158,11,0.35)' }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3.5 rounded-lg shadow-lg shadow-amber-500/25 transition-colors"
          >
            Enter e-Procurement Portal
            <FiArrowRight className="w-4 h-4" />
          </motion.a>
          <motion.a
            href="/login"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3.5 rounded-lg border border-slate-300 shadow-sm transition-colors"
          >
            Official Login
          </motion.a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="relative z-10 py-8 border-t border-slate-200/50"
      >
        <p className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-[0.25em] mb-5">
          End-to-End Statutory Governance · BidBridge Architecture
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 px-6">
          {['Two-Cover Technical Evaluation', 'GFR 2017 Rule 144 Check', 'Document AI & OCR', 'Dual-Key BOQ Opening', 'Section 65B WORM Audit', 'CVC Audit Trail'].map((n) => (
            <span key={n} className="text-xs font-semibold text-slate-700 bg-white/85 border border-slate-200 rounded-full px-4 py-2 shadow-2xs">{n}</span>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
