import React from "react";
import { AppleSubNav } from "@/components/landing/AppleSubNav";
import { AppleHero } from "@/components/landing/AppleHero";
import { AppleHighlights } from "@/components/landing/AppleHighlights";
import { AppleAirDropSection } from "@/components/landing/AppleAirDropSection";
import { AppleSecuritySection } from "@/components/landing/AppleSecuritySection";
import { AppleSpecsSection } from "@/components/landing/AppleSpecsSection";
import { AppleDropStudio } from "@/components/landing/AppleDropStudio";
import { AppleFaqSection } from "@/components/landing/AppleFaqSection";
import { AppleCtaSection } from "@/components/landing/AppleCtaSection";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-black text-white antialiased overflow-x-hidden">
      <AppleSubNav />
      <AppleHero />
      <AppleHighlights />
      <AppleAirDropSection />
      <AppleSecuritySection />
      <AppleSpecsSection />
      <AppleDropStudio />
      <AppleFaqSection />
      <AppleCtaSection />
      <Footer />
    </main>
  );
}
