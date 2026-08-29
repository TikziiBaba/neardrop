"use client";

import React from "react";
import {
  Rocket,
  KeyRound,
  Hourglass,
  ShieldCheck,
  CloudLightning,
  FolderHeart,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Rocket,
      title: t.features.blazingFastTitle,
      description: t.features.blazingFastDesc,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      icon: KeyRound,
      title: t.features.cryptoTokenTitle,
      description: t.features.cryptoTokenDesc,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: Hourglass,
      title: t.features.autoExpiryTitle,
      description: t.features.autoExpiryDesc,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      icon: ShieldCheck,
      title: t.features.sha256Title,
      description: t.features.sha256Desc,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      icon: CloudLightning,
      title: t.features.r2StorageTitle,
      description: t.features.r2StorageDesc,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      icon: FolderHeart,
      title: t.features.fileManagementTitle,
      description: t.features.fileManagementDesc,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 border-t border-zinc-800/80 bg-zinc-950 relative overflow-hidden select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={t.features.sectionLabel}
          title={t.features.title}
          subtitle={t.features.subtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="group rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-7 space-y-4 hover:border-zinc-700 hover:bg-zinc-900/70 hover:shadow-xl hover:shadow-black/40 transition-all duration-200"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feat.bg} ${feat.color} border ${feat.border} group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-normal">{feat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
