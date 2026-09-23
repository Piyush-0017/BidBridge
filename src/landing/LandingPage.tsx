"use client";

import Navbar from './Navbar';
import HeroSection from './HeroSection';
import SolutionsSection from './SolutionsSection';
import FeaturesSection from './FeaturesSection';
import AdvantagesSection from './AdvantagesSection';
import AboutSection from './AboutSection';
import PartnerSection from './PartnerSection';
import BlogSection from './BlogSection';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import ContactSection from './ContactSection';
import CTASection from './CTASection';
import Footer from './Footer';

/**
 * Full BidBridge-style marketing front panel.
 * Used as the public home page of the BidBridge application.
 * Auth (Login / Book Demo) routes into the existing BidBridge app features.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#E8EDF2] bg-fixed text-slate-800 selection:bg-blue-500/25 selection:text-slate-900 font-sans">
      <Navbar />
      <main>
        <HeroSection />
        <SolutionsSection />
        <FeaturesSection />
        <AdvantagesSection />
        <AboutSection />
        <PartnerSection />
        <BlogSection />
        <TestimonialsSection />
        <FAQSection />
        <ContactSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
