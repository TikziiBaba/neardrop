import React from "react";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { ProductPreviewSection } from "@/components/landing/ProductPreviewSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { Footer } from "@/components/layout/Footer";
import { LandingAmbient } from "@/components/landing/LandingAmbient";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <LandingAmbient />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <SecuritySection />
      <ProductPreviewSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
