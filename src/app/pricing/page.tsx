"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getPricingPlans } from "@/lib/subscription/plans";
import { useAuth } from "@/lib/auth/context";
import { useLanguage } from "@/lib/i18n/context";
import {
  Check,
  Zap,
  ShieldCheck,
  HardDrive,
  Infinity as InfinityIcon,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/layout/Footer";
import { LandingAmbient } from "@/components/landing/LandingAmbient";

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plans = getPricingPlans(isTr);

  const faqs = isTr
    ? [
        {
          q: "Paketimi yükselttiğimde depolama kotam ne zaman güncellenir?",
          a: "Pro, Ultra veya Kurumsal plana yükseltme yaptığınız anda yeni depolama kotanız (100 GB, 500 GB veya 2 TB) anında tanımlanır. Mevcut tüm dosyalarınız güvenle korunur.",
        },
        {
          q: "Aboneliğimi dilediğim zaman değiştirebilir veya iptal edebilir miyim?",
          a: "Evet. Dilediğiniz zaman hesap ayarlarınızdan planınızı yükseltebilir, düşürebilir veya aboneliğinizi herhangi bir ceza olmaksızın iptal edebilirsiniz.",
        },
        {
          q: "Hangi ödeme yöntemleri destekleniyor?",
          a: "PayTR altyapısı ile tüm Troy, Visa ve MasterCard kredi ve banka kartları ile 256-bit SSL ve 3D Secure banka güvencesinde ödeme yapabilirsiniz.",
        },
        {
          q: "Ücretsiz Başlangıç planının kısıtlamaları nelerdir?",
          a: "Ücretsiz plan 2 GB bulut depolama, 2 GB tek dosya yükleme sınırı, 1 aktif paylaşım bağlantısı ve 12 saat maksimum bağlantı ömrü sunar.",
        },
        {
          q: "Depolama kotamı doldurursam ne olur?",
          a: "Mevcut dosyalarınız ve paylaşılan bağlantılarınız kesintisiz çalışmaya devam eder. Ancak yeni dosya yükleyebilmek için bazı eski dosyaları silmeniz veya planınızı yükseltmeniz gerekir.",
        },
      ]
    : [
        {
          q: "When does my storage quota update after upgrading?",
          a: "As soon as you upgrade to Pro, Ultra, or Enterprise, your new storage quota (100 GB, 500 GB, or 2 TB) is provisioned immediately. All existing files remain intact.",
        },
        {
          q: "Can I change or cancel my plan at any time?",
          a: "Yes. You can upgrade, downgrade, or cancel your subscription at any time directly from your account settings.",
        },
        {
          q: "What payment methods are supported?",
          a: "We support major credit and debit cards (Troy, Visa, MasterCard) with 3D Secure bank encryption via PayTR.",
        },
        {
          q: "What are the limitations of the Free Starter plan?",
          a: "The Free plan includes 2 GB of cloud storage, up to 2 GB single file uploads, 1 active share link at a time, and a maximum link lifespan of 12 hours.",
        },
        {
          q: "What happens if I reach my storage quota limit?",
          a: "Your existing files and links will continue to work normally. However, to upload new files, you will need to delete some existing files or upgrade your plan.",
        },
      ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-zinc-950 text-zinc-100">
      <LandingAmbient />
      <div className="relative z-10 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 space-y-16 max-w-7xl mx-auto w-full">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="rounded-full bg-zinc-900/90 border-zinc-800 text-[#0071e3] text-xs font-bold px-3.5 py-1 shadow-sm">
            {isTr ? "NearDrop Planları" : "NearDrop Plans"}
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            {isTr ? "Şeffaf ve Esnek Fiyatlandırma." : "Transparent, Flexible Pricing."}
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
            {isTr
              ? "Hızlı kişisel dosya aktarımından 2 TB kurumsal bulut depolamaya kadar ihtiyacınıza en uygun planı seçin."
              : "From fast personal transfers to 2 TB enterprise storage, choose the plan that fits your workflow."}
          </p>

          {/* PayTR Security Notice Pill */}
          <div className="flex justify-center pt-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold">{isTr ? "PayTR 256-Bit SSL & 3D Secure Güvencesi" : "PayTR 256-Bit SSL & 3D Secure Protection"}</span>
            </div>
          </div>

          {/* Monthly / Yearly Billing Segmented Control */}
          <div className="flex justify-center pt-3">
            <div className="inline-flex items-center p-1 rounded-full bg-zinc-900/90 border border-zinc-800 shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                }`}
              >
                {isTr ? "Aylık Ödeme" : "Monthly Billing"}
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  billingCycle === "yearly"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                }`}
              >
                <span>{isTr ? "Yıllık Ödeme" : "Annual Billing"}</span>
                <span className="rounded-full bg-[#0071e3]/20 px-2 py-0.5 text-[10px] font-bold text-[#0071e3]">
                  {isTr ? "2 Ay Ücretsiz" : "2 Months Free"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((plan) => {
            const isCurrentPlan = user?.subscriptionTier === plan.id;
            const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
            const period = billingCycle === "yearly" ? (isTr ? "/yıl" : "/year") : (isTr ? "/ay" : "/mo");

            return (
              <div
                key={plan.id}
                className={`group relative rounded-[28px] p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] cursor-pointer ${
                  plan.popular
                    ? "bg-zinc-900/95 border-2 border-[#0071e3] shadow-[0_12px_40px_rgba(0,113,227,0.2)] ring-1 ring-[#0071e3]/30 hover:shadow-[0_24px_50px_rgba(0,113,227,0.3)]"
                    : "bg-zinc-900/80 border border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_45px_rgba(0,113,227,0.15)] hover:border-zinc-700"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[#0071e3] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Header */}
                  <div className="space-y-1.5">
                    <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed min-h-[34px]">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Storage Pill */}
                  <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800/80 border border-zinc-700/80 px-3.5 py-1.5 text-xs font-bold text-zinc-200 shadow-sm">
                    <HardDrive className="h-3.5 w-3.5 text-[#0071e3]" />
                    <span>{plan.quotaLabel} {isTr ? "Yüksek Hızlı Depolama" : "High-Speed Storage"}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                      {price === 0 ? "0 ₺" : `${price} ₺`}
                    </span>
                    {price > 0 && (
                      <span className="text-xs font-bold text-zinc-400">{period}</span>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-3 border-t border-zinc-800">
                    <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                      {isTr ? "Plan Özellikleri" : "Plan Highlights"}
                    </span>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-200 font-medium">
                          <CheckCircle2 className="h-4 w-4 text-[#0071e3] flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{feat}</span>
                        </li>
                      ))}
                      {plan.limitations?.map((lim, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-500">
                          <XCircle className="h-4 w-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{lim}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-6 mt-6 border-t border-zinc-800">
                  {isCurrentPlan ? (
                    <Button
                      variant="outline"
                      disabled
                      className="w-full text-xs rounded-full bg-zinc-800/50 border-zinc-700 text-zinc-500"
                    >
                      {isTr ? "Mevcut Planınız" : "Current Plan"}
                    </Button>
                  ) : plan.id === "free" ? (
                    <Link href={user ? "/dashboard" : "/register"} className="block w-full">
                      <Button
                        variant="outline"
                        className="w-full text-xs rounded-full border-zinc-700 text-zinc-200 hover:border-[#0071e3] hover:text-[#0071e3] hover:bg-zinc-800 font-bold"
                      >
                        {isTr ? "Ücretsiz Başla" : "Get Started Free"}
                      </Button>
                    </Link>
                  ) : (
                    <Link
                      href={`/checkout?plan=${plan.id}&billing=${billingCycle}`}
                      className="block w-full"
                    >
                      <Button
                        className={`w-full text-xs rounded-full gap-1.5 font-bold py-2.5 transition-all duration-200 ${
                          plan.popular
                            ? "bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 hover:scale-[1.02]"
                            : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.02]"
                        }`}
                      >
                        <span>{isTr ? `${plan.name} Seç` : `Select ${plan.name}`}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Highlights Bento Panel */}
        <div className="rounded-[28px] border border-zinc-800/80 bg-zinc-900/60 p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.3)] space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="outline" className="rounded-full bg-zinc-800/80 border-zinc-700 text-zinc-300 text-[11px] font-medium px-3 py-1">
              {isTr ? "TÜM PLANLARDA STANDART" : "STANDARD ON ALL PLANS"}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {isTr ? "Tavizsiz Hız ve Güvenlik" : "Uncompromising Speed and Security"}
            </h2>
            <p className="text-sm text-zinc-400">
              {isTr
                ? "NearDrop dosyalarınızı endüstri standardı kriptografik şifreleme ve küresel edge dağıtımıyla korur."
                : "NearDrop protects your assets with industry-leading cryptographic security and global edge delivery."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="flex gap-4 items-start p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-[#0071e3] flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  {isTr ? "Uçtan Uca Şifreleme" : "End-to-End Encryption"}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {isTr
                    ? "AES-256-GCM ve sıfır bilgi mimarisi sayesinde dosyalarınıza yalnızca siz ve yetkili alıcılar erişebilir."
                    : "AES-256-GCM and zero-knowledge architecture ensure only you and authorized recipients access files."}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  {isTr ? "Küresel Edge Bulut & CDN" : "Global Edge Cloud & CDN"}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {isTr
                    ? "Küresel edge lokasyonları ile ultra düşük gecikme süreli doğrudan aktarım ve anında yükleme."
                    : "Ultra-low latency direct transfers and instant uploads powered by global edge POPs."}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 flex-shrink-0">
                <InfinityIcon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">
                  {isTr ? "Sınırsız Yerel Ağ (LAN) Aktarımı" : "Unlimited LAN Transfers"}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {isTr
                    ? "Yerel Wi-Fi ağınız üzerinden 450+ Mbps hızında, hiçbir kota veya internet maliyeti olmadan eşler arası (P2P) aktarım."
                    : "Direct peer-to-peer transfers across your local Wi-Fi network at speeds of 450+ Mbps with zero bandwidth costs."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {isTr ? "Sıkça Sorulan Sorular" : "Frequently Asked Questions"}
            </h2>
            <p className="text-sm text-zinc-400">
              {isTr
                ? "Planlar, faturalandırma ve depolama kotaları hakkında bilmeniz gereken her şey."
                : "Everything you need to know about plans, billing, and storage."}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-zinc-200 hover:text-[#0071e3] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                      openFaq === idx ? "rotate-180 text-[#0071e3]" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
