"use client";

import React from "react";
import { UploadCloud, Link as LinkIcon, Share2, ArrowRight } from "lucide-react";
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
      icon: UploadCloud,
      badge: t.howItWorks.step1Badge,
    },
    {
      num: t.howItWorks.step2Num,
      title: t.howItWorks.step2Title,
      description: t.howItWorks.step2Desc,
      icon: LinkIcon,
      badge: t.howItWorks.step2Badge,
    },
    {
      num: t.howItWorks.step3Num,
      title: t.howItWorks.step3Title,
      description: t.howItWorks.step3Desc,
      icon: Share2,
      badge: t.howItWorks.step3Badge,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 border-t border-zinc-800/80 bg-zinc-950/40 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={t.howItWorks.sectionLabel}
          title={t.howItWorks.title}
          subtitle={t.howItWorks.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.12, duration: 0.5, ease: "easeOut" }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="relative rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 space-y-6 hover:border-zinc-700 hover:shadow-xl hover:shadow-sky-500/5 transition-colors duration-200"
              >
                {/* Header: Number and Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-extrabold text-zinc-700/60 font-mono">
                    {step.num}
                  </span>
                  <span className="rounded-lg bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-400 border border-sky-500/20">
                    {step.badge}
                  </span>
                </div>

                {/* Icon Box */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700 text-sky-400 shadow-md shadow-sky-500/10">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">{step.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
