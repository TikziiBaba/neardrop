"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Check, X, Sparkles } from "lucide-react";

export const AppleSpecsSection: React.FC = () => {
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  const rows = [
    {
      feature: isTr ? "Aktarım Yöntemi" : "Transfer Method",
      neardrop: isTr ? "P2P Doğrudan Akış" : "Direct P2P Stream",
      wetransfer: isTr ? "Bulut Yükle & Bekle" : "Cloud Upload & Wait",
      drive: isTr ? "Kalıcı Bulut Depolama" : "Persistent Cloud Storage",
      airdrop: isTr ? "Apple Wi-Fi Direct" : "Apple Wi-Fi Direct",
      isNeardropWin: true,
    },
    {
      feature: isTr ? "Dosya Boyutu Limiti" : "File Size Limit",
      neardrop: isTr ? "Sınırsız (P2P)" : "Unlimited (P2P)",
      wetransfer: "2 GB (Ücretsiz)",
      drive: isTr ? "15 GB Toplam Kota" : "15 GB Quota Pool",
      airdrop: isTr ? "Cihaz Hafızası Kadar" : "Device Storage",
      isNeardropWin: true,
    },
    {
      feature: isTr ? "Çapraz Platform Desteği" : "Cross-Platform Support",
      neardrop: isTr ? "Tüm Cihazlar & Web" : "All Devices & Web",
      wetransfer: isTr ? "Web / E-posta" : "Web / Email",
      drive: isTr ? "Tüm Cihazlar (Hesapla)" : "All (With Account)",
      airdrop: isTr ? "Yalnızca Apple Cihazları" : "Apple Devices Only",
      isNeardropWin: true,
    },
    {
      feature: isTr ? "Uçtan Uca İstemci Şifreleme" : "End-to-End Client Encryption",
      neardrop: "AES-256-GCM (İstemci)",
      wetransfer: isTr ? "Sunucu Tarafı (TLS)" : "Server-side TLS",
      drive: isTr ? "Sunucu Tarafı" : "Server-side",
      airdrop: "TLS / Wi-Fi WPA3",
      isNeardropWin: true,
    },
    {
      feature: isTr ? "Kayıt / Hesap Zorunluluğu" : "Account / Sign-up Required",
      neardrop: isTr ? "Gerekmez" : "Not Required",
      wetransfer: isTr ? "E-posta Doğrulaması" : "Email Verification",
      drive: isTr ? "Google Hesabı Şart" : "Google Account Required",
      airdrop: isTr ? "Apple Kimliği Şart" : "Apple ID Required",
      isNeardropWin: true,
    },
    {
      feature: isTr ? "Zaman Ayarlı Kendini İmha" : "Auto-Destruct Lifespan",
      neardrop: isTr ? "10 dk - 30 gün / 1 Kez" : "10 min - 30 days / 1x",
      wetransfer: isTr ? "7 Gün Sabit" : "7 Days Fixed",
      drive: isTr ? "Manuel Silme" : "Manual Deletion",
      airdrop: isTr ? "Yok" : "None",
      isNeardropWin: true,
    },
  ];

  return (
    <section id="specs" className="relative py-24 md:py-32 bg-[#f5f5f7] select-none">
      <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#0071e3]">
            {isTr ? "Teknik Özellikler" : "Technical Specs"}
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-[-0.035em] text-[#1d1d1f]">
            {isTr ? "Farkı karşılaştırın." : "Compare the difference."}
          </h2>
          <p className="text-base text-[#6e6e73]">
            {isTr
              ? "Geleneksel bulut yöntemleri ve kapalı ekosistemlerle NearDrop arasındaki teknik farklar."
              : "How NearDrop stacks up against traditional cloud transfers and walled gardens."}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-[28px] border border-black/[0.06] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-black/[0.06] bg-[#fafafa]">
                <th className="p-5 sm:p-6 text-xs font-semibold text-[#86868b] uppercase tracking-wider w-1/4">
                  {isTr ? "Özellik" : "Feature"}
                </th>
                <th className="p-5 sm:p-6 text-sm font-bold text-[#0071e3] bg-blue-50/50 w-1/4">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span>NearDrop</span>
                  </div>
                </th>
                <th className="p-5 sm:p-6 text-sm font-semibold text-[#1d1d1f] w-1/6">WeTransfer</th>
                <th className="p-5 sm:p-6 text-sm font-semibold text-[#1d1d1f] w-1/6">Google Drive</th>
                <th className="p-5 sm:p-6 text-sm font-semibold text-[#1d1d1f] w-1/6">AirDrop</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] text-xs sm:text-sm">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-black/[0.01] transition-colors">
                  <td className="p-5 sm:p-6 font-medium text-[#1d1d1f]">{row.feature}</td>
                  <td className="p-5 sm:p-6 font-semibold text-[#0071e3] bg-blue-50/30">
                    <div className="flex items-center gap-1.5">
                      <Check className="h-4 w-4 flex-shrink-0 text-[#0071e3]" />
                      <span>{row.neardrop}</span>
                    </div>
                  </td>
                  <td className="p-5 sm:p-6 text-[#6e6e73]">{row.wetransfer}</td>
                  <td className="p-5 sm:p-6 text-[#6e6e73]">{row.drive}</td>
                  <td className="p-5 sm:p-6 text-[#6e6e73]">{row.airdrop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
