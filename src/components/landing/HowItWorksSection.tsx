"use client";

import React from "react";
import { FolderUp, QrCode, Send, UploadCloud, Link as LinkIcon, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

const spring = { type: "spring" as const, bounce: 0.12, duration: 0.6 };

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
        <div className="h-28 w-full rounded-xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] p-4 flex flex-col items-center justify-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-[var(--apple-blue-light)] flex items-center justify-center text-[var(--apple-blue)]">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--apple-text-secondary)] font-medium">
            <span className="text-[var(--apple-blue)] font-semibold">Drop Any File</span>
            <span className="text-[var(--apple-text-quaternary)]">•</span>
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
        <div className="h-28 w-full rounded-xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] p-4 flex flex-col items-center justify-center gap-2.5">
          <div className="px-3 py-1.5 rounded-lg bg-white border border-[var(--apple-separator)] text-[11px] font-medium text-[var(--apple-blue)] flex items-center gap-2">
            <LinkIcon className="h-3 w-3" />
            <span>neardrop.bekirr.dev/s/9fA7bE4k</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--apple-green)] font-medium">
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
        <div className="h-28 w-full rounded-xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] p-4 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[rgba(52,199,89,0.08)] flex items-center justify-center text-[var(--apple-green)]">
              <Send className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="text-xs font-semibold text-[var(--apple-text-primary)] block">Direct Stream</span>
              <span className="text-[11px] text-[var(--apple-blue)] font-medium">450+ Mbps</span>
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

        {/* Step connector line (desktop) */}
        <div className="hidden md:block relative">
          <div className="absolute top-16 left-[16.7%] right-[16.7%] h-[1px] bg-gradient-to-r from-transparent via-[var(--apple-separator)] to-transparent" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ ...spring, delay: index * 0.08 }}
                className="landing-card p-7 space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Step number + icon */}
                  <div className="flex items-center gap-4">
                    <span className="text-[40px] font-bold text-[var(--apple-blue)] opacity-15 tabular-nums leading-none select-none">
                      {step.num}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--apple-blue-light)] text-[var(--apple-blue)]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[var(--apple-text-primary)] tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-[14px] text-[var(--apple-text-secondary)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Visual */}
                <div>{step.visual}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
