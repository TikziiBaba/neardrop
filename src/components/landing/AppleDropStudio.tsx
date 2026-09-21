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
    <section id="studio" className="relative py-24 md:py-32 bg-white select-none">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
            {isTr ? "Canlı Stüdyo" : "Live Studio"}
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#1d1d1f]">
            {isTr ? "Hemen gönderin. Sadece bırakın." : "Ready to send? Just drop."}
          </h2>
          <p className="text-base text-[#6e6e73]">
            {isTr
              ? "Herhangi bir dosya veya klasörü sürükleyin. Saniyeler içinde güvenli, süreli ve şifreli bağlantınız hazır."
              : "Drag and drop any file or folder. Your secure, expiring link is generated in seconds."}
          </p>
        </div>

        {/* The Studio Card */}
        <div className="max-w-3xl mx-auto rounded-[32px] border border-black/[0.08] bg-[#f5f5f7] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
          {/* Real DropZone Component */}
          <DropZone />

          {/* Feature Badges below */}
          <div className="mt-8 pt-6 border-t border-black/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-[#1d1d1f]">
                {isTr ? "Tek Tıkla Bağlantı" : "One-Click Link"}
              </span>
              <span className="text-[11px] text-[#86868b]">
                {isTr ? "Kopyalayın ve doğrudan gönderin" : "Copy and beam instantly"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-[#1d1d1f]">
                {isTr ? "Otomatik İmha" : "Automated Expiry"}
              </span>
              <span className="text-[11px] text-[#86868b]">
                {isTr ? "Süre dolunca sunucudan silinir" : "Purged when timer expires"}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-[#1d1d1f]">
                {isTr ? "Şifre Koruması" : "Password Protected"}
              </span>
              <span className="text-[11px] text-[#86868b]">
                {isTr ? "İsteğe bağlı AES şifreleme" : "Optional PIN encryption"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
