"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropZone } from "@/components/upload/DropZone";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-20 select-none">
      <div className="relative mx-auto max-w-[980px] px-4 sm:px-6 lg:px-8">
        {/* Centered hero — Apple product-page style */}
        <div className="text-center">
          {/* Hero headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#09090b] mx-auto max-w-3xl leading-[1.08]"
          >
            {t.hero.titleLine1}{" "}
            <span className="text-[#0071e3]">{t.hero.titleLine2}</span>
          </motion.h1>

          {/* Subheadline — crisp, high-contrast slate */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-base sm:text-lg text-[#27272a] font-normal mt-5 mx-auto max-w-xl leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* CTAs — dynamic tactile hover */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-7"
          >
            <Link href={user ? "/dashboard" : "/register"}>
              <Button size="lg" variant="primary" className="gap-2 rounded-full px-8 py-3.5 shadow-lg shadow-[#0071e3]/25 hover:shadow-2xl hover:shadow-[#0071e3]/45 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="/#how-it-works"
              className="px-5 py-3 rounded-full text-[#0071e3] hover:text-[#005bb5] hover:bg-blue-50/80 border border-transparent hover:border-blue-200/80 text-base font-semibold flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
            >
              <span>{t.hero.ctaSecondary}</span>
              <span className="text-[#0071e3]">›</span>
            </Link>
          </motion.div>

          {/* Trust badges — clear contrast */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-7 text-xs text-[#27272a] font-semibold"
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#16a34a] shadow-sm" />
              {t.hero.check1}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#16a34a] shadow-sm" />
              {t.hero.check2}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#16a34a] shadow-sm" />
              {t.hero.check3}
            </span>
          </motion.div>
        </div>

        {/* Product preview — elevated macOS-style window with tactile hover */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="mt-12 mx-auto max-w-3xl"
        >
          <div className="landing-card rounded-3xl overflow-hidden border border-black/10 bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl">
            {/* macOS title bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#e4e4e7] bg-[#f8fafd]">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-[12px] text-[#27272a] font-mono font-medium">
                  {t.hero.dropzoneMockUrl}
                </span>
              </div>
              <div className="w-[52px]" />
            </div>
            {/* DropZone content */}
            <div className="p-6 bg-transparent">
              <DropZone onUploadStarted={() => router.push(user ? "/dashboard" : "/register")} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
