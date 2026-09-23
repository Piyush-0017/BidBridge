"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Calendar, Clock, ArrowRight, X, CheckCircle2, Bookmark, Share2 } from "lucide-react";
import { staggerContainer, fadeUp, cardReveal } from "./animations";

type Article = {
  id: string;
  category: "GeM & GFR 2017" | "AI Bidding" | "Compliance & Risk";
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  content: string[];
  takeaways: string[];
};

export default function BlogSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [subEmail, setSubEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const articles: Article[] = [
    {
      id: "1",
      category: "GeM & GFR 2017",
      title: "Top 7 Reasons Bids Get Disqualified Under GFR Rule 144 & How to Avoid Them",
      excerpt: "A comprehensive breakdown of General Financial Rules (GFR 2017) compliance traps, missing annexure affidavits, and OEM authorization errors.",
      date: "August 2026",
      readTime: "5 min read",
      author: "Procurement Policy Cell",
      authorRole: "Central e-Procurement Directorate",
      content: [
        "Government procurement officers are bound by strict statutory guidelines. Even a competitive L1 bid can be summarily rejected during technical evaluation if statutory criteria are unfulfilled.",
        "1. Incomplete Manufacturer Authorization Form (MAF): Officers reject generic letters. Always verify the tender-specific tender reference number is explicitly cited.",
        "2. BOQ Formula Tampering: Never alter the column dimensions or formula cells in the standard Excel sheet. Officers run automated integrity scripts that flag any macro discrepancies.",
        "3. Turnover Deficiencies: GFR requires audited balance sheets signed by a chartered accountant with a valid Unique Document Identification Number (UDIN).",
        "4. Non-Blacklisting Stamp Inconsistencies: Ensure the judicial stamp paper date precedes the bid submission date.",
      ],
      takeaways: [
        "Always cross-reference tender specific MAF formats against the NIT annexure",
        "Never modify Excel BOQ sheet calculations or hidden tabs",
        "Ensure all CA certificates include verifiable 18-digit UDIN codes",
      ],
    },
    {
      id: "2",
      category: "AI Bidding",
      title: "How Sovereign AI Reduces Government Bid Preparation from 48 Hours to 14 Minutes",
      excerpt: "Discover how forensic OCR, automated table extraction, and local LLM pipelines are transforming public sector bidding across India.",
      date: "July 2026",
      readTime: "4 min read",
      author: "BidBridge Architecture Group",
      authorRole: "Technical Systems Division",
      content: [
        "A typical 200-page RFP issued by Indian Railways, NHAI, or state electricity boards contains hundreds of non-negotiable compliance clauses.",
        "Manual reading risks missing tiny conditional footnotes that dictate mandatory certifications such as ISO 9001, CMMI Level 3, or Class-3 DSC parameters.",
        "BidBridge uses a fine-tuned semantic model specifically trained on Indian public procurement documents. It parses tables, checks eligibility against company profiles, and pre-populates statutory declaration forms.",
        "The result is a zero-defect bid document generated in under 15 minutes, allowing bidders to focus on pricing strategy instead of repetitive formatting.",
      ],
      takeaways: [
        "AI cuts human error in annexure mapping to virtually 0%",
        "Forensic OCR parses scanned PDFs and faint municipal seals",
        "Instant Go/No-Go score protects bidders from wasting EMD on ineligible tenders",
      ],
    },
    {
      id: "3",
      category: "Compliance & Risk",
      title: "The Ultimate MSME & Start-up Exemption Guide on GeM 4.0",
      excerpt: "Everything you need to know about prior turnover and experience waivers under the Public Procurement Policy for MSEs.",
      date: "June 2026",
      readTime: "6 min read",
      author: "MSME Regulatory Advisory",
      authorRole: "Public Procurement Division",
      content: [
        "Under Department of Expenditure guidelines, Central Ministries and PSUs are mandated to procure a minimum of 25% from Micro and Small Enterprises.",
        "Startups recognized by DPIIT and registered MSEs are often exempt from Prior Turnover and Prior Experience conditions, provided technical capability is proven.",
        "However, many bidders fail to upload their valid Udyam Registration Certificate in the correct slot, leading to disqualification for EMD non-payment.",
        "When claiming exemption, ensure your Udyam category matches the exact NIC code related to the tender scope of work.",
      ],
      takeaways: [
        "Always attach both DPIIT and Udyam certificates with active validation status",
        "Confirm whether the tender explicitly allows turnover relaxation before waiving EMD",
        "Check that your NIC code precisely covers the tendered item or service",
      ],
    },
  ];

  const filtered = activeCategory === "All"
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setSubEmail("");
    }, 3000);
  };

  return (
    <section id="blog" className="py-20 md:py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Section Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#003366] border border-blue-200 mb-3"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0b5cad]" />
            Procurement Insights & Blog
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Mastering the Rules of Public Procurement
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-slate-600 mt-3 text-sm md:text-base leading-relaxed"
          >
            Read practical guides, GFR 2017 regulatory breakdowns, and AI-driven bidding playbooks authored by public contracting veterans.
          </motion.p>
        </motion.div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {["All", "GeM & GFR 2017", "AI Bidding", "Compliance & Risk"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#002244] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-16"
        >
          {filtered.map((article) => (
            <motion.article
              key={article.id}
              variants={cardReveal}
              whileHover={{ y: -6 }}
              className="bg-slate-50/70 rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-[#003366]">
                    {article.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{article.readTime}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug tracking-tight hover:text-[#0b5cad] transition-colors">
                  {article.title}
                </h3>

                <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>

              <div className="p-6 pt-0 border-t border-slate-200/60 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{article.author}</span>
                  <span className="text-[10px] text-slate-500 block">{article.date}</span>
                </div>

                <button
                  onClick={() => setSelectedArticle(article)}
                  className="px-3 py-1.5 rounded-lg bg-[#003366] hover:bg-[#0b5cad] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Newsletter Subscription Box */}
        <div className="bg-gradient-to-br from-slate-900 via-[#002244] to-[#003366] rounded-3xl p-8 sm:p-10 text-white max-w-4xl mx-auto text-center shadow-xl">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
            Tender Alert & Regulatory Digest
          </span>
          <h3 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            Stay Ahead of Every GFR Corrigendum & Policy Shift
          </h3>
          <p className="text-xs sm:text-sm text-blue-100 mt-2 max-w-xl mx-auto">
            Get our bi-weekly dispatch on high-value tender forecasts, compliance checklists, and public procurement intelligence.
          </p>

          <form onSubmit={handleSubscribe} className="mt-6 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={subEmail}
              onChange={(e) => setSubEmail(e.target.value)}
              placeholder="Enter your enterprise email..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-xs focus:outline-none focus:bg-white/20"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition cursor-pointer shadow-xs"
            >
              {subscribed ? "Subscribed! ✓" : "Subscribe Free"}
            </button>
          </form>
          {subscribed && (
            <p className="text-xs text-emerald-300 font-semibold mt-2">
              You are on the priority dispatch list. Welcome aboard!
            </p>
          )}
        </div>
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-[#003366] border border-blue-200">
                  {selectedArticle.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 leading-snug">
                  {selectedArticle.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 border-b border-slate-100 pb-4">
                  <span className="font-bold text-slate-800">{selectedArticle.author}</span>
                  <span>•</span>
                  <span>{selectedArticle.authorRole}</span>
                  <span>•</span>
                  <span>{selectedArticle.date}</span>
                </div>
              </div>

              {/* Article Content */}
              <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
                {selectedArticle.content.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* Takeaways Box */}
              <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200/80">
                <h4 className="text-xs font-bold text-[#003366] uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-[#0b5cad]" />
                  Key Procurement Takeaways
                </h4>
                <ul className="space-y-2">
                  {selectedArticle.takeaways.map((t, tIdx) => (
                    <li key={tIdx} className="flex items-start gap-2 text-xs text-slate-800 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">BidBridge Sovereign Intelligence</span>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-[#003366] transition cursor-pointer"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
