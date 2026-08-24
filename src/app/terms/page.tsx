"use client";

import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Scale } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Footer } from "@/components/layout/Footer";

export default function TermsOfServicePage() {
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>{isTr ? "Ana Sayfaya Dön" : "Back to Home"}</span>
        </Link>

        {/* Header */}
        <div className="space-y-4 mb-12 border-b border-zinc-800/80 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
            <Scale className="h-3.5 w-3.5" />
            <span>{isTr ? "Hizmet Şartları" : "Terms of Service"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            {isTr ? "Kullanım Koşulları" : "Terms of Service"}
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl">
            {isTr
              ? "NearDrop platformunu kullanarak bu kullanım koşullarını kabul etmiş sayılırsınız. Lütfen hizmetlerimizi kullanmadan önce bu metni dikkatlice okuyunuz."
              : "By using NearDrop, you agree to these terms of service. Please review them carefully before utilizing our platform."}
          </p>
          <p className="text-xs text-zinc-500">
            {isTr ? "Son Güncelleme: 24 Ağustos 2026" : "Last Updated: August 24, 2026"}
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-10 text-sm sm:text-base leading-relaxed text-zinc-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400">1.</span>
              {isTr ? "Hizmetin Amacı ve Kullanım" : "Service Purpose and Scope"}
            </h2>
            <p className="text-zinc-400 text-sm">
              {isTr
                ? "NearDrop; kullanıcıların dosyalarını güvenli bir şekilde saklamasını, bağlantı yoluyla paylaşmasını ve doğrudan transfer edebilmesini sağlayan bir bulut dosya paylaşım platformudur."
                : "NearDrop is a secure cloud file sharing platform designed for seamless storage, expiring link transfers, and peer transfers."}
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400">2.</span>
              {isTr ? "Kabul Edilebilir Kullanım ve Yasaklar" : "Acceptable Use Policy"}
            </h2>
            <p className="text-zinc-400 text-sm">
              {isTr
                ? "Platformumuzu kullanırken aşağıdaki faaliyetlerde bulunmak kesinlikle yasaktır:"
                : "When utilizing NearDrop, the following activities are strictly prohibited:"}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-zinc-300 ml-2">
              <li>{isTr ? "Yasa dışı, telif hakkı ihlali içeren veya zararlı içerik yüklemek ve dağıtmak." : "Uploading or distributing illegal, copyrighted, or malicious software/files."}</li>
              <li>{isTr ? "Kötü amaçlı yazılım, virüs veya fidye yazılımı barındırmak." : "Hosting malware, viruses, phishing kits, or ransomware."}</li>
              <li>{isTr ? "Sistemin güvenliğini veya diğer kullanıcıların erişimini engellemeye yönelik saldırılarda bulunmak." : "Interfering with infrastructure security or attempting denial-of-service."}</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400">3.</span>
              {isTr ? "Hesap ve Kota Kuralları" : "Accounts & Storage Quotas"}
            </h2>
            <p className="text-zinc-400 text-sm">
              {isTr
                ? "Kullanıcılar abonelik paketlerine (Free, Pro, Enterprise) bağlı depolama kotalarına uymakla yükümlüdür. NearDrop, kötüye kullanım tespit edilen hesapları askıya alma hakkını saklı tutar."
                : "Users are allocated storage quotas in accordance with their subscription plan (Free, Pro, Enterprise). NearDrop reserves the right to terminate accounts violating fair-use policies."}
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-indigo-400">4.</span>
              {isTr ? "Sorumluluğun Sınırlandırılması" : "Limitation of Liability"}
            </h2>
            <p className="text-zinc-400 text-sm">
              {isTr
                ? "NearDrop hizmetleri 'olduğu gibi' sunulmaktadır. Kullanıcıların yüklediği ve paylaştığı dosyaların içeriğinden NearDrop sorumlu tutulamaz."
                : "NearDrop is provided on an 'as is' basis. NearDrop is not liable for user-generated content or shared file assets."}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
