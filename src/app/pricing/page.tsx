"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRICING_PLANS } from "@/lib/subscription/plans";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does storage quota expansion work?",
      a: "As soon as you upgrade to Pro, Ultra, or Enterprise, your Cloudflare R2 storage quota expands immediately up to 2 TB with zero downtime. Any previously uploaded files remain intact.",
    },
    {
      q: "Can I cancel or switch my plan at any time?",
      a: "Yes. You can upgrade, downgrade, or cancel your subscription at any point from your Settings panel without penalties.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support major Credit/Debit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, and localized digital payment methods.",
    },
    {
      q: "What happens if I reach my storage limit?",
      a: "If your storage is full, existing share links will continue working normally, but new file uploads will be paused until you either delete unused files or upgrade your quota.",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 space-y-16 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-1.5 text-xs font-semibold text-purple-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Generation Cloud Storage & Sharing</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Simple, transparent pricing. <br />
          <span className="bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Scale your storage seamlessly.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400">
          Choose the capacity that fits your workflow. From lightning LAN transfers to permanent 2 TB encrypted cloud hosting.
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="inline-flex items-center p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl shadow-xl mt-4">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              billingCycle === "monthly"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              billingCycle === "yearly"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <span>Annual Billing</span>
            <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan) => {
          const isCurrentPlan = user?.subscriptionTier === plan.id;
          const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
          const period = billingCycle === "yearly" ? "/year" : "/month";

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
                  <span>{plan.quotaLabel} High-Speed Storage</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white">
                    ${price}
                  </span>
                  <span className="text-xs font-semibold text-zinc-500">{period}</span>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Included Features:
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
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
                    Current Plan
                  </Button>
                ) : plan.id === "free" ? (
                  <Link href="/dashboard" className="block w-full">
                    <Button variant="outline" className="w-full text-xs rounded-xl">
                      Get Started Free
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
                        plan.popular
                          ? "bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30"
                          : ""
                      }`}
                    >
                      <span>Upgrade to {plan.name}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Matrix / Highlights */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 sm:p-10 space-y-8 apple-card">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Engineered for speed, privacy, and simplicity
          </h2>
          <p className="text-xs text-zinc-400">
            Every NearDrop plan comes standard with enterprise cryptographic protections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-5 space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Direct S3-Compatible Uploads</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Browser-to-Cloudflare-R2 direct upload bypasses server bottlenecks for maximum network saturation.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-5 space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Cryptographic Access Control</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Argon2 password hashing, one-time self-destruct download links, and automated expiration policies.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-5 space-y-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <InfinityIcon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Zero Ingress & Egress Fees</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Never pay extra for downloads. Share large datasets, videos, and archives with unlimited download traffic.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-400">Everything you need to know about our plans and billing.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                onClick={() => setOpenFaq(isOpen ? null : i)}
                className="cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition-all hover:border-zinc-700"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xs sm:text-sm font-bold text-white">{faq.q}</h3>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform ${
                      isOpen ? "rotate-180 text-purple-400" : ""
                    }`}
                  />
                </div>
                {isOpen && (
                  <p className="text-xs text-zinc-400 leading-relaxed pt-3 border-t border-zinc-800/60 mt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
