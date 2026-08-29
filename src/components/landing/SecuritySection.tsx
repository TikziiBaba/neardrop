"use client";

import React from "react";
import { ShieldCheck, KeyRound, Fingerprint, FileCheck2, Hourglass, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const SecuritySection: React.FC = () => {
  const { t } = useLanguage();

  const securityPillars = [
    {
      icon: KeyRound,
      title: t.security.rlsTitle,
      desc: t.security.rlsDesc,
    },
    {
      icon: FileCheck2,
      title: t.security.signedUrlTitle,
      desc: t.security.signedUrlDesc,
    },
    {
      icon: Fingerprint,
      title: t.security.highEntropyTitle,
      desc: t.security.highEntropyDesc,
    },
    {
      icon: Lock,
      title: t.security.zeroKnowledgeTitle,
      desc: t.security.zeroKnowledgeDesc,
    },
    {
      icon: Hourglass,
      title: t.security.lifespanTitle,
      desc: t.security.lifespanDesc,
    },
    {
      icon: ShieldCheck,
      title: t.security.egressTitle,
      desc: t.security.egressDesc,
    },
  ];

  return (
    <section id="security" className="py-20 md:py-32 border-t border-zinc-800/80 bg-zinc-950/60 relative overflow-hidden select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={t.security.badge}
          title={t.security.title}
          subtitle={t.security.subtitle}
          icon={ShieldCheck}
        />

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPillars.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-7 space-y-3 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all duration-200"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-white tracking-tight">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-normal">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Technical Architecture Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 rounded-3xl border border-zinc-800/90 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl ring-1 ring-white/[0.04]"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-400 mb-4">
            {t.security.archTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition-colors">
              <span className="text-sky-400 font-bold">{t.security.arch1Title}</span>
              <p className="text-zinc-400 text-xs font-sans leading-relaxed">
                {t.security.arch1Desc}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition-colors">
              <span className="text-blue-400 font-bold">{t.security.arch2Title}</span>
              <p className="text-zinc-400 text-xs font-sans leading-relaxed">
                {t.security.arch2Desc}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition-colors">
              <span className="text-indigo-400 font-bold">{t.security.arch3Title}</span>
              <p className="text-zinc-400 text-xs font-sans leading-relaxed">
                {t.security.arch3Desc}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
