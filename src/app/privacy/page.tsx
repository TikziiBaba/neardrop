"use client";

import React from "react";
import Link from "next/link";
import { Shield, Lock, EyeOff, ArrowLeft, Server, UserCheck } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
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
              <Shield className="h-3.5 w-3.5" />
              <span>Privacy &amp; Security Policy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f]">
              Gizlilik ve Güvenlik Politikası
            </h1>
            <p className="text-[#6e6e73] text-sm sm:text-base leading-relaxed max-w-2xl">
              NearDrop olarak gizliliğinizi ve veri güvenliğinizi her şeyin üzerinde tutuyoruz. Bu politika, bilgilerinizin nasıl korunduğunu açıklamaktadır.
            </p>
            <p className="text-xs text-[#86868b]">
              Son Güncelleme: 20 Eylül 2026
            </p>
          </div>

          {/* Core Principles Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-[#e8e8ed] bg-[#fbfbfd] space-y-2">
              <div className="h-9 w-9 rounded-xl bg-[#eaf4fe] text-[#0071e3] flex items-center justify-center">
                <EyeOff className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Sıfır Veri Satışı</h3>
              <p className="text-xs text-[#6e6e73] leading-relaxed">
                Kişisel verilerinizi veya yüklenen dosyalarınızı asla 3. taraflarla paylaşmaz ve reklam amaçlı kullanmayız.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[#e8e8ed] bg-[#fbfbfd] space-y-2">
              <div className="h-9 w-9 rounded-xl bg-[#eafbf0] text-[#34c759] flex items-center justify-center">
                <Lock className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Uçtan Uca Koruma</h3>
              <p className="text-xs text-[#6e6e73] leading-relaxed">
                Dosyalarınız modern şifreleme katmanlarıyla (TLS 1.3 / AES-256) aktarılır ve güvenle saklanır.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-[#e8e8ed] bg-[#fbfbfd] space-y-2">
              <div className="h-9 w-9 rounded-xl bg-[#f5eefc] text-[#af52de] flex items-center justify-center">
                <Server className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-[#1d1d1f]">Otomatik İmha</h3>
              <p className="text-xs text-[#6e6e73] leading-relaxed">
                Süresi dolan veya tek kullanımlık paylaşılan dosyalar sunuculardan kalıcı olarak silinir.
              </p>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-8 text-sm sm:text-base leading-relaxed text-[#1d1d1f]">
            {/* Section 1 */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <span className="text-[#0071e3]">1.</span>
                Toplanan Bilgiler
              </h2>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                Hizmetlerimizi sunabilmek için sadece gerekli minimum veriler toplanır:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-[#6e6e73] ml-2">
                <li>
                  <strong className="text-[#1d1d1f]">Hesap Bilgileri:</strong> E-posta adresi, ad-soyad (Google veya e-posta ile kayıt olunduğunda).
                </li>
                <li>
                  <strong className="text-[#1d1d1f]">Yüklenen Dosya Üstverisi:</strong> Dosya adı, boyutu, MIME türü ve oluşturulma zamanı.
                </li>
                <li>
                  <strong className="text-[#1d1d1f]">Teknik Güvenlik Günlükleri:</strong> Kötüye kullanımı engellemek amacıyla geçici olarak işlenen IP adresleri.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <span className="text-[#0071e3]">2.</span>
                Google Kullanıcı Verileri Politikası
              </h2>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                Google ile Giriş yapıldığında, NearDrop yalnızca kimlik doğrulama için temel profil bilgilerini (ad, e-posta ve profil fotoğrafı) talep eder. Google Drive veya Gmail gibi diğer verilere asla erişilmez veya talep edilmez.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <span className="text-[#0071e3]">3.</span>
                Veri Saklama ve Güvenlik
              </h2>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                Dosyalarınız izole bulut depolama alanında barındırılır. Veritabanı ve kimlik doğrulama hizmetleri sıkı Satır Düzeyinde Güvenlik (RLS) kurallarıyla korunur; dosyalarınıza sadece sizin izin verdiğiniz kişiler erişebilir.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <span className="text-[#0071e3]">4.</span>
                Haklarınız ve İletişim
              </h2>
              <p className="text-[#6e6e73] text-sm leading-relaxed">
                KVKK ve GDPR kapsamında hesabınızı silme, yüklenen içerikleri kaldırma veya veri özeti talep etme hakkına sahipsiniz. Tüm sorularınız için destek merkezimize ulaşabilirsiniz.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Destek / İletişim</span>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
