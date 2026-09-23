"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp, easeOut } from './animations';

const rowReveal = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.72, delay: Math.min(index * 0.2, 0.45), ease: easeOut },
  }),
};

const challengeReveal = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

const solutionReveal = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay: 0.12, ease: easeOut },
  },
};

const SolutionsSection: React.FC = () => {
  const pairs = [
    {
      challenge: { 
        title: 'High Disqualification from Minor Format & Statutory Errors', 
        desc: 'Over 30% of competitive MSME bids are rejected during technical opening due to missing CA UDIN numbers, invalid stamp dates, or omitted NIT annexures.' 
      },
      solution: { 
        title: 'Automated Document AI & Pre-Submission Verification', 
        desc: 'Extracts and verifies GSTIN, PAN, MSME Udyam, and CA UDIN credentials in real-time, pre-validating statutory compliance before packet finalization.' 
      },
    },
    {
      challenge: { 
        title: 'Protracted Manual Two-Cover Technical Evaluations', 
        desc: 'Procurement officers spend weeks manually reviewing hundreds of PDF pages across dozens of bidders to score eligibility against complex GFR 2017 clauses.' 
      },
      solution: { 
        title: 'Instant Compliance Matrix & Disqualification Risk Radar', 
        desc: 'Automatically cross-references vendor documents against tender requirements, scoring compliance and flagging ambiguous claims for structured officer clarification.' 
      },
    },
    {
      challenge: { 
        title: 'Financial Envelope Vulnerability & Collusion Risks', 
        desc: 'Single-custody financial opening risks premature rate disclosures, pricing leakage, or accusations of procedural bias in competitive public bidding.' 
      },
      solution: { 
        title: 'Dual-Key Encrypted BOQ Opening Ceremony', 
        desc: 'Financial envelopes remain encrypted with split Shamir-style keys; decryption requires simultaneous officer authorization only after technical bids qualify.' 
      },
    },
    {
      challenge: { 
        title: 'Audit Vulnerabilities & Dispute Repudiation', 
        desc: 'Conventional audit logs can be retroactively modified or contested during CVC vigilance inquiries or court proceedings under Indian Evidence law.' 
      },
      solution: { 
        title: 'Section 65B WORM Cryptographic Hash Chaining', 
        desc: 'Every officer decision, bidder upload, and timestamp is permanently linked in a SHA-256 forward-hash ledger, providing tamper-evident, court-admissible records.' 
      },
    },
  ];

  return (
    <section id="solutions" className="py-16 md:py-20 bg-white">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="text-center mb-12">
          <motion.h2 variants={fadeUp} className="text-2xl md:text-3xl font-bold text-slate-900">From Procurement Bottlenecks to Sovereign Solutions</motion.h2>
          <motion.p variants={fadeUp} className="text-slate-500 mt-2 text-sm">How BidBridge transforms public tender governance under GFR 2017</motion.p>
        </motion.div>

        <div className="space-y-5 max-w-5xl mx-auto">
          {pairs.map((pair, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={rowReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <motion.div variants={challengeReveal} whileHover={{ scale: 1.01 }} className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 text-lg mt-0.5">✕</span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{pair.challenge.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{pair.challenge.desc}</p>
                  </div>
                </div>
              </motion.div>
              <motion.div variants={solutionReveal} whileHover={{ scale: 1.01 }} className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className="text-emerald-500 text-lg mt-0.5">✓</span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{pair.solution.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{pair.solution.desc}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;
