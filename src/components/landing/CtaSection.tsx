"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";

export const CtaSection: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <section className="py-24 md:py-36 border-t border-zinc-800/80 bg-zinc-950 relative overflow-hidden text-center select-none">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3.5 py-1 text-xs font-medium text-sky-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t.cta.badge}</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
          {t.cta.title}
        </h2>

        <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed font-normal">
          {t.cta.subtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          <Link href={user ? "/dashboard" : "/register"}>
            <Button variant="primary" size="lg" className="gap-2 shadow-lg shadow-sky-500/20 hover:scale-[1.02] transition-transform">
              <span>{t.cta.ctaPrimary}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={user ? "/dashboard" : "/login"}>
            <Button variant="outline" size="lg" className="hover:bg-zinc-800/80">
              {t.cta.ctaSecondary}
            </Button>
          </Link>
        </div>

        <div className="pt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>{t.cta.trust}</span>
        </div>
      </motion.div>
    </section>
  );
};
