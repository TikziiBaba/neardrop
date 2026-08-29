"use client";

import React, { useState, useEffect } from "react";
import {
  Rocket,
  KeyRound,
  Hourglass,
  ShieldCheck,
  CloudLightning,
  FolderHeart,
  Laptop,
  Smartphone,
  CheckCircle2,
  Lock,
  Zap,
  ArrowRight,
  HardDrive,
  Copy,
  Check,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/badge";

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
    <section id="features" className="py-24 md:py-36 border-t border-zinc-800/80 bg-zinc-950 relative overflow-hidden select-none">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          label={t.features.sectionLabel}
          title={t.features.title}
          subtitle={t.features.subtitle}
        />

        {/* Apple-style Interactive Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* Bento Card 1: Blazing Fast Direct Streaming (Wide 2-column or Hero Card) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-2 rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/70 to-zinc-950/90 p-7 sm:p-8 space-y-6 hover:border-zinc-700 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-md shadow-sky-500/10">
                  <Rocket className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{t.features.blazingFastTitle}</h3>
                  <span className="text-xs text-sky-400 font-medium">Peer-to-Peer & High Speed Direct Upload</span>
                </div>
              </div>
              <Badge variant="sky" className="w-fit">450+ Mbps Local</Badge>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
              {t.features.blazingFastDesc}
            </p>

            {/* Interactive Live Stream Visualization */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-5 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                {/* Device 1 */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="h-11 w-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shadow-inner">
                    <Laptop className="h-5 w-5 text-sky-400" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">MacBook Pro</span>
                </div>

                {/* Animated Data Stream Flow */}
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-sky-400 font-semibold">
                    <Zap className="h-3 w-3 animate-pulse" />
                    <span>Direct Presigned Stream</span>
                  </div>
                  <div className="relative w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <motion.div
                      className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-sky-400 to-transparent rounded-full blur-[1px]"
                      animate={{ x: ["-100%", "400%"] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500">Zero Server Storage Throttling</span>
                </div>

                {/* Device 2 */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="h-11 w-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shadow-inner">
                    <Smartphone className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">iPhone 16</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 2: High Entropy Token */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-7 space-y-5 hover:border-zinc-700 hover:bg-zinc-900/70 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <KeyRound className="h-6 w-6" />
                </div>
                <Badge variant="success">128-bit Entropy</Badge>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white tracking-tight">{t.features.cryptoTokenTitle}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{t.features.cryptoTokenDesc}</p>
              </div>
            </div>

            {/* Token Live Box */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span className="truncate">s_9fA7bE4kL0q</span>
              <button
                onClick={handleCopyMockToken}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Copy token"
              >
                {copiedToken ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </motion.div>

          {/* Bento Card 3: Auto-Expiry Live Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-7 space-y-5 hover:border-zinc-700 hover:bg-zinc-900/70 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <Hourglass className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">Auto-Purge</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white tracking-tight">{t.features.autoExpiryTitle}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{t.features.autoExpiryDesc}</p>
              </div>
            </div>

            {/* Countdown Display */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-medium">Link Lifespan:</span>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          </motion.div>

          {/* Bento Card 4: SHA-256 Client-Side Protection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-7 space-y-5 hover:border-zinc-700 hover:bg-zinc-900/70 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <Badge variant="secondary">Zero-Knowledge</Badge>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white tracking-tight">{t.features.sha256Title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{t.features.sha256Desc}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">hash: 9a7f8b2c4e1d0...</span>
            </div>
          </motion.div>

          {/* Bento Card 5: Cloudflare R2 Global Edge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-7 space-y-5 hover:border-zinc-700 hover:bg-zinc-900/70 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <CloudLightning className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">300+ Edge POPs</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white tracking-tight">{t.features.r2StorageTitle}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{t.features.r2StorageDesc}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Zero Egress Fees</span>
              </span>
              <span>100% S3 Compatible</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
