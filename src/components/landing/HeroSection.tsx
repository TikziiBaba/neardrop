"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Zap, Lock, HardDrive, CheckCircle2 } from "lucide-react";
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
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="pointer-events-none absolute inset-0 mesh-grid opacity-30 dark:opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3.5 py-1 text-xs font-medium text-sky-400 backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              <span>{t.hero.badge}</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              {t.hero.titleLine1} <br />
              <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {t.hero.titleLine2}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              {t.hero.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2"
            >
              <Link href={user ? "/dashboard" : "/register"}>
                <Button variant="primary" size="lg" className="gap-2 shadow-xl shadow-sky-500/20 hover:scale-[1.02] transition-transform">
                  <span>{t.hero.ctaPrimary}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="outline" size="lg" className="hover:bg-zinc-800/80">
                  {t.hero.ctaSecondary}
                </Button>
              </Link>
            </motion.div>

            {/* Feature checklist */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-medium text-zinc-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-sky-400" />
                <span>{t.hero.check1}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{t.hero.check2}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                <span>{t.hero.check3}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Live Interactive Dropzone */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-zinc-800/50">
              <div className="flex items-center justify-between border-b border-zinc-800/80 px-2 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-zinc-500">{t.hero.dropzoneMockUrl}</span>
              </div>

              <DropZone onUploadStarted={() => router.push(user ? "/dashboard" : "/register")} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
