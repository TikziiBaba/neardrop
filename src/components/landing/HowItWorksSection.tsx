"use client";

import React from "react";
import { FolderUp, QrCode, Send, Compass, ArrowRight, CheckCircle2, Shield, UploadCloud, Link as LinkIcon, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const HowItWorksSection: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    {
      num: t.howItWorks.step1Num,
      title: t.howItWorks.step1Title,
      description: t.howItWorks.step1Desc,
      icon: FolderUp,
      badge: t.howItWorks.step1Badge,
      visual: (
        <div className="h-28 w-full rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-3.5 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <UploadCloud className="h-5 w-5 animate-bounce-slow" />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
            <span className="text-sky-400">Drop Any File or Folder</span>
            <span>•</span>
            <span className="text-zinc-500">Up to 5 GB</span>
          </div>
        </div>
      ),
    },
    {
      num: t.howItWorks.step2Num,
      title: t.howItWorks.step2Title,
      description: t.howItWorks.step2Desc,
      icon: QrCode,
      badge: t.howItWorks.step2Badge,
      visual: (
        <div className="h-28 w-full rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-3.5 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-[11px] font-mono text-sky-300 flex items-center gap-2">
            <LinkIcon className="h-3 w-3 text-sky-400" />
            <span>neardrop.app/s/9fA7bE4k</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Encrypted Token Generated</span>
          </div>
        </div>
      ),
    },
    {
      num: t.howItWorks.step3Num,
      title: t.howItWorks.step3Title,
      description: t.howItWorks.step3Desc,
      icon: Send,
      badge: t.howItWorks.step3Badge,
      visual: (
        <div className="h-28 w-full rounded-2xl bg-zinc-950/80 border border-zinc-800/80 p-3.5 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Send className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-white block">Direct Stream</span>
              <span className="text-[10px] font-mono text-sky-400">450+ Mbps Speed</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-36 border-t border-zinc-800/80 bg-zinc-950/40 relative overflow-hidden select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={t.howItWorks.sectionLabel}
          title={t.howItWorks.title}
          subtitle={t.howItWorks.subtitle}
          icon={Compass}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative rounded-3xl border border-zinc-800/90 bg-zinc-900/50 p-8 space-y-6 hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-2xl hover:shadow-black/40 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-5">
                  {/* Header: Step Number & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-zinc-700/90 font-mono">
                      {step.num}
                    </span>
                    <span className="rounded-full bg-sky-500/10 px-3 py-0.5 text-[11px] font-semibold text-sky-400 border border-sky-500/20">
                      {step.badge}
                    </span>
                  </div>

                  {/* Icon Squircle Box */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700/80 text-sky-400 shadow-md shadow-sky-500/5">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">{step.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">{step.description}</p>
                  </div>
                </div>

                {/* Step Visual Preview Card */}
                <div>
                  {step.visual}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
