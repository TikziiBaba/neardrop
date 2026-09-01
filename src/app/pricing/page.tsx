"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRICING_PLANS } from "@/lib/subscription/plans";
import { TIER_LIMITS } from "@/lib/subscription/permissions";
import { useAuth } from "@/lib/auth/context";
import { formatBytes } from "@/lib/utils";
import {
  Sparkles,
  Check,
  Zap,
  ShieldCheck,
  HardDrive,
  Infinity as InfinityIcon,
  ArrowRight,
  HelpCircle,
  Clock,
  Lock,
  ChevronDown,
  Crown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/badge";

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Abonelik yükseltildiğinde depolama kotası ne zaman aktif olur?",
      a: "Pro, Ultra veya Enterprise plana geçtiğiniz anda yeni depolama alanınız (100 GB, 500 GB veya 2 TB) anında tanımlanır. Mevcut tüm dosyalarınız korunur.",
    },
    {
      q: "Planımı istediğim zaman değiştirebilir veya iptal edebilir miyim?",
      a: "Evet. Ayarlar panelinizden dilediğiniz an paketinizi yükseltebilir, düşürebilir veya aboneliğinizi sonlandırabilirsiniz.",
    },
    {
      q: "Hangi ödeme yöntemleri destekleniyor?",
      a: "Tüm yerli ve uluslararası kredi/banka kartları (Troy, Visa, MasterCard), Sanal POS altyapısı ve 3D Secure güvenli ödeme desteklenmektedir.",
    },
    {
      q: "Ücretsiz plandaki kısıtlamalar nelerdir?",
      a: "Ücretsiz planda 2 GB depolama alanı, maksimum 100 MB tekil dosya yükleme boyutu, aynı anda 1 adet aktif paylaşım linki ve maksimum 12 saat geçerlilik süresi bulunmaktadır.",
    },
    {
      q: "Depolama kotam dolduğunda ne olur?",
      a: "Mevcut paylaşım linkleriniz ve dosyalarınız çalışmaya devam eder. Ancak yeni dosya yüklemek için bazı dosyaları silmeniz veya paketinizi yükseltmeniz gerekir.",
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-12 max-w-7xl mx-auto">
      {/* Hero Header with Arc */}
      <div className="space-y-4">
        <SectionHeader
          label="Yeni Nesil Güvenli Bulut Depolama & Paylaşım"
          title="Şeffaf ve Esnek Fiyatlandırma."
          subtitle="İster bireysel hızlı transferler, ister 2 TB kurumsal güvenli bulut alanı. İhtiyacınıza en uygun paketi seçin."
          icon={Crown}
        />

        {/* Monthly / Yearly Billing Toggle */}
        <div className="flex justify-center -mt-4">
          <div className="inline-flex items-center p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl shadow-xl">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === "monthly"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Aylık Ödeme
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === "yearly"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>Yıllık Ödeme</span>
              <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
                2 Ay Bedava
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan) => {
          const isCurrentPlan = user?.subscriptionTier === plan.id;
          const limits = TIER_LIMITS[plan.id];
          const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
          const period = billingCycle === "yearly" ? "/yıl" : "/ay";

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl border p-6 sm:p-7 flex flex-col justify-between transition-all apple-card ${
                plan.popular
                  ? "border-purple-500/60 bg-gradient-to-b from-purple-950/40 via-zinc-900/70 to-zinc-950 shadow-2xl shadow-purple-500/10 ring-1 ring-purple-500/30"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-sky-400 to-purple-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="space-y-6">
                {/* Plan Header */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed min-h-[36px]">
                    {plan.tagline}
                  </p>
                </div>

                {/* Storage Pill */}
                <div className="inline-flex items-center gap-2 rounded-xl bg-zinc-950/80 border border-zinc-800 px-3 py-1.5 text-xs font-bold text-sky-400">
                  <HardDrive className="h-3.5 w-3.5" />
                  <span>{plan.quotaLabel} Yüksek Hızlı Depolama</span>
                </div>

                {/* Price in TL */}
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    {price === 0 ? "0 ₺" : `${price} ₺`}
                  </span>
                  {price > 0 && (
                    <span className="text-xs font-semibold text-zinc-400 font-mono">{period}</span>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Paket Detayları:
                  </span>
                  <ul className="space-y-2.5">
                    {limits.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feat}</span>
                      </li>
                    ))}
                    {limits.limitations.map((lim, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-500">
                        <XCircle className="h-4 w-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-zinc-800/80">
                {isCurrentPlan ? (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full text-xs rounded-xl bg-zinc-900 border-zinc-700 text-zinc-400"
                  >
                    Mevcut Paketiniz
                  </Button>
                ) : plan.id === "free" ? (
                  <Link href={user ? "/dashboard" : "/register"} className="block w-full">
                    <Button variant="outline" className="w-full text-xs rounded-xl">
                      Ücretsiz Başla
                    </Button>
                  </Link>
                ) : (
                  <Link
                    href={`/checkout?plan=${plan.id}&billing=${billingCycle}`}
                    className="block w-full"
                  >
                    <Button
                      variant="primary"
                      className={`w-full text-xs rounded-xl gap-1.5 ${
                        plan.popular ? "shadow-lg shadow-purple-500/20" : ""
                      }`}
                    >
                      <span>{plan.name} Paketini Seç</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Highlights */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Badge variant="outline" className="text-[11px] font-mono border-sky-500/30 text-sky-400">
            TÜM PAKETLERDE STANDART
          </Badge>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Güvenlikten ve Hızdan Asla Ödün Vermeyin
          </h2>
          <p className="text-xs text-zinc-400">
            NearDrop altyapısında tüm verileriniz en yüksek şifreleme ve gizlilik standartlarıyla korunur.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="flex gap-4 items-start p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white">Uçtan Uca Şifreleme</h3>
              <p className="text-[11px] text-zinc-400">
                AES-256-GCM ve Zero-Knowledge mimarisi ile dosyalarınızı yalnızca siz ve paylaştığınız kişiler açabilir.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white">Global Cloudflare R2 & CDN</h3>
              <p className="text-[11px] text-zinc-400">
                280+ küresel uç nokta üzerinden bekleme süresi olmadan ışık hızında yükleme ve doğrudan akış indirme.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex-shrink-0">
              <InfinityIcon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white">Sınırsız Yerel Ağ Transferi</h3>
              <p className="text-[11px] text-zinc-400">
                Aynı Wi-Fi ağındaki cihazlar arasında internet kotası harcamadan 450+ Mbps hızla sınırsız aktarım.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white">Sıkça Sorulan Sorular</h2>
          <p className="text-xs text-zinc-400">Paketler, faturalandırma ve kullanım hakkında merak edilenler.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold text-zinc-200 hover:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                    openFaq === idx ? "rotate-180 text-sky-400" : ""
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
