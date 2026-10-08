import React from "react";
import { HomeHero } from "@/components/home/HomeHero";
import { Compare, Faq, Features, FinalCta, HowItWorks, Security, Studio } from "@/components/home/HomeSections";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden text-foreground antialiased">
      <HomeHero />
      <HowItWorks />
      <Features />
      <Studio />
      <Compare />
      <Security />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
