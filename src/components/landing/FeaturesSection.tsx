"use client";

import React from "react";
import {
  Zap,
  ShieldCheck,
  Clock,
  Lock,
  HardDrive,
  FolderKanban,
  QrCode,
  Gauge,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";

export const FeaturesSection: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Zap,
      title: t.features.blazingFastTitle,
      description: t.features.blazingFastDesc,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: ShieldCheck,
      title: t.features.cryptoTokenTitle,
      description: t.features.cryptoTokenDesc,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Clock,
      title: t.features.autoExpiryTitle,
      description: t.features.autoExpiryDesc,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      icon: Lock,
      title: t.features.sha256Title,
      description: t.features.sha256Desc,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      icon: HardDrive,
      title: t.features.r2StorageTitle,
      description: t.features.r2StorageDesc,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: FolderKanban,
      title: t.features.fileManagementTitle,
      description: t.features.fileManagementDesc,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 border-t border-zinc-800/80 bg-zinc-950 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto space-y-4 mb-16"
        >
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
            {t.features.sectionLabel}
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {t.features.title}
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.features.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-4 hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-200"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${feat.bg} ${feat.color} border border-zinc-800 group-hover:scale-105 transition-transform`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-white group-hover:text-sky-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{feat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
