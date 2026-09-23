"use client";

import { Check, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { cardReveal, fadeUp, staggerContainer } from './animations';

const advantages = [
  "Strict alignment with General Financial Rules (GFR 2017) & CVC procurement manuals",
  "Role-Based Access Control (RBAC) separating Officer evaluation from Bidder preparation",
  "Automated verification of statutory credentials: GSTIN, PAN, and MSME Udyam",
  "ICAI UDIN verification preventing falsified chartered accountant balance sheets",
  "Two-cover envelope security preventing premature financial rate disclosure",
  "Dual-key cryptographic BOQ opening ceremony with multi-officer key shares",
  "Section 65B WORM audit trail with SHA-256 recursive forward-hash integrity",
  "Zero-retention inference architecture ensuring sovereign commercial data privacy",
];

export default function AdvantagesSection() {
  return (
    <section id="about" className="py-20 bg-[#E8EDF2] border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.h2 variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-[#0b5cad]">BidBridge Architectural Advantages</motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-3xl font-extrabold text-slate-900">Engineered for Public Trust & Vigilance Compliance</motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-4xl mx-auto"
        >
          {advantages.map((adv, index) => (
            <motion.div key={index} variants={cardReveal} className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-slate-200/80">
              <div className="h-6 w-6 rounded-full bg-blue-500/20 text-[#0b5cad] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm text-slate-700 font-medium">{adv}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Security callout */}
        <div className="mt-14 max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-sm">
          <div className="p-3 bg-blue-600/15 rounded-xl text-[#0b5cad] flex-shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Section 65B WORM Ledger & Cryptographic Dual Keys</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Evaluation decisions, statutory document verifications, and financial openings generate tamper-evident SHA-256 cryptographic blocks, admissible under Section 65B of the Indian Evidence Act for CAG and CVC compliance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
