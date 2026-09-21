"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const AppleCtaSection: React.FC = () => {
  const { locale } = useLanguage();
  const { user } = useAuth();
  const isTr = locale === "tr";

  return (
    <section className="relative py-28 md:py-40 bg-white text-center select-none overflow-hidden">
      <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8 space-y-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
          {isTr ? "Hemen Başlayın" : "Get Started Today"}
        </span>

        <h2 className="text-4xl sm:text-6xl font-bold tracking-[-0.035em] text-[#1d1d1f] leading-tight">
          {isTr ? (
            <>
              Dosyalarınız. <br />
              <span className="text-[#86868b]">Sizin kurallarınız.</span>
            </>
          ) : (
            <>
              Your files. <br />
              <span className="text-[#86868b]">Your terms.</span>
            </>
          )}
        </h2>

        <p className="text-lg text-[#6e6e73] max-w-xl mx-auto leading-relaxed">
          {isTr
            ? "Karmaşık paneller veya kota engelleri yok. Doğrudan tarayıcınızdan eşler arası aktarımı bugün deneyimleyin."
            : "No complex dashboards or storage hurdles. Experience seamless peer-to-peer sharing today."}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="#studio"
            className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-[#0077ed] hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <span>{isTr ? "Ücretsiz Dosya Bırakın" : "Drop Files Free"}</span>
            <ArrowRight className="h-4 w-4" />
          </a>

          <Link
            href={user ? "/dashboard" : "/register"}
            className="inline-flex items-center gap-1.5 px-6 py-4 rounded-full text-base font-medium text-[#1d1d1f] hover:bg-black/[0.04] transition-all"
          >
            <span>{user ? (isTr ? "Panele Git" : "Go to Dashboard") : (isTr ? "Hesap Oluştur" : "Create Account")}</span>
            <span className="text-lg leading-none">›</span>
          </Link>
        </div>

        <div className="pt-8 flex items-center justify-center gap-2 text-xs text-[#86868b]">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>
            {isTr
              ? "Uçtan uca şifreli · Kredi kartı gerekmez · Sıfır takip"
              : "End-to-end encrypted · No card required · Zero tracking"}
          </span>
        </div>
      </div>
    </section>
  );
};
