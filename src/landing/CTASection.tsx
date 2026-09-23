"use client";

import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeUp } from './animations';

export default function CTASection() {
  return (
    <section id="demo" className="py-20 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="bg-gradient-to-b from-blue-900/40 to-slate-900 border border-blue-600/30 rounded-3xl p-10 sm:p-16 relative"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Experience the BidBridge Dual-Portal System
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto text-sm sm:text-base mb-8">
            Test live automated statutory compliance checks for vendors, or access the procurement officer console for two-cover evaluation and dual-key BOQ opening.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Select Your Portal
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl border border-white/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              Official Sign In
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
