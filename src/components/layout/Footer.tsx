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
    <footer className="w-full border-t border-[var(--apple-separator-light)] py-14 select-none bg-[var(--apple-bg-elevated)]">
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
            <p className="text-[13px] text-[var(--apple-text-secondary)] max-w-sm leading-relaxed">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(52,199,89,0.08)] text-[11px] font-medium text-[var(--apple-green)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--apple-green)] animate-gentle-pulse" />
                <span>{t.footer.systemsOperational}</span>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-3 text-[12px] text-[var(--apple-text-secondary)] space-y-1.5 border-t border-[var(--apple-separator-light)]">
              <p>
                <span className="font-medium text-[var(--apple-text-primary)]">{locale === "tr" ? "Adres:" : "Address:"}</span> Sivas Diriliş Mah. 21. Sok., Sivas / Türkiye
              </p>
              <p className="flex items-center gap-1.5">
                <span className="font-medium text-[var(--apple-text-primary)]">{locale === "tr" ? "Destek Hattı:" : "Support Line:"}</span>
                <a href="tel:05456458416" className="text-[var(--apple-blue)] hover:underline font-mono font-medium">
                  0545 645 84 16
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="font-medium text-[var(--apple-text-primary)]">{locale === "tr" ? "E-Posta:" : "Email:"}</span>
                <a href="mailto:destek@neardrop.bekirr.dev" className="text-[var(--apple-blue)] hover:underline font-medium">
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
                <Link href="/#features" className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] font-medium transition-colors">
                  {t.footer.instantDrop}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] font-medium transition-colors">
                  {t.footer.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] font-medium transition-colors">
                  {t.footer.cloudDashboard}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] font-medium transition-colors">
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
                <Link href="/#security" className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] font-medium transition-colors">
                  {t.footer.signedUrls}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] font-medium transition-colors">
                  {t.footer.rls}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] font-medium transition-colors">
                  {t.footer.expiringLinks}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] font-medium transition-colors">
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
                <Link href="/privacy" className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] font-medium transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] font-medium transition-colors">
                  {t.footer.termsOfService}
                </Link>
              </li>
              <li>
                <Link href="/privacy#zero-data" className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] font-medium transition-colors">
                  {t.footer.zeroDataSelling}
                </Link>
              </li>
              <li>
                <Link href="/privacy#security" className="text-[var(--apple-text-secondary)] hover:text-[var(--apple-blue)] font-medium transition-colors">
                  {t.footer.securityDisclosures}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[var(--apple-blue)] hover:underline font-semibold transition-colors">
                  {locale === "tr" ? "İletişim & Bize Ulaşın" : "Contact & Support"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-5 border-t border-[var(--apple-separator-light)] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[var(--apple-text-tertiary)] font-medium">
          <p>© {new Date().getFullYear()} NearDrop. {t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">{t.footer.builtFor}</span>
            <div className="flex items-center gap-2 pl-3 border-l border-[var(--apple-separator-light)]">
              <button
                type="button"
                onClick={() => setLocale("tr")}
                className={`transition-colors cursor-pointer ${
                  locale === "tr"
                    ? "text-[var(--apple-blue)] font-semibold"
                    : "text-[var(--apple-text-quaternary)] hover:text-[var(--apple-text-primary)]"
                }`}
                title="Türkçe"
              >
                TR
              </button>
              <span className="text-[var(--apple-separator)]">/</span>
              <button
                type="button"
                onClick={() => setLocale("en")}
                className={`transition-colors cursor-pointer ${
                  locale === "en"
                    ? "text-[var(--apple-blue)] font-semibold"
                    : "text-[var(--apple-text-quaternary)] hover:text-[var(--apple-text-primary)]"
                }`}
                title="English"
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};
