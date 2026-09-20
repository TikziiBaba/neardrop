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

const spring = { type: "spring" as const, bounce: 0.15, duration: 0.65 };

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
        <SectionHeader
          title={t.features.title}
          subtitle={t.features.subtitle}
        />

        {/* Apple Bento Grid — Light */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: Blazing Fast (Wide 2-column Hero) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ ...spring }}
            className="group md:col-span-2 landing-card rounded-3xl p-8 space-y-6 relative overflow-hidden cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3] group-hover:scale-110 transition-transform duration-300">
                  <Rocket className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#09090b] tracking-tight">{t.features.blazingFastTitle}</h3>
                  <span className="text-[12px] text-[#0071e3] font-semibold">Peer-to-Peer & High Speed Direct Upload</span>
                </div>
              </div>
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#0071e3]/10 text-[11px] font-semibold text-[#0071e3] w-fit shadow-sm">
                450+ Mbps Local
              </span>
            </div>

            <p className="text-[14px] text-[#27272a] font-normal leading-relaxed max-w-xl">
              {t.features.blazingFastDesc}
            </p>

            {/* Interactive Stream Visualization */}
            <div className="rounded-2xl border border-[#e4e4e7] bg-white/90 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                {/* Device 1 */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="h-11 w-11 rounded-2xl bg-white border border-[#d4d4d8] flex items-center justify-center shadow-sm group-hover:border-[#0071e3]/50 transition-colors">
                    <Laptop className="h-5 w-5 text-[#0071e3]" />
                  </div>
                  <span className="text-[11px] text-[#27272a] font-medium">MacBook Pro</span>
                </div>

                {/* Animated Data Stream */}
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#0071e3] font-semibold">
                    <Zap className="h-3.5 w-3.5 animate-gentle-pulse" />
                    <span>Direct Presigned Stream</span>
                  </div>
                  <div className="relative w-full h-2.5 bg-[#e4e4e7] rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#0071e3] to-transparent rounded-full shadow-sm"
                      animate={{ x: ["-100%", "400%"] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                    />
                  </div>
                  <span className="text-[11px] text-[#3f3f46] font-medium">Zero Server Storage Throttling</span>
                </div>

                {/* Device 2 */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <div className="h-11 w-11 rounded-2xl bg-white border border-[#d4d4d8] flex items-center justify-center shadow-sm group-hover:border-green-500/50 transition-colors">
                    <Smartphone className="h-5 w-5 text-[#16a34a]" />
                  </div>
                  <span className="text-[11px] text-[#27272a] font-medium">iPhone 16</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 2: High Entropy Token */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ ...spring, delay: 0.1 }}
            className="group landing-card rounded-3xl p-7 space-y-5 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#16a34a]/10 text-[#16a34a] group-hover:scale-110 transition-transform duration-300">
                  <KeyRound className="h-6 w-6" />
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#16a34a]/10 text-[11px] font-semibold text-[#16a34a] shadow-sm">
                  128-bit Entropy
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#09090b] tracking-tight">{t.features.cryptoTokenTitle}</h3>
                <p className="text-[13px] text-[#27272a] leading-relaxed">{t.features.cryptoTokenDesc}</p>
              </div>
            </div>

            {/* Token Live Box */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-[#e4e4e7] flex items-center justify-between text-xs font-mono text-[#16a34a] font-semibold shadow-sm">
              <span className="truncate">s_9fA7bE4kL0q</span>
              <button
                onClick={handleCopyMockToken}
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-[#27272a] hover:text-[#0071e3] transition-colors cursor-pointer"
                title="Copy token"
              >
                {copiedToken ? <Check className="h-3.5 w-3.5 text-[#16a34a]" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </motion.div>

          {/* Bento Card 3: Auto-Expiry */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ ...spring, delay: 0.15 }}
            className="group landing-card rounded-3xl p-7 space-y-5 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0071e3]/10 text-[#0071e3] group-hover:scale-110 transition-transform duration-300">
                  <Hourglass className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-semibold text-[#0071e3] bg-[#0071e3]/10 px-3 py-1 rounded-full shadow-sm">Auto-Purge</span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#09090b] tracking-tight">{t.features.autoExpiryTitle}</h3>
                <p className="text-[13px] text-[#27272a] leading-relaxed">{t.features.autoExpiryDesc}</p>
              </div>
            </div>

            {/* Countdown */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-[#e4e4e7] flex items-center justify-between shadow-sm">
              <span className="text-xs text-[#27272a] font-semibold">Link Lifespan:</span>
              <span className="text-xs font-mono font-bold text-[#0071e3] bg-[#0071e3]/10 px-3 py-1 rounded-lg">
                {formatTimer(timerSeconds)}
              </span>
            </div>
          </motion.div>

          {/* Bento Card 4: SHA-256 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ ...spring, delay: 0.2 }}
            className="group landing-card rounded-3xl p-7 space-y-5 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5856d6]/10 text-[#5856d6] group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#5856d6]/10 text-[11px] font-semibold text-[#5856d6] shadow-sm">
                  Zero-Knowledge
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#09090b] tracking-tight">{t.features.sha256Title}</h3>
                <p className="text-[13px] text-[#27272a] leading-relaxed">{t.features.sha256Desc}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 border border-[#e4e4e7] text-[11px] font-mono text-[#27272a] font-medium flex items-center gap-2 shadow-sm">
              <Lock className="h-3.5 w-3.5 text-[#16a34a] flex-shrink-0" />
              <span className="truncate">hash: 9a7f8b2c4e1d0...</span>
            </div>
          </motion.div>

          {/* Bento Card 5: Global Cloud */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ ...spring, delay: 0.25 }}
            className="group landing-card rounded-3xl p-7 space-y-5 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0284c7]/10 text-[#0284c7] group-hover:scale-110 transition-transform duration-300">
                  <CloudLightning className="h-6 w-6" />
                </div>
                <span className="text-[11px] font-semibold text-[#0284c7] bg-[#0284c7]/10 px-3 py-1 rounded-full shadow-sm">
                  {t.features.globalEdgeBadge || "Global Edge"}
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-[#09090b] tracking-tight">{t.features.r2StorageTitle}</h3>
                <p className="text-[13px] text-[#27272a] leading-relaxed">{t.features.r2StorageDesc}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/90 border border-[#e4e4e7] flex items-center justify-between text-xs text-[#27272a] shadow-sm font-medium">
              <span className="flex items-center gap-1.5 text-[#16a34a] font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-gentle-pulse" />
                <span>{t.features.unlimitedBandwidth || "Sınırsız Bant Genişliği"}</span>
              </span>
              <span className="text-[11px] text-[#3f3f46]">{t.features.highDurability || "Yüksek Dayanıklılık & Güven"}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
