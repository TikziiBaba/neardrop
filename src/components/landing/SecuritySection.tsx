"use client";

import React from "react";
import { ShieldCheck, KeyRound, Fingerprint, FileCheck2, Hourglass, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

const spring = { type: "spring" as const, bounce: 0.12, duration: 0.6 };

export const SecuritySection: React.FC = () => {
  const { t } = useLanguage();

  const securityPillars = [
    {
      icon: KeyRound,
      title: t.security.rlsTitle,
      desc: t.security.rlsDesc,
      color: "text-[var(--apple-blue)]",
      bg: "bg-[var(--apple-blue-light)]",
    },
    {
      icon: FileCheck2,
      title: t.security.signedUrlTitle,
      desc: t.security.signedUrlDesc,
      color: "text-[var(--apple-green)]",
      bg: "bg-[rgba(52,199,89,0.08)]",
    },
    {
      icon: Fingerprint,
      title: t.security.highEntropyTitle,
      desc: t.security.highEntropyDesc,
      color: "text-[var(--apple-indigo)]",
      bg: "bg-[rgba(88,86,214,0.08)]",
    },
    {
      icon: Lock,
      title: t.security.zeroKnowledgeTitle,
      desc: t.security.zeroKnowledgeDesc,
      color: "text-[var(--apple-orange)]",
      bg: "bg-[rgba(255,149,0,0.08)]",
    },
    {
      icon: Hourglass,
      title: t.security.lifespanTitle,
      desc: t.security.lifespanDesc,
      color: "text-[var(--apple-teal)]",
      bg: "bg-[rgba(90,200,250,0.08)]",
    },
    {
      icon: ShieldCheck,
      title: t.security.egressTitle,
      desc: t.security.egressDesc,
      color: "text-[var(--apple-red)]",
      bg: "bg-[rgba(255,59,48,0.08)]",
    },
  ];

  return (
    <section id="security" className="landing-divider py-20 md:py-28 relative overflow-hidden select-none">
      <div className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-8">
        <SectionHeader title={t.security.title} subtitle={t.security.subtitle} align="center" />

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {securityPillars.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ ...spring, delay: index * 0.05 }}
                className="landing-card p-6 space-y-3"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-[var(--apple-text-primary)] tracking-tight">
                  {item.title}
                </h3>
                <p className="text-[13px] text-[var(--apple-text-secondary)] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Technical Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ ...spring, delay: 0.1 }}
          className="mt-10 landing-card p-6 sm:p-8"
        >
          <h3 className="apple-caption mb-5">{t.security.archTitle}</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {/* Connector lines (desktop) */}
            <div className="hidden md:block absolute top-1/2 left-[33.3%] w-[1px] h-12 -translate-y-1/2 bg-gradient-to-b from-transparent via-[var(--apple-separator)] to-transparent" />
            <div className="hidden md:block absolute top-1/2 left-[66.6%] w-[1px] h-12 -translate-y-1/2 bg-gradient-to-b from-transparent via-[var(--apple-separator)] to-transparent" />

            {[
              {
                title: t.security.arch1Title,
                desc: t.security.arch1Desc,
                color: "text-[var(--apple-blue)]",
                borderHover: "hover:border-[var(--apple-blue)]",
              },
              {
                title: t.security.arch2Title,
                desc: t.security.arch2Desc,
                color: "text-[var(--apple-indigo)]",
                borderHover: "hover:border-[var(--apple-indigo)]",
              },
              {
                title: t.security.arch3Title,
                desc: t.security.arch3Desc,
                color: "text-[var(--apple-green)]",
                borderHover: "hover:border-[var(--apple-green)]",
              },
            ].map((arch, i) => (
              <motion.div
                key={arch.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: 0.12 + i * 0.08 }}
                className={`p-5 rounded-xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${arch.borderHover}`}
              >
                <span className={`${arch.color} font-semibold text-sm font-mono`}>{arch.title}</span>
                <p className="text-[var(--apple-text-secondary)] text-[13px] leading-relaxed">{arch.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
