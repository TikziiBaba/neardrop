"use client";

import React from "react";
import { ShieldCheck, KeyRound, Fingerprint, FileCheck2, Hourglass, Lock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

const spring = { type: "spring" as const, bounce: 0.15, duration: 0.65 };

export const SecuritySection: React.FC = () => {
  const { t } = useLanguage();

  const securityPillars = [
    {
      icon: KeyRound,
      title: t.security.rlsTitle,
      desc: t.security.rlsDesc,
      color: "text-[#0071e3]",
      bg: "bg-[#0071e3]/6",
    },
    {
      icon: FileCheck2,
      title: t.security.signedUrlTitle,
      desc: t.security.signedUrlDesc,
      color: "text-[#34c759]",
      bg: "bg-[#34c759]/6",
    },
    {
      icon: Fingerprint,
      title: t.security.highEntropyTitle,
      desc: t.security.highEntropyDesc,
      color: "text-[#5856d6]",
      bg: "bg-[#5856d6]/6",
    },
    {
      icon: Lock,
      title: t.security.zeroKnowledgeTitle,
      desc: t.security.zeroKnowledgeDesc,
      color: "text-[#ff9500]",
      bg: "bg-[#ff9500]/6",
    },
    {
      icon: Hourglass,
      title: t.security.lifespanTitle,
      desc: t.security.lifespanDesc,
      color: "text-[#32ade6]",
      bg: "bg-[#32ade6]/6",
    },
    {
      icon: ShieldCheck,
      title: t.security.egressTitle,
      desc: t.security.egressDesc,
      color: "text-[#ff3b30]",
      bg: "bg-[#ff3b30]/6",
    },
  ];

  return (
    <section id="security" className="landing-divider py-20 md:py-28 relative overflow-hidden select-none">
      <div className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title={t.security.title}
          subtitle={t.security.subtitle}
          align="center"
        />

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {securityPillars.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ ...spring, delay: index * 0.06 }}
                className="group landing-card rounded-3xl p-6 space-y-3 cursor-pointer"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#09090b] tracking-tight">{item.title}</h3>
                <p className="text-[13px] text-[#27272a] font-normal leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Technical Architecture Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ ...spring, delay: 0.15 }}
          className="mt-12 landing-card rounded-3xl p-6 sm:p-8 bg-white/90 border border-[#e4e4e7] backdrop-blur-xl shadow-md"
        >
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#09090b] mb-5">
            {t.security.archTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            {[
              { title: t.security.arch1Title, desc: t.security.arch1Desc, color: "text-[#0071e3]", borderHover: "hover:border-[#0071e3] hover:shadow-blue-500/10" },
              { title: t.security.arch2Title, desc: t.security.arch2Desc, color: "text-[#5856d6]", borderHover: "hover:border-[#5856d6] hover:shadow-indigo-500/10" },
              { title: t.security.arch3Title, desc: t.security.arch3Desc, color: "text-[#16a34a]", borderHover: "hover:border-[#16a34a] hover:shadow-green-500/10" },
            ].map((arch, i) => (
              <motion.div
                key={arch.title}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ ...spring, delay: 0.15 + i * 0.1 }}
                className={`p-5 rounded-2xl bg-white border border-[#e4e4e7] space-y-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${arch.borderHover}`}
              >
                <span className={`${arch.color} font-bold text-sm font-mono`}>{arch.title}</span>
                <p className="text-[#27272a] text-[13px] font-normal leading-relaxed">{arch.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
