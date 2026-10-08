"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Logo } from "@/components/ui/Logo";
import { motion } from "framer-motion";

const spring = { type: "spring" as const, bounce: 0.12, duration: 0.6 };

export const Footer: React.FC = () => {
  const { t, locale, setLocale } = useLanguage();

  return (
    <footer className="relative w-full px-3 pb-3 pt-16 select-none sm:px-4">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] border border-border/80 bg-gradient-to-b from-surface/70 to-background/40 py-14 shadow-[0_-20px_80px_-40px_hsl(var(--accent)/0.6)] backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={spring}
        className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" badge="" />
            <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-[11px] font-medium text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-gentle-pulse" />
                <span>{t.footer.systemsOperational}</span>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-3 text-[12px] text-muted-foreground space-y-1.5 border-t border-border/60">
              <p>
                <span className="font-medium text-foreground">{locale === "tr" ? "Adres:" : "Address:"}</span> Sivas Diriliş Mah. 21. Sok., Sivas / Türkiye
              </p>
              <p className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">{locale === "tr" ? "Destek Hattı:" : "Support Line:"}</span>
                <a href="tel:05456458416" className="text-accent-text hover:underline font-mono font-medium">
                  0545 645 84 16
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">{locale === "tr" ? "E-Posta:" : "Email:"}</span>
                <a href="mailto:destek@neardrop.bekirr.dev" className="text-accent-text hover:underline font-medium">
                  destek@neardrop.bekirr.dev
                </a>
              </p>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="apple-caption mb-3.5">{t.footer.productTitle}</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link href="/#features" className="text-muted-foreground hover:text-accent-text font-medium transition-colors">
                  {t.footer.instantDrop}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-muted-foreground hover:text-accent-text font-medium transition-colors">
                  {t.footer.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-accent-text font-medium transition-colors">
                  {t.footer.cloudDashboard}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-accent-text font-medium transition-colors">
                  {t.footer.storageQuotas}
                </Link>
              </li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h4 className="apple-caption mb-3.5">{t.footer.securityTitle}</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link href="/#security" className="text-muted-foreground hover:text-accent-text font-medium transition-colors">
                  {t.footer.signedUrls}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="text-muted-foreground hover:text-accent-text font-medium transition-colors">
                  {t.footer.rls}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="text-muted-foreground hover:text-accent-text font-medium transition-colors">
                  {t.footer.expiringLinks}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="text-muted-foreground hover:text-accent-text font-medium transition-colors">
                  {t.footer.passwordEncryption}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="apple-caption mb-3.5">{t.footer.privacyTitle}</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-accent-text font-medium transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-accent-text font-medium transition-colors">
                  {t.footer.termsOfService}
                </Link>
              </li>
              <li>
                <Link href="/privacy#zero-data" className="text-muted-foreground hover:text-accent-text font-medium transition-colors">
                  {t.footer.zeroDataSelling}
                </Link>
              </li>
              <li>
                <Link href="/privacy#security" className="text-muted-foreground hover:text-accent-text font-medium transition-colors">
                  {t.footer.securityDisclosures}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-accent-text hover:underline font-semibold transition-colors">
                  {locale === "tr" ? "İletişim & Bize Ulaşın" : "Contact & Support"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-5 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-subtle font-medium">
          <p>© {new Date().getFullYear()} NearDrop. {t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">{t.footer.builtFor}</span>
            <div className="flex items-center gap-2 pl-3 border-l border-border/60">
              <button
                type="button"
                onClick={() => setLocale("tr")}
                className={`transition-colors cursor-pointer ${
                  locale === "tr"
                    ? "text-accent-text font-semibold"
                    : "text-subtle/70 hover:text-foreground"
                }`}
                title="Türkçe"
              >
                TR
              </button>
              <span className="text-border">/</span>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`transition-colors cursor-pointer ${
                  locale === "en"
                    ? "text-accent-text font-semibold"
                    : "text-subtle/70 hover:text-foreground"
                }`}
                title="English"
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
    </footer>
  );
};
