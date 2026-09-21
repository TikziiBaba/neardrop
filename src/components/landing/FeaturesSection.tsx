"use client";

import React, { useState, useEffect } from "react";
import {
  Rocket,
  KeyRound,
  Hourglass,
  ShieldCheck,
  CloudLightning,
  Laptop,
  Smartphone,
  Lock,
  Zap,
  Copy,
  Check,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

const spring = { type: "spring" as const, bounce: 0.12, duration: 0.6 };

export const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();
  const [copiedToken, setCopiedToken] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(86399);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleCopyMockToken = () => {
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <section id="features" className="landing-divider py-20 md:py-28 relative overflow-hidden select-none">
      <div className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader title={t.features.title} subtitle={t.features.subtitle} />

        {/* Apple Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* ── Tile 1: Blazing Fast (Hero — 2 col) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={spring}
            className="md:col-span-2 landing-card p-8 space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--apple-blue-light)] text-[var(--apple-blue)]">
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--apple-text-primary)] tracking-tight">
                    {t.features.blazingFastTitle}
                  </h3>
                  <span className="text-[12px] text-[var(--apple-blue)] font-medium">
                    Peer-to-Peer &amp; Direct Upload
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-[var(--apple-blue-light)] text-[11px] font-semibold text-[var(--apple-blue)] w-fit">
                450+ Mbps Local
              </span>
            </div>

            <p className="text-[14px] text-[var(--apple-text-secondary)] leading-relaxed max-w-xl">
              {t.features.blazingFastDesc}
            </p>

            {/* Stream visualization */}
            <div className="rounded-xl border border-[var(--apple-separator-light)] bg-[var(--apple-bg)] p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="h-10 w-10 rounded-xl bg-white border border-[var(--apple-separator)] flex items-center justify-center">
                    <Laptop className="h-5 w-5 text-[var(--apple-blue)]" />
                  </div>
                  <span className="text-[11px] text-[var(--apple-text-secondary)] font-medium">MacBook Pro</span>
                </div>

                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--apple-blue)] font-medium">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Direct Presigned Stream</span>
                  </div>
                  <div className="relative w-full h-2 bg-[var(--apple-separator-light)] rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-[var(--apple-blue)] to-transparent rounded-full"
                      animate={{ x: ["-100%", "400%"] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    />
                  </div>
                  <span className="text-[11px] text-[var(--apple-text-tertiary)] font-medium">
                    Zero Server Throttling
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="h-10 w-10 rounded-xl bg-white border border-[var(--apple-separator)] flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-[var(--apple-green)]" />
                  </div>
                  <span className="text-[11px] text-[var(--apple-text-secondary)] font-medium">iPhone 16</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Tile 2: High Entropy Token ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ ...spring, delay: 0.06 }}
            className="landing-card p-7 space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(52,199,89,0.08)] text-[var(--apple-green)]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[rgba(52,199,89,0.08)] text-[11px] font-semibold text-[var(--apple-green)]">
                  128-bit Entropy
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-[var(--apple-text-primary)] tracking-tight">
                  {t.features.cryptoTokenTitle}
                </h3>
                <p className="text-[13px] text-[var(--apple-text-secondary)] leading-relaxed">
                  {t.features.cryptoTokenDesc}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] flex items-center justify-between text-xs font-mono text-[var(--apple-green)] font-medium">
              <span className="truncate">s_9fA7bE4kL0q</span>
              <button
                onClick={handleCopyMockToken}
                className="p-1.5 rounded-lg hover:bg-white text-[var(--apple-text-tertiary)] hover:text-[var(--apple-blue)] transition-colors cursor-pointer"
                title="Copy token"
              >
                {copiedToken ? <Check className="h-3.5 w-3.5 text-[var(--apple-green)]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </motion.div>

          {/* ── Tile 3: Auto-Expiry ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ ...spring, delay: 0.1 }}
            className="landing-card p-7 space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--apple-blue-light)] text-[var(--apple-blue)]">
                  <Hourglass className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-[var(--apple-blue)] bg-[var(--apple-blue-light)] px-3 py-1 rounded-full">
                  Auto-Purge
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-[var(--apple-text-primary)] tracking-tight">
                  {t.features.autoExpiryTitle}
                </h3>
                <p className="text-[13px] text-[var(--apple-text-secondary)] leading-relaxed">
                  {t.features.autoExpiryDesc}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] flex items-center justify-between">
              <span className="text-xs text-[var(--apple-text-secondary)] font-medium">Link Lifespan:</span>
              <span className="text-xs font-mono font-semibold text-[var(--apple-blue)] bg-[var(--apple-blue-light)] px-3 py-1 rounded-lg">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          </motion.div>

          {/* ── Tile 4: SHA-256 ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ ...spring, delay: 0.14 }}
            className="landing-card p-7 space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(88,86,214,0.08)] text-[var(--apple-indigo)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[rgba(88,86,214,0.08)] text-[11px] font-semibold text-[var(--apple-indigo)]">
                  Zero-Knowledge
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-[var(--apple-text-primary)] tracking-tight">
                  {t.features.sha256Title}
                </h3>
                <p className="text-[13px] text-[var(--apple-text-secondary)] leading-relaxed">
                  {t.features.sha256Desc}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] text-[11px] font-mono text-[var(--apple-text-secondary)] font-medium flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-[var(--apple-green)] flex-shrink-0" />
              <span className="truncate">hash: 9a7f8b2c4e1d0...</span>
            </div>
          </motion.div>

          {/* ── Tile 5: Global Cloud ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ ...spring, delay: 0.18 }}
            className="landing-card p-7 space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(90,200,250,0.08)] text-[var(--apple-teal)]">
                  <CloudLightning className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-semibold text-[var(--apple-teal)] bg-[rgba(90,200,250,0.08)] px-3 py-1 rounded-full">
                  {t.features.globalEdgeBadge || "Global Edge"}
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-[var(--apple-text-primary)] tracking-tight">
                  {t.features.r2StorageTitle}
                </h3>
                <p className="text-[13px] text-[var(--apple-text-secondary)] leading-relaxed">
                  {t.features.r2StorageDesc}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[var(--apple-green)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--apple-green)] animate-gentle-pulse" />
                <span>{t.features.unlimitedBandwidth || "Sınırsız Bant Genişliği"}</span>
              </span>
              <span className="text-[11px] text-[var(--apple-text-tertiary)]">
                {t.features.highDurability || "Yüksek Dayanıklılık"}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
