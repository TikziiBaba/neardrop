"use client";

import React from "react";
import Link from "next/link";
import { Shield, Lock, EyeOff, ArrowLeft, Server, UserCheck } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-accent-text transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Ana Sayfaya Dön</span>
        </Link>

        {/* Content Card */}
        <div className="rounded-3xl border border-border bg-surface/90 p-8 sm:p-12 shadow-2xl backdrop-blur-xl space-y-10">
          {/* Header */}
          <div className="space-y-3 border-b border-border pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-xs font-semibold text-accent-text">
              <Shield className="h-3.5 w-3.5" />
              <span>Privacy &amp; Security Policy</span>
            </div>
            <h1 className="display-title">
              Gizlilik ve Güvenlik Politikası
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl">
              NearDrop olarak gizliliğinizi ve veri güvenliğinizi her şeyin üzerinde tutuyoruz. Bu politika, bilgilerinizin nasıl korunduğunu açıklamaktadır.
            </p>
            <p className="text-xs text-subtle">
              Son Güncelleme: 20 Eylül 2026
            </p>
          </div>

          {/* Core Principles Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-border bg-background/60 space-y-2">
              <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent-text flex items-center justify-center">
                <EyeOff className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Sıfır Veri Satışı</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kişisel verilerinizi veya yüklenen dosyalarınızı asla 3. taraflarla paylaşmaz ve reklam amaçlı kullanmayız.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-background/60 space-y-2">
              <div className="h-9 w-9 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <Lock className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Uçtan Uca Koruma</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dosyalarınız modern şifreleme katmanlarıyla (TLS 1.3 / AES-256) aktarılır ve güvenle saklanır.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-border bg-background/60 space-y-2">
              <div className="h-9 w-9 rounded-xl bg-accent/10 text-accent-text flex items-center justify-center">
                <Server className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Otomatik İmha</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Süresi dolan veya tek kullanımlık paylaşılan dosyalar sunuculardan kalıcı olarak silinir.
              </p>
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-8 text-sm sm:text-base leading-relaxed text-foreground">
            {/* Section 1 */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-accent-text">1.</span>
                Toplanan Bilgiler
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Hizmetlerimizi sunabilmek için sadece gerekli minimum veriler toplanır:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
                <li>
                  <strong className="text-white">Hesap Bilgileri:</strong> E-posta adresi, ad-soyad (Google veya e-posta ile kayıt olunduğunda).
                </li>
                <li>
                  <strong className="text-white">Yüklenen Dosya Üstverisi:</strong> Dosya adı, boyutu, MIME türü ve oluşturulma zamanı.
                </li>
                <li>
                  <strong className="text-white">Teknik Güvenlik Günlükleri:</strong> Kötüye kullanımı engellemek amacıyla geçici olarak işlenen IP adresleri.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-accent-text">2.</span>
                Google Kullanıcı Verileri Politikası
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Google ile Giriş yapıldığında, NearDrop yalnızca kimlik doğrulama için temel profil bilgilerini (ad, e-posta ve profil fotoğrafı) talep eder. Google Drive veya Gmail gibi diğer verilere asla erişilmez veya talep edilmez.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-accent-text">3.</span>
                Veri Saklama ve Güvenlik
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Dosyalarınız izole bulut depolama alanında barındırılır. Veritabanı ve kimlik doğrulama hizmetleri sıkı Satır Düzeyinde Güvenlik (RLS) kurallarıyla korunur; dosyalarınıza sadece sizin izin verdiğiniz kişiler erişebilir.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-2">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-accent-text">4.</span>
                Haklarınız ve İletişim
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                KVKK ve GDPR kapsamında hesabınızı silme, yüklenen içerikleri kaldırma veya veri özeti talep etme hakkına sahipsiniz. Tüm sorularınız için destek merkezimize ulaşabilirsiniz.
              </p>
              <div className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-colors"
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
