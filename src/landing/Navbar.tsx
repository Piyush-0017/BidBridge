"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiChevronDown, FiLock } from 'react-icons/fi';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Solution', href: '#solutions' },
    { name: 'Features', href: '#features' },
    { name: 'Blogs', href: '#blog' },
    { name: 'Partner Program', href: '#partner' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#002244]/95 backdrop-blur-md shadow-sm border-b border-white/10' : 'bg-[#002244]'
      }`}
    >
      <div className="container mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[68px]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-[#002244] font-black text-base shadow-sm group-hover:bg-amber-400 transition-colors">
              B
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-white tracking-tight leading-tight">Bid<span className="text-amber-400">Bridge</span></span>
              <span className="text-[9px] font-bold text-blue-200 uppercase tracking-widest leading-none">Central e-Procurement Portal</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <a key={l.name} href={l.href} className="text-[13px] font-medium text-white/80 hover:text-white transition-colors">
                {l.name}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setLoginOpen(!loginOpen)}
                className="flex items-center gap-1 text-[13px] font-medium text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                Login
                <motion.span animate={{ rotate: loginOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FiChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </button>
              <AnimatePresence>
                {loginOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50"
                  >
                    <Link
                      href="/login"
                      onClick={() => setLoginOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <FiLock className="w-4 h-4 text-[#0b5cad]" />
                      <div>
                        <p className="font-semibold text-slate-800">Official Portal Login</p>
                        <p className="text-[11px] text-slate-400">Officer Console & Bidder Portal</p>
                      </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/signup">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block bg-amber-500 text-slate-900 text-[13px] font-bold px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors shadow-sm"
              >
                Enter Portals
              </motion.span>
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-white text-xl p-1">
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden border-t border-white/10"
            >
              <div className="py-4 space-y-1">
                {navLinks.map((l) => (
                  <a key={l.name} href={l.href} onClick={() => setIsOpen(false)} className="block text-sm text-white/80 py-2.5">
                    {l.name}
                  </a>
                ))}
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <Link href="/login" onClick={() => setIsOpen(false)} className="block text-sm text-white/80 py-2">
                    Official Portal Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block bg-amber-500 text-slate-900 text-sm font-bold text-center py-2.5 rounded-lg mt-2"
                  >
                    Enter Portals
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
