"use client";

import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cardReveal, fadeUp, staggerContainer } from './animations';

const testimonials = [
  {
    name: "Deputy Director (Procurement)",
    company: "Central Ministry Directorate",
    feedback: "The automated two-cover compliance matrix reduced our technical screening time from fourteen days to under three hours, ensuring flawless compliance with GFR 2017 Rule 144."
  },
  {
    name: "Authorized Signatory",
    company: "MSME Security Solutions Vendor",
    feedback: "The pre-submission document AI detected an unverified CA UDIN and missing stamp date on our affidavit. That check alone protected our ₹4.5 Cr bid from technical disqualification."
  },
  {
    name: "Senior Tender Committee Member",
    company: "Defense & Civil PSU Directorate",
    feedback: "The dual-key financial opening ceremony mathematically guarantees that no pricing envelope can be previewed until technical qualification is permanently sealed in the ledger."
  },
  {
    name: "Vigilance & Audit Advisor",
    company: "Institutional Procurement Review Cell",
    feedback: "Section 65B WORM forward-hash chaining provides tamper-evident chronological proof for every officer action, completely resolving repudiation disputes during audit scrutiny."
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#E8EDF2] border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.h2 variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-[#0b5cad]">Stakeholder Impact</motion.h2>
          <motion.p variants={fadeUp} className="mt-2 text-3xl font-extrabold text-slate-900">Procurement Governance in Practice</motion.p>
          <motion.p variants={fadeUp} className="mt-3 text-slate-600 text-sm">Perspectives from procurement officers, MSME vendors, and statutory vigilance reviewers.</motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={cardReveal} whileHover={{ y: -6 }} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex gap-1 mb-4 text-amber-400">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-6">
                  "{t.feedback}"
                </p>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                <p className="text-xs text-blue-400">{t.company}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
