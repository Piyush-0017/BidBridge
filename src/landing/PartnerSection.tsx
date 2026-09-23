"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Handshake, CheckCircle2, ArrowRight, X, Sparkles, Building, Send } from "lucide-react";
import { staggerContainer, fadeUp, cardReveal } from "./animations";

export default function PartnerSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState("Consultant");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    clients: "1-10",
  });

  const tracks = [
    {
      title: "GeM & CPPP e-Procurement Bridges",
      tag: "National Portals",
      badgeColor: "bg-blue-50 text-[#003366] border-blue-200",
      desc: "Standardized connectors for Government e-Marketplace (GeM 4.0) and Central Public Procurement Portal (CPPP).",
      benefits: [
        "Real-time bid notice ingestion & corrigenda synchronization",
        "Automated two-cover technical and financial envelope mapping",
        "Bidder registration & DSC credential verification handshake",
        "Conforms strictly with NIC e-procurement data exchange standards",
      ],
      cta: "Request GeM/CPPP Sandbox",
    },
    {
      title: "Statutory Verification Authorities",
      tag: "Zero-Fraud Connectors",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      desc: "Direct verification pipeline for Indian statutory registries preventing fraudulent or clerical submissions.",
      benefits: [
        "GSTN active status, return filing regularity & GSTR-3B matching",
        "CBDT PAN & corporate MCA21 registered entity validation",
        "MSME Udyam classification & automatic turnover exemption",
        "ICAI UDIN verification for CA audited balance sheets",
      ],
      cta: "Request Registry API Specs",
    },
    {
      title: "Vigilance & Forensics Oversight",
      tag: "CVC & CAG Ready",
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
      desc: "Built for Chief Vigilance Officers (CVO), CAG auditors, and appellate procurement authorities.",
      benefits: [
        "Immutable Section 65B WORM audit certificate generation",
        "Cryptographic non-repudiation verification for all bidder packets",
        "Multi-officer key custody monitoring for financial envelope opening",
        "Chronological dispute-ready tamper logs with SHA-256 forward digests",
      ],
      cta: "Request Vigilance Architecture",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setModalOpen(false);
      setForm({ name: "", email: "", phone: "", company: "", clients: "1-10" });
    }, 2000);
  };

  return (
    <section id="partner" className="py-20 md:py-24 bg-[#E8EDF2] relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200 text-[#003366] text-xs font-bold uppercase tracking-widest mb-4 shadow-sm"
          >
            <Handshake className="w-3.5 h-3.5 text-[#003366]" />
            Interoperability Ecosystem
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight"
          >
            National Integration &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#003366] to-[#0b5cad]">
              Governance Framework
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-600 mt-4 text-base md:text-lg leading-relaxed">
            BidBridge interfaces with India&apos;s primary public procurement nodes, statutory registries, and vigilance auditing standards.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {tracks.map((track, i) => (
            <motion.div
              key={i}
              variants={cardReveal}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm flex flex-col justify-between relative group hover:shadow-xl hover:border-blue-200 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${track.badgeColor}`}>
                    {track.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#003366] transition-colors">
                  {track.title}
                </h3>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed">{track.desc}</p>
                <div className="space-y-3 mb-8 pt-4 border-t border-slate-100">
                  {track.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTrack(track.title);
                  setModalOpen(true);
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-[#003366] text-slate-800 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all group-hover:bg-[#003366] group-hover:text-white"
              >
                <span>{track.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200"
            >
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Request Received</h3>
                  <p className="text-sm text-slate-600">
                    Thank you for your institutional integration request. Our technical team will reach out within 24 hours.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <span className="text-xs font-bold text-[#003366] uppercase tracking-wider">
                      Institutional Interoperability
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{selectedTrack}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Request integration protocols, sandbox API keys, or vigilance architecture documentation.
                    </p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nodal Officer / Lead Name</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Dr. Alok Verma"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Official / Institutional Email</label>
                        <input
                          required
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="alok.verma@nic.in or org email"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Official Phone</label>
                        <input
                          required
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="+91 11 2345 6789"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Ministry / PSU / Agency</label>
                        <input
                          required
                          type="text"
                          value={form.company}
                          onChange={(e) => setForm({ ...form, company: e.target.value })}
                          placeholder="e.g. Ministry of Electronics & IT"
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Portal / Node Type</label>
                        <select
                          value={form.clients}
                          onChange={(e) => setForm({ ...form, clients: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        >
                          <option value="1-10">Central Ministry / PSU Directorate</option>
                          <option value="11-50">State e-Procurement Portal Node</option>
                          <option value="50+">Statutory Registry (GSTN / CBDT / ICAI)</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 mt-4 bg-[#003366] hover:bg-[#002244] text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Request Integration Documentation</span>
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
