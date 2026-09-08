"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Logo } from "@/components/ui/Logo";

export const Footer: React.FC = () => {
  const { t, locale } = useLanguage();

  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-16 text-zinc-400 select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" badge="" />
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed font-normal">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.footer.systemsOperational}</span>
              </div>
            </div>

            {/* Official Headquarters & Contact */}
            <div className="pt-3 text-[11px] text-zinc-400 space-y-1.5 border-t border-zinc-900">
              <p className="text-zinc-300 font-medium leading-relaxed">
                <span className="text-zinc-500 font-normal">Adres:</span> Sivas Diriliş Mah. 21. Sok., Sivas / Türkiye
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-zinc-500">Destek Hattı:</span>
                <a href="tel:05456458416" className="text-emerald-400 hover:underline font-mono font-bold">
                  0545 645 84 16
                </a>
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-zinc-500">E-Posta:</span>
                <a href="mailto:destek@neardrop.bekirr.dev" className="text-sky-400 hover:underline">
                  destek@neardrop.bekirr.dev
                </a>
              </p>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3.5">{t.footer.productTitle}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  {t.footer.instantDrop}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  {t.footer.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  {t.footer.cloudDashboard}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  {t.footer.storageQuotas}
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Tech */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3.5">{t.footer.securityTitle}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#security" className="hover:text-white transition-colors">
                  {t.footer.signedUrls}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-white transition-colors">
                  {t.footer.rls}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-white transition-colors">
                  {t.footer.expiringLinks}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-white transition-colors">
                  {t.footer.passwordEncryption}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Company */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3.5">{t.footer.privacyTitle}</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  {t.footer.termsOfService}
                </Link>
              </li>
              <li>
                <Link href="/privacy#zero-data" className="hover:text-white transition-colors">
                  {t.footer.zeroDataSelling}
                </Link>
              </li>
              <li>
                <Link href="/privacy#security" className="hover:text-white transition-colors">
                  {t.footer.securityDisclosures}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                  İletişim &amp; Bize Ulaşın
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} NearDrop. {t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-zinc-500">
              {t.footer.builtFor}
            </span>
            <div className="flex items-center gap-2 pl-3 border-l border-zinc-800 text-xs">
              <Link
                href="/tr"
                className={`transition-colors ${locale === 'tr' ? 'text-sky-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Türkçe (neardrop.bekirr.dev/tr)"
              >
                TR
              </Link>
              <span className="text-zinc-700">/</span>
              <Link
                href="/en"
                className={`transition-colors ${locale === 'en' ? 'text-sky-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="English (neardrop.bekirr.dev/en)"
              >
                EN
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
