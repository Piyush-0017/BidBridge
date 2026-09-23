"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cardReveal, fadeUp, staggerContainer } from './animations';

const faqs = [
  {
    q: "What core problem does the BidBridge e-Procurement Portal solve?",
    a: "It resolves the systemic bottlenecks in Indian public procurement under GFR 2017: high rates of vendor disqualification caused by clerical or statutory certificate omissions (such as CA UDIN, Udyam, or stamp paper dates), and protracted manual evaluation cycles with audit dispute exposure for government procurement officers."
  },
  {
    q: "How does Document AI protect bidders from technical disqualification?",
    a: "During bid preparation in the Bidder Workspace, the platform's forensic OCR parses statutory documents, extracts GSTIN, PAN, and MSME Udyam credentials, validates the 18-digit CA UDIN on audited balance sheets, and verifies mandatory NIT annexures before submission."
  },
  {
    q: "How does the dual-key ceremony secure financial envelopes during two-cover bidding?",
    a: "Under GFR 2017 guidelines, commercial pricing envelopes must remain strictly concealed until technical evaluation is finalized. Our system encrypts the BOQ with split cryptographic keys distributed between designated evaluation officers, ensuring pricing can only be unlocked through simultaneous officer authorization."
  },
  {
    q: "How does the platform guarantee legal admissibility under Section 65B of the Indian Evidence Act?",
    a: "Every transaction—tender creation, bid upload, corrigendum issuance, technical scoring, and financial opening—is sealed in a Write Once Read Many (WORM) forward-hash chain using SHA-256 digests. This creates an unalterable, tamper-evident chronological ledger compliant with CVC and CAG audit requirements."
  }
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="text-center mb-16"
      >
        <motion.h2 variants={fadeUp} className="text-xs font-bold uppercase tracking-widest text-[#0b5cad]">Frequently Asked Questions</motion.h2>
        <motion.p variants={fadeUp} className="mt-2 text-3xl font-extrabold text-slate-900">BidBridge Architecture & Compliance FAQs</motion.p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        className="space-y-4"
      >
        {faqs.map((faq, index) => {
          const isOpen = openIdx === index;
          return (
            <motion.div key={index} variants={cardReveal} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-colors shadow-sm">
              <button
                onClick={() => setOpenIdx(isOpen ? null : index)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4"
              >
                <span className="text-sm sm:text-base font-semibold text-slate-900">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-4">
                  {faq.a}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
