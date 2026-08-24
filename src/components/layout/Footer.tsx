"use client";

import React from "react";
import Link from "next/link";
import { Shield, Lock, HardDrive, Heart } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Logo } from "@/components/ui/Logo";

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-12 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" badge="" />
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              {t.footer.description}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{t.footer.systemsOperational}</span>
              </div>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">{t.footer.productTitle}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#features" className="hover:text-zinc-200 transition-colors">
                  {t.footer.instantDrop}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-zinc-200 transition-colors">
                  {t.footer.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-zinc-200 transition-colors">
                  {t.footer.cloudDashboard}
                </Link>
              </li>
              <li>
                <Link href="/storage" className="hover:text-zinc-200 transition-colors">
                  {t.footer.storageQuotas}
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Tech */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">{t.footer.securityTitle}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/#security" className="hover:text-zinc-200 transition-colors">
                  {t.footer.signedUrls}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-zinc-200 transition-colors">
                  {t.footer.rls}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-zinc-200 transition-colors">
                  {t.footer.expiringLinks}
                </Link>
              </li>
              <li>
                <Link href="/#security" className="hover:text-zinc-200 transition-colors">
                  {t.footer.passwordEncryption}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Company */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">{t.footer.privacyTitle}</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-zinc-200 transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-zinc-200 transition-colors">
                  {t.footer.termsOfService}
                </Link>
              </li>
              <li>
                <Link href="/privacy#zero-data" className="hover:text-zinc-200 transition-colors">
                  {t.footer.zeroDataSelling}
                </Link>
              </li>
              <li>
                <Link href="/privacy#security" className="hover:text-zinc-200 transition-colors">
                  {t.footer.securityDisclosures}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} {t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              {t.footer.builtFor}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
