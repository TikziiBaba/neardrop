"use client";

import React from "react";
import { FolderUp, QrCode, Send, Compass } from "lucide-react";
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
    },
    {
      num: t.howItWorks.step2Num,
      title: t.howItWorks.step2Title,
      description: t.howItWorks.step2Desc,
      icon: QrCode,
      badge: t.howItWorks.step2Badge,
    },
    {
      num: t.howItWorks.step3Num,
      title: t.howItWorks.step3Title,
      description: t.howItWorks.step3Desc,
      icon: Send,
      badge: t.howItWorks.step3Badge,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 border-t border-zinc-800/80 bg-zinc-950/40 relative overflow-hidden select-none">
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
                className="relative rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-8 space-y-6 hover:border-zinc-700 hover:bg-zinc-900/70 hover:shadow-xl hover:shadow-black/30 transition-all duration-200"
              >
                {/* Header: Step Number & Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-zinc-700/80 font-mono">
                    {step.num}
                  </span>
                  <span className="rounded-full bg-sky-500/10 px-3 py-0.5 text-[11px] font-semibold text-sky-400 border border-sky-500/20">
                    {step.badge}
                  </span>
                </div>

                {/* Icon Squircle Box */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/90 border border-zinc-700/80 text-sky-400 shadow-md shadow-sky-500/5">
                  <Icon className="h-5 w-5" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">{step.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
