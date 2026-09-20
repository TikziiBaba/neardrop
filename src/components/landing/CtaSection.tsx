"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";

const spring = { type: "spring" as const, bounce: 0.15, duration: 0.65 };

export const CtaSection: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <section className="landing-divider py-20 md:py-28 relative overflow-hidden text-center select-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={spring}
        className="relative mx-auto max-w-[680px] px-4 sm:px-6 lg:px-8"
      >
        <div className="space-y-6">
          <h2 className="apple-headline-section">
            {t.cta.title}
          </h2>

          <p className="apple-subhead mx-auto max-w-lg">
            {t.cta.subtitle}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href={user ? "/dashboard" : "/register"}>
              <Button variant="primary" size="lg" className="gap-2 rounded-full px-8 py-3.5 shadow-lg shadow-[#0071e3]/25 hover:shadow-2xl hover:shadow-[#0071e3]/45 hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 font-bold">
                <span>{t.cta.ctaPrimary}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={user ? "/dashboard" : "/login"}>
              <span className="px-5 py-3 rounded-full text-[#0071e3] hover:text-[#005bb5] hover:bg-blue-50/80 border border-transparent hover:border-blue-200/80 text-base font-semibold cursor-pointer flex items-center gap-1.5 transition-all hover:-translate-y-0.5 hover:shadow-sm">
                {t.cta.ctaSecondary}
                <span>›</span>
              </span>
            </Link>
          </div>

          <div className="pt-3 flex items-center justify-center gap-2 text-[13px] text-[#27272a] font-semibold">
            <ShieldCheck className="h-4 w-4 text-[#16a34a]" />
            <span>{t.cta.trust}</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
