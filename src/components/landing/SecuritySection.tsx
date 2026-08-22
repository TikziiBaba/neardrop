"use client";

import React from "react";
import { Shield, KeyRound, Database, FileLock, RefreshCw, EyeOff } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";

export const SecuritySection: React.FC = () => {
  const { t } = useLanguage();

  const securityPillars = [
    {
      icon: KeyRound,
      title: t.security.rlsTitle,
      desc: t.security.rlsDesc,
    },
    {
      icon: FileLock,
      title: t.security.signedUrlTitle,
      desc: t.security.signedUrlDesc,
    },
    {
      icon: EyeOff,
      title: t.security.highEntropyTitle,
      desc: t.security.highEntropyDesc,
    },
    {
      icon: Database,
      title: t.security.zeroKnowledgeTitle,
      desc: t.security.zeroKnowledgeDesc,
    },
    {
      icon: RefreshCw,
      title: t.security.lifespanTitle,
      desc: t.security.lifespanDesc,
    },
    {
      icon: Shield,
      title: t.security.egressTitle,
      desc: t.security.egressDesc,
    },
  ];

  return (
    <section id="security" className="py-20 md:py-28 border-t border-zinc-800/80 bg-zinc-950/60 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto space-y-4 mb-16"
        >
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <Shield className="h-3.5 w-3.5" />
            <span>{t.security.badge}</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {t.security.title}
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.security.subtitle}
          </p>
        </motion.div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPillars.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.08, duration: 0.45, ease: "easeOut" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-3 hover:border-zinc-700 hover:bg-zinc-900/70 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-emerald-400 border border-zinc-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Technical Architecture Flow */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mt-12 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-4">
            {t.security.archTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 hover:border-zinc-700 transition-colors">
              <span className="text-sky-400 font-bold">{t.security.arch1Title}</span>
              <p className="text-zinc-400 text-[11px] font-sans">
                {t.security.arch1Desc}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 hover:border-zinc-700 transition-colors">
              <span className="text-blue-400 font-bold">{t.security.arch2Title}</span>
              <p className="text-zinc-400 text-[11px] font-sans">
                {t.security.arch2Desc}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 hover:border-zinc-700 transition-colors">
              <span className="text-indigo-400 font-bold">{t.security.arch3Title}</span>
              <p className="text-zinc-400 text-[11px] font-sans">
                {t.security.arch3Desc}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
