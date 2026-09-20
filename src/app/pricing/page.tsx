"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRICING_PLANS } from "@/lib/subscription/plans";
import { TIER_LIMITS } from "@/lib/subscription/permissions";
import { useAuth } from "@/lib/auth/context";
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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
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
      a: "The Free plan includes 2 GB of cloud storage, up to 100 MB single file uploads, 1 active share link at a time, and a maximum link lifespan of 12 hours.",
    },
    {
      q: "What happens if I reach my storage quota limit?",
      a: "Your existing files and links will continue to work normally. However, to upload new files, you will need to delete some existing files or upgrade your plan.",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      <LandingAmbient />
      <div className="relative z-10 py-14 sm:py-20 px-4 sm:px-6 lg:px-8 space-y-16 max-w-7xl mx-auto w-full">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="outline" className="rounded-full bg-white/90 border-[#d4d4d8] text-[#0071e3] text-xs font-bold px-3.5 py-1 shadow-sm">
            NearDrop Plans
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#09090b]">
            Transparent, Flexible Pricing.
          </h1>
          <p className="text-base sm:text-lg text-[#27272a] font-normal leading-relaxed">
            From fast personal transfers to 2 TB enterprise storage, choose the plan that fits your workflow.
          </p>

          {/* PayTR Security Notice Pill */}
          <div className="flex justify-center pt-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#e4e4e7] text-xs text-[#09090b] shadow-sm">
              <ShieldCheck className="h-4 w-4 text-[#16a34a]" />
              <span className="font-semibold">PayTR 256-Bit SSL & 3D Secure Güvencesi</span>
            </div>
          </div>

          {/* Monthly / Yearly Billing Segmented Control */}
          <div className="flex justify-center pt-3">
            <div className="inline-flex items-center p-1 rounded-full bg-[#e4e4e7]/80 border border-[#d4d4d8] shadow-inner">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  billingCycle === "monthly"
                    ? "bg-white text-[#09090b] shadow-sm"
                    : "text-[#27272a] hover:text-[#09090b] hover:bg-white/40"
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  billingCycle === "yearly"
                    ? "bg-white text-[#09090b] shadow-sm"
                    : "text-[#27272a] hover:text-[#09090b] hover:bg-white/40"
                }`}
              >
                <span>Annual Billing</span>
                <span className="rounded-full bg-[#0071e3]/10 px-2 py-0.5 text-[10px] font-bold text-[#0071e3]">
                  2 Months Free
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PRICING_PLANS.map((plan) => {
            const isCurrentPlan = user?.subscriptionTier === plan.id;
            const limits = TIER_LIMITS[plan.id];
            const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
            const period = billingCycle === "yearly" ? "/year" : "/mo";

            return (
              <div
                key={plan.id}
                className={`group relative rounded-[28px] p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] cursor-pointer ${
                  plan.popular
                    ? "bg-white/95 border-2 border-[#0071e3] shadow-[0_12px_40px_rgba(0,113,227,0.16)] ring-1 ring-[#0071e3]/30 hover:shadow-[0_24px_50px_rgba(0,113,227,0.25)]"
                    : "bg-white/90 border border-[#e4e4e7] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(0,113,227,0.12)] hover:border-[#0071e3]/50"
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
                    <h3 className="text-xl font-bold text-[#09090b] tracking-tight">{plan.name}</h3>
                    <p className="text-xs text-[#27272a] leading-relaxed min-h-[34px]">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Storage Pill */}
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#f0f4f9] border border-[#e4e4e7] px-3.5 py-1.5 text-xs font-bold text-[#09090b] shadow-sm">
                    <HardDrive className="h-3.5 w-3.5 text-[#0071e3]" />
                    <span>{plan.quotaLabel} High-Speed Storage</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[#09090b]">
                      {price === 0 ? "0 ₺" : `${price} ₺`}
                    </span>
                    {price > 0 && (
                      <span className="text-xs font-bold text-[#52525b]">{period}</span>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 pt-3 border-t border-[#e4e4e7]">
                    <span className="text-[11px] font-bold text-[#09090b] uppercase tracking-wider">
                      Plan Highlights
                    </span>
                    <ul className="space-y-2.5">
                      {limits.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-[#09090b] font-medium">
                          <CheckCircle2 className="h-4 w-4 text-[#0071e3] flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{feat}</span>
                        </li>
                      ))}
                      {limits.limitations.map((lim, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-[#71717a]">
                          <XCircle className="h-4 w-4 text-[#d4d4d8] flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{lim}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-6 mt-6 border-t border-[#e4e4e7]">
                  {isCurrentPlan ? (
                    <Button
                      variant="outline"
                      disabled
                      className="w-full text-xs rounded-full bg-[#f0f4f9] border-[#d4d4d8] text-[#71717a]"
                    >
                      Current Plan
                    </Button>
                  ) : plan.id === "free" ? (
                    <Link href={user ? "/dashboard" : "/register"} className="block w-full">
                      <Button
                        variant="outline"
                        className="w-full text-xs rounded-full border-[#d4d4d8] text-[#09090b] hover:border-[#0071e3] hover:text-[#0071e3] hover:bg-blue-50/50 font-bold"
                      >
                        Get Started Free
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
                            : "bg-[#09090b] hover:bg-black text-white hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.02]"
                        }`}
                      >
                        <span>Select {plan.name}</span>
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
        <div className="rounded-[28px] border border-[#d2d2d7]/60 bg-white p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.03)] space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="outline" className="rounded-full bg-[#f5f5f7] border-[#d2d2d7] text-[#1d1d1f] text-[11px] font-medium px-3 py-1">
              STANDARD ON ALL PLANS
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
              Uncompromising Speed and Security
            </h2>
            <p className="text-sm text-[#6e6e73]">
              NearDrop protects your assets with industry-leading cryptographic security and global edge delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="flex gap-4 items-start p-5 rounded-2xl bg-[#fbfbfd] border border-[#e8e8ed]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf4fe] text-[#0071e3] flex-shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#1d1d1f]">End-to-End Encryption</h3>
                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  AES-256-GCM and zero-knowledge architecture ensure only you and authorized recipients access files.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-5 rounded-2xl bg-[#fbfbfd] border border-[#e8e8ed]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eafbf0] text-[#34c759] flex-shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#1d1d1f]">Global Edge Cloud & CDN</h3>
                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  Küresel edge lokasyonları ile ultra düşük gecikme süreli doğrudan aktarım ve anında yükleme.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-5 rounded-2xl bg-[#fbfbfd] border border-[#e8e8ed]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5eefc] text-[#af52de] flex-shrink-0">
                <InfinityIcon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#1d1d1f]">Unlimited LAN Transfers</h3>
                <p className="text-xs text-[#6e6e73] leading-relaxed">
                  Direct peer-to-peer transfers across your local Wi-Fi network at speeds of 450+ Mbps with zero bandwidth costs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#6e6e73]">
              Everything you need to know about plans, billing, and storage.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-[#d2d2d7]/60 bg-white overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-[#1d1d1f] hover:text-[#0071e3] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#86868b] transition-transform duration-200 flex-shrink-0 ml-4 ${
                      openFaq === idx ? "rotate-180 text-[#0071e3]" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#6e6e73] leading-relaxed border-t border-[#f2f2f7] pt-3">
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
