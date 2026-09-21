"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropZone } from "@/components/upload/DropZone";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { useLanguage } from "@/lib/i18n/context";
import { motion } from "framer-motion";

const spring = { type: "spring" as const, bounce: 0.12, duration: 0.6 };

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 select-none">
      <div className="relative mx-auto max-w-[980px] px-4 sm:px-6 lg:px-8">
        {/* Centered Hero — Apple product page */}
        <div className="text-center">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring }}
            className="apple-headline-hero mx-auto max-w-[14ch]"
          >
            {t.hero.titleLine1}{" "}
            <span className="text-[var(--apple-blue)]">{t.hero.titleLine2}</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.08 }}
            className="apple-subhead mt-6 mx-auto max-w-lg"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.14 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
          >
            <Link href={user ? "/dashboard" : "/register"}>
              <Button
                size="lg"
                variant="primary"
                className="gap-2 rounded-full px-8 py-3.5 shadow-sm shadow-blue-500/15 hover:shadow-md hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
              >
                <span>{t.hero.ctaPrimary}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              href="/#how-it-works"
              className="px-5 py-3 rounded-full text-[var(--apple-blue)] hover:text-[var(--apple-blue-hover)] hover:bg-[var(--apple-blue-light)] text-base font-medium flex items-center gap-1.5 transition-all duration-200"
            >
              <span>{t.hero.ctaSecondary}</span>
              <span className="text-lg leading-none">›</span>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-xs text-[var(--apple-text-secondary)] font-medium"
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--apple-green)]" />
              {t.hero.check1}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--apple-green)]" />
              {t.hero.check2}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--apple-green)]" />
              {t.hero.check3}
            </span>
          </motion.div>
        </div>

        {/* Product Preview — macOS window */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.22 }}
          className="mt-14 mx-auto max-w-3xl"
        >
          <div className="rounded-2xl overflow-hidden border border-[var(--apple-separator)] bg-white shadow-lg shadow-black/[0.06]">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--apple-separator-light)] bg-[#fafafa]">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <div className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-[11px] text-[var(--apple-text-tertiary)] font-mono">
                  {t.hero.dropzoneMockUrl}
                </span>
              </div>
              <div className="w-[52px]" />
            </div>
            {/* DropZone */}
            <div className="p-6 bg-white">
              <DropZone onUploadStarted={() => router.push(user ? "/dashboard" : "/register")} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
