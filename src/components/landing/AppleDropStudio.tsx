"use client";

import React, { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { DropZone } from "@/components/upload/DropZone";
import {
  UploadCloud,
  Lock,
  Clock,
  ShieldCheck,
  Sparkles,
  Share2,
  Check,
} from "lucide-react";

export const AppleDropStudio: React.FC = () => {
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  return (
    <section id="studio" className="relative py-24 md:py-32 bg-[#09090b] select-none">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
            {isTr ? "Canlı Stüdyo" : "Live Studio"}
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-white">
            {isTr ? "Hemen gönderin. Sadece bırakın." : "Ready to send? Just drop."}
          </h2>
          <p className="text-base text-zinc-400">
            {isTr
              ? "Herhangi bir dosya veya klasörü sürükleyin. Saniyeler içinde güvenli, süreli ve şifreli bağlantınız hazır."
              : "Drag and drop any file or folder. Your secure, expiring link is generated in seconds."}
          </p>
        </div>

        {/* The Studio Card */}
        <div className="max-w-3xl mx-auto rounded-[32px] border border-white/[0.08] bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-10 shadow-2xl">
          {/* Real DropZone Component */}
          <DropZone />

          {/* Feature Badges below */}
          <div className="mt-8 pt-6 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-white">
                {isTr ? "Tek Tıkla Bağlantı" : "One-Click Link"}
              </span>
              <span className="text-[11px] text-zinc-400">
                {isTr ? "Kopyalayın ve doğrudan gönderin" : "Copy and beam instantly"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-white">
                {isTr ? "Otomatik İmha" : "Automated Expiry"}
              </span>
              <span className="text-[11px] text-zinc-400">
                {isTr ? "Süre dolunca sunucudan silinir" : "Purged when timer expires"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-white">
                {isTr ? "Şifre Koruması" : "Password Protected"}
              </span>
              <span className="text-[11px] text-zinc-400">
                {isTr ? "İsteğe bağlı AES şifreleme" : "Optional PIN encryption"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
