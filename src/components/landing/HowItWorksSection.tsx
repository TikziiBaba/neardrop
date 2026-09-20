"use client";

import React from "react";
import { FolderUp, QrCode, Send, UploadCloud, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

const spring = { type: "spring" as const, bounce: 0.15, duration: 0.65 };

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
        <div className="h-28 w-full rounded-2xl bg-white/90 border border-[#e4e4e7] p-3.5 flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#27272a] font-medium">
            <span className="text-[#0071e3] font-bold">Drop Any File or Folder</span>
            <span>•</span>
            <span>Up to 5 GB</span>
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
        <div className="h-28 w-full rounded-2xl bg-white/90 border border-[#e4e4e7] p-3.5 flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-sm">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-[#d4d4d8] text-[11px] font-semibold text-[#0071e3] flex items-center gap-2 shadow-sm">
            <LinkIcon className="h-3 w-3" />
            <span>neardrop.bekirr.dev/s/9fA7bE4k</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#16a34a] font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
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
        <div className="h-28 w-full rounded-2xl bg-white/90 border border-[#e4e4e7] p-3.5 flex flex-col items-center justify-center gap-2 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#16a34a]/10 flex items-center justify-center text-[#16a34a]">
              <Send className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="text-xs font-bold text-[#09090b] block">Direct Stream</span>
              <span className="text-[11px] text-[#0071e3] font-semibold">450+ Mbps Speed</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="landing-divider py-20 md:py-28 relative overflow-hidden select-none">
      <div className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.howItWorks.title}
          subtitle={t.howItWorks.subtitle}
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ ...spring, delay: index * 0.1 }}
                className="group landing-card rounded-3xl p-7 space-y-6 flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <span className="text-[42px] font-bold text-[#0071e3]/20 tabular-nums leading-none">{step.num}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0071e3]/8 text-[#0071e3] group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#09090b] tracking-tight">{step.title}</h3>
                    <p className="text-[14px] text-[#27272a] font-normal leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Step Visual Preview */}
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
