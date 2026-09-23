"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, ShieldAlert, MessageSquare } from "lucide-react";
import { staggerContainer, fadeUp } from "./animations";

export default function ContactSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    org: "",
    type: "Book an Enterprise Demo",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setForm({
        name: "",
        email: "",
        phone: "",
        org: "",
        type: "Book an Enterprise Demo",
        message: "",
      });
    }, 1200);
  };

  return (
    <section id="contact" className="py-20 md:py-24 bg-[#E8EDF2] relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Header */}
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
            <MessageSquare className="w-3.5 h-3.5 text-[#0b5cad]" />
            Official Assistance
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Central e-Procurement Technical Helpdesk
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-slate-600 mt-3 text-sm md:text-base leading-relaxed"
          >
            Reach the BidBridge technical support and evaluation advisory cell for portal queries, statutory compliance guidance, or institutional onboarding.
          </motion.p>
        </motion.div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Contact Channels & Credentials */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Official Support Channels</h3>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b5cad] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">National Procurement Helpdesk</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">+91 11 2436 0199</span>
                  <span className="text-xs text-slate-500">Working Days, 9:00 AM – 6:00 PM IST</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b5cad] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Official Electronic Inquiries</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">support@bidbridge.gov.in</span>
                  <span className="text-xs text-slate-500">officer@bidbridge.gov.in</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0b5cad] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Technical Directorate</span>
                  <span className="text-sm font-bold text-slate-900 block mt-0.5">MeitY / NIC e-Procurement Cell</span>
                  <span className="text-xs text-slate-500">CGO Complex, Lodhi Road, New Delhi 110003</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Statutory Clarifications Logged & Timestamped</span>
                </div>
              </div>
            </div>

            {/* Sovereign Data Note */}
            <div className="bg-gradient-to-br from-[#002244] to-[#003366] text-white rounded-2xl p-6 shadow-xs space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                Sovereignty Guarantee
              </span>
              <h4 className="text-sm font-bold">Government Data Stays Inside India</h4>
              <p className="text-xs text-blue-100/90 leading-relaxed">
                All tender artifacts, BOQ templates, and bidder credentials are encrypted using AES-256 and hosted exclusively within sovereign, MEITY-empanelled cloud regions.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-7 sm:p-9 border border-slate-200/90 shadow-sm relative">
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">Send an Official Inquiry</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill in your requirements below and our procurement technical advisory team will get in touch immediately.
                </p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-3"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">Message Dispatched!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out. A dedicated BidBridge procurement specialist has been assigned to your ticket and will follow up shortly via email and telephone.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-[#003366] transition cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Rajesh Kumar (Officer / Bidder Name)"
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Official Email *</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="officer@bidbridge.gov.in / name@company.in"
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Department / Company Name *</label>
                      <input
                        type="text"
                        value={form.org}
                        onChange={(e) => setForm({ ...form, org: e.target.value })}
                        placeholder="e.g. Ministry of Electronics & IT / ABC Tech Pvt Ltd"
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Objective</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366]"
                    >
                      <option value="Procurement Officer Consultation">Procurement Officer Evaluation Console Access</option>
                      <option value="Bidder Technical Support">Bidder Document AI & Compliance Assistance</option>
                      <option value="Book an Enterprise Demo">National GeM / CPPP Integration Technical Query</option>
                      <option value="Partnership / Alliance">Vigilance & WORM Audit Trail Technical Briefing</option>
                      <option value="General Question">General Statutory / GFR 2017 Clarification</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Message / Tender Reference *</label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Please describe your tender requirements, tender reference ID, or any specific questions..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#003366] focus:ring-1 focus:ring-[#003366] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-70"
                  >
                    {loading ? (
                      <span>Submitting Inquiry...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Official Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
