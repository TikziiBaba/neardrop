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
      q: "Is NearDrop really 100% free to use?",
      a: "Yes! All users receive 1 TB of high-speed secure cloud storage, up to 50 GB single file uploads, permanent link capabilities, and encrypted password protection with zero cost.",
    },
    {
      q: "Do I need to enter a credit card?",
      a: "No credit card or payment information is required. You can sign up with your email or social login and start sharing files immediately.",
    },
    {
      q: "Are password protection and folder transfers included?",
      a: "Yes! Cryptographic SHA-256 password protection, ZIP bulk downloading, and folder streaming are completely free and available to all registered users.",
    },
    {
      q: "How long do my shared links remain active?",
      a: "You can set custom expiration periods (1 hour, 12 hours, 24 hours, 7 days, 30 days) or choose 'Permanent' for links that never expire.",
    },
    {
      q: "How secure is my data on NearDrop?",
      a: "All transfers utilize client-side end-to-end AES-256-GCM encryption and temporary presigned storage links isolated from the public internet.",
    },
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 space-y-12 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="space-y-4">
        <SectionHeader
          label="100% Free • Open • Unlimited Community Access"
          title="All Features Included. 0 ₺ Forever."
          subtitle="From 1 TB ultra-fast cloud storage to password protection and permanent links, enjoy complete freedom without subscriptions or paywalls."
          icon={Crown}
        />

        {/* Free Banner Pill */}
        <div className="flex justify-center -mt-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 backdrop-blur-xl shadow-lg">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>No credit card required. All enterprise features are completely unlocked.</span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PRICING_PLANS.map((plan) => {
          const isCurrentPlan = user?.subscriptionTier === plan.id;
          const limits = TIER_LIMITS[plan.id];

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl border p-6 sm:p-7 flex flex-col justify-between transition-all apple-card ${
                plan.popular
                  ? "border-sky-500/60 bg-gradient-to-b from-sky-950/40 via-zinc-900/70 to-zinc-950 shadow-2xl shadow-sky-500/10 ring-1 ring-sky-500/30"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-black shadow-md">
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

                {/* Price in TL */}
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400">
                    0 ₺
                  </span>
                  <span className="text-xs font-semibold text-zinc-400 font-mono">/forever free</span>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Included Features:
                  </span>
                  <ul className="space-y-2.5">
                    {limits.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-zinc-800/80">
                <Link href={user ? "/dashboard" : "/register"} className="block w-full">
                  <Button
                    variant="primary"
                    className="w-full text-xs rounded-xl gap-1.5 font-bold shadow-lg shadow-sky-500/20"
                  >
                    <span>{user ? "Open Dashboard" : "Start Free Now"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Highlights */}
      <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Badge variant="outline" className="text-[11px] font-mono border-sky-500/30 text-sky-400">
            STANDARD ON ALL PLANS
          </Badge>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Uncompromising Speed and Security
          </h2>
          <p className="text-xs text-zinc-400">
            NearDrop protects your assets with industry-leading encryption and global edge delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="flex gap-4 items-start p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white">End-to-End Encryption</h3>
              <p className="text-[11px] text-zinc-400">
                AES-256-GCM and zero-knowledge architecture ensure only you and authorized recipients access files.
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
                Over 280+ worldwide edge locations provide ultra-low latency streaming and instant uploads.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex-shrink-0">
              <InfinityIcon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white">Unlimited LAN Transfers</h3>
              <p className="text-[11px] text-zinc-400">
                Direct peer-to-peer transfers across your local Wi-Fi network at speeds of 450+ Mbps with zero bandwidth costs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-zinc-400">Everything you need to know about plans, billing, and storage.</p>
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
