"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { cardReveal, staggerContainer, fadeUp } from './animations';

const FeaturesSection: React.FC = () => {
  const pillars = [
    {
      title: 'Bidder Workspace & Document AI',
      icon: '📑',
      points: [
        'Automated OCR extraction for GSTIN, PAN, and Udyam credentials',
        'Pre-validation of CA-signed balance sheets & 18-digit UDIN codes',
        'Auto-compilation of mandatory NIT affidavits and OEM MAF letters',
        'Live qualification checker against turnover & technical criteria',
        'Secure evidence vault with Class-3 DSC digital signing readiness',
      ],
    },
    {
      title: 'AI Forensic Compliance Engine',
      icon: '⚖️',
      points: [
        'GFR 2017 Rule 144 statutory eligibility & pre-qualification scoring',
        'Real-time disqualification risk radar preventing procedural errors',
        'Contradiction detection across corrigenda, scope, and NIT clauses',
        'Structured pre-bid query submission & clarification workflow',
        'Automated MSME and DPIIT Startup turnover & experience relaxations',
      ],
    },
    {
      title: 'Officer Evaluation & Governance',
      icon: '🛡️',
      points: [
        'Two-cover technical evaluation matrix with live status tracking',
        'Dual-key Shamir-split cryptographic BOQ opening ceremony',
        'Automated comparative financial ranking (L1/H1 price matrices)',
        'Section 65B WORM audit trail with SHA-256 cryptographic chaining',
        'CVC and CAG inspection-ready statutory evidence export',
      ],
    },
  ];

  const chips = [
    'GFR 2017 Compliance', 'Two-Cover Technical Evaluation', 'Statutory Document AI (UDIN / Udyam)',
    'Dual-Key BOQ Opening Ceremony', 'Section 65B WORM Audit', 'CERT-In Malware Scanning',
    'GeM & CPPP Interoperability', 'MSME / DPIIT Relaxation Rules', 'CVC Audit Readiness', 'L1 Price Benchmarking',
  ];

  return (
    <section id="features" className="py-16 md:py-20 bg-[#E8EDF2]">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10"
        >
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              variants={cardReveal}
              whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.08)' }}
              transition={{ duration: 0.3 }}
              className="bg-white/85 backdrop-blur border border-white rounded-2xl p-6 shadow-sm cursor-default"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-lg">
                  {p.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
              </div>
              <ul className="space-y-2">
                {p.points.map((pt, j) => (
                  <li key={j} className="flex items-start gap-2 text-[13px] text-slate-600">
                    <FiCheck className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-wrap justify-center gap-2.5"
        >
          {chips.map((chip, i) => (
            <motion.span
              key={i}
              variants={fadeUp}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.95)' }}
              className="text-xs font-medium text-slate-600 bg-white/70 border border-slate-200/80 px-3.5 py-1.5 rounded-full cursor-default"
            >
              {chip}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
