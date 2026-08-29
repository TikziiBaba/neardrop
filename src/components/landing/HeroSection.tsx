"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, Shield, Zap, Lock, HardDrive } from "lucide-react";
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
    <section className="relative overflow-hidden pt-16 pb-24 md:pt-28 md:pb-36 select-none">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="pointer-events-none absolute inset-0 mesh-grid opacity-30 dark:opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Copy & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Apple-style Pill Badge with Live Pulse */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-4 py-1 text-xs font-semibold text-sky-400 backdrop-blur-md shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
              </span>
              <span>{t.hero.badge}</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.06]"
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
              transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
            >
              {t.hero.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2"
            >
              <Link href={user ? "/dashboard" : "/register"}>
                <Button variant="primary" size="lg" className="gap-2 shadow-lg shadow-sky-500/25 hover:scale-[1.02] transition-transform">
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

          {/* Right Column: Live Interactive macOS Window Frame with Ambient Floaters */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            {/* Ambient Floating Mini Badge (Top Right) */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="hidden sm:flex absolute -top-5 -right-5 z-20 items-center gap-2 rounded-2xl border border-sky-500/30 bg-zinc-900/90 px-3.5 py-2 shadow-xl backdrop-blur-xl ring-1 ring-white/10"
            >
              <Zap className="h-4 w-4 text-sky-400" />
              <div className="text-left">
                <span className="text-[11px] font-bold text-white block">450+ Mbps</span>
                <span className="text-[9px] text-zinc-400">Direct LAN & Cloud</span>
              </div>
            </motion.div>

            {/* Ambient Floating Mini Badge (Bottom Left) */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
              className="hidden sm:flex absolute -bottom-5 -left-5 z-20 items-center gap-2 rounded-2xl border border-emerald-500/30 bg-zinc-900/90 px-3.5 py-2 shadow-xl backdrop-blur-xl ring-1 ring-white/10"
            >
              <Shield className="h-4 w-4 text-emerald-400" />
              <div className="text-left">
                <span className="text-[11px] font-bold text-white block">SHA-256 Verified</span>
                <span className="text-[9px] text-zinc-400">Zero-Knowledge Token</span>
              </div>
            </motion.div>

            {/* Main Window */}
            <div className="relative rounded-3xl border border-zinc-800/90 bg-zinc-900/80 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/[0.08]">
              {/* macOS Window Titlebar with authentic traffic lights */}
              <div className="flex items-center justify-between border-b border-zinc-800/80 px-2 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 shadow-inner" />
                  <div className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 shadow-inner" />
                  <div className="h-3 w-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 shadow-inner" />
                </div>
                <div className="px-3 py-1 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-[11px] font-mono text-zinc-400">
                  {t.hero.dropzoneMockUrl}
                </div>
                <div className="w-10" />
              </div>

              <DropZone onUploadStarted={() => router.push(user ? "/dashboard" : "/register")} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
