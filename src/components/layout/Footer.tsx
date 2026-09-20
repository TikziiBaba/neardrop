"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Logo } from "@/components/ui/Logo";
import { motion } from "framer-motion";

const spring = { type: "spring" as const, bounce: 0.15, duration: 0.65 };

export const Footer: React.FC = () => {
  const { t, locale, setLocale } = useLanguage();

  return (
    <footer className="w-full border-t border-[#e4e4e7] py-16 select-none relative overflow-hidden bg-white/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={spring}
        className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" badge="" />
            <p className="text-[13px] text-[#27272a] max-w-sm leading-relaxed">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16a34a]/10 text-[11px] font-semibold text-[#16a34a] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-gentle-pulse" />
                <span>{t.footer.systemsOperational}</span>
              </div>
            </div>

            {/* Contact */}
            <div className="pt-3 text-[12px] text-[#27272a] space-y-2 border-t border-[#e4e4e7]">
              <p className="leading-relaxed">
                <span className="font-semibold text-[#09090b]">Adres:</span> Sivas Diriliş Mah. 21. Sok., Sivas / Türkiye
              </p>
              <p className="flex items-center gap-1.5">
                <span className="font-semibold text-[#09090b]">Destek Hattı:</span>
                <a href="tel:05456458416" className="text-[#0071e3] hover:underline font-mono font-bold hover:text-[#005bb5]">
                  0545 645 84 16
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="font-semibold text-[#09090b]">E-Posta:</span>
                <a href="mailto:destek@neardrop.bekirr.dev" className="text-[#0071e3] hover:underline font-semibold hover:text-[#005bb5]">
                  destek@neardrop.bekirr.dev
                </a>
              </p>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-[12px] font-bold text-[#09090b] uppercase tracking-wider mb-3.5">{t.footer.productTitle}</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link href="/#features" className="text-[#27272a] hover:text-[#0071e3] hover:translate-x-0.5 inline-block font-medium transition-all">
                  {t.footer.instantDrop}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-[#27272a] hover:text-[#0071e3] hover:translate-x-0.5 inline-block font-medium transition-all">
                  {t.footer.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-[#27272a] hover:text-[#0071e3] hover:translate-x-0.5 inline-block font-medium transition-all">
                  {t.footer.cloudDashboard}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[#27272a] hover:text-[#0071e3] hover:translate-x-0.5 inline-block font-medium transition-all">
                  {t.footer.storageQuotas}
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Tech */}
          <div>
            <h4 className="text-[12px] font-bold text-[#09090b] uppercase tracking-wider mb-3.5">{t.footer.securityTitle}</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link href="/#security" className="text-[#27272a] hover:text-[#0071e3] hover:translate-x-0.5 inline-block font-medium transition-all">
                  {t.footer.signedUrls}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="text-[#27272a] hover:text-[#0071e3] hover:translate-x-0.5 inline-block font-medium transition-all">
                  {t.footer.rls}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="text-[#27272a] hover:text-[#0071e3] hover:translate-x-0.5 inline-block font-medium transition-all">
                  {t.footer.expiringLinks}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="text-[#27272a] hover:text-[#0071e3] hover:translate-x-0.5 inline-block font-medium transition-all">
                  {t.footer.passwordEncryption}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Company */}
          <div>
            <h4 className="text-[12px] font-bold text-[#09090b] uppercase tracking-wider mb-3.5">{t.footer.privacyTitle}</h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link href="/privacy" className="text-[#27272a] hover:text-[#0071e3] hover:translate-x-0.5 inline-block font-medium transition-all">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#27272a] hover:text-[#0071e3] hover:translate-x-0.5 inline-block font-medium transition-all">
                  {t.footer.termsOfService}
                </Link>
              </li>
              <li>
                <Link href="/privacy#zero-data" className="text-[#27272a] hover:text-[#0071e3] hover:translate-x-0.5 inline-block font-medium transition-all">
                  {t.footer.zeroDataSelling}
                </Link>
              </li>
              <li>
                <Link href="/privacy#security" className="text-[#27272a] hover:text-[#0071e3] hover:translate-x-0.5 inline-block font-medium transition-all">
                  {t.footer.securityDisclosures}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#0071e3] hover:underline font-bold transition-colors">
                  İletişim &amp; Bize Ulaşın
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#e4e4e7] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#27272a] font-medium">
          <p>© {new Date().getFullYear()} NearDrop. {t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              {t.footer.builtFor}
            </span>
            <div className="flex items-center gap-2 pl-3 border-l border-[#e4e4e7]">
              <button
                type="button"
                onClick={() => setLocale('tr')}
                className={`transition-colors cursor-pointer ${locale === 'tr' ? 'text-[#0071e3] font-bold' : 'text-[#52525b] hover:text-[#09090b]'}`}
                title="Türkçe"
              >
                TR
              </button>
              <span className="text-[#d4d4d8]">/</span>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`transition-colors cursor-pointer ${locale === 'en' ? 'text-[#0071e3] font-bold' : 'text-[#52525b] hover:text-[#09090b]'}`}
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
