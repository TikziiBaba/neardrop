"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col justify-between">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#6e6e73] hover:text-[#0071e3] transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Ana Sayfaya Dön</span>
        </Link>

        {/* Content Card */}
        <div className="rounded-[28px] border border-[#d2d2d7]/70 bg-white p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-10">
          {/* Header */}
          <div className="space-y-3 border-b border-[#e8e8ed] pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f5f5f7] border border-[#d2d2d7]/70 text-xs font-semibold text-[#0071e3]">
              <Scale className="h-3.5 w-3.5" />
              <span>Terms of Service</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
              Kullanım Koşulları
            </h1>
            <p className="text-[#6e6e73] text-sm sm:text-base leading-relaxed max-w-2xl">
              NearDrop hizmetlerini kullanarak bu kullanım koşullarını kabul etmiş sayılırsınız. Platformumuzu kullanmadan önce lütfen dikkatlice inceleyin.
            </p>
            <p className="text-xs text-[#86868b]">
              Son Güncelleme: 20 Eylül 2026
            </p>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-8 text-sm sm:text-base leading-relaxed text-[#1d1d1f]">
            {/* Section 1 */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <span className="text-[#0071e3]">1.</span>
                Hizmetin Amacı ve Kapsamı
              </h2>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                NearDrop, güvenli bulut dosya aktarımı, süreli bağlantı paylaşımı ve eşler arası yerel ağ transferleri için tasarlanmış yüksek hızlı bir paylaşım platformudur.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <span className="text-[#0071e3]">2.</span>
                Kabul Edilebilir Kullanım Politikası
              </h2>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                NearDrop altyapısını kullanırken aşağıdaki eylemler kesinlikle yasaktır:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-[#6e6e73] ml-2">
                <li>Telif hakkı ihlali oluşturan, yasa dışı veya zararlı yazılım ve dosyaların dağıtımı.</li>
                <li>Zararlı yazılımlar, kimlik avı (phishing) araçları veya fidye yazılımları barındırma.</li>
                <li>Hizmet altyapısına zarar verecek veya hizmeti engelleyecek (DDoS vb.) girişimlerde bulunma.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <span className="text-[#0071e3]">3.</span>
                Hesaplar ve Depolama Kotaları
              </h2>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                Kullanıcılara seçtikleri abonelik planına (Free, Pro, Ultra, Enterprise) göre depolama kotası tahsis edilir. Adil kullanım ilkelerini ihlal eden hesapları sınırlandırma hakkı saklıdır.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <span className="text-[#0071e3]">4.</span>
                Sorumluluk Reddi
              </h2>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                NearDrop &apos;olduğu gibi&apos; sunulur. Kullanıcılar tarafından paylaşılan dosyaların içeriğinden NearDrop sorumlu tutulamaz.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
