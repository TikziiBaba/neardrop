"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICING_PLANS } from "@/lib/subscription/plans";
import { useAuth } from "@/lib/auth/context";
import { formatBytes } from "@/lib/utils";
import {
  Sparkles,
  ShieldCheck,
  CreditCard,
  Check,
  ArrowLeft,
  HardDrive,
  Lock,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateProfile } = useAuth();

  const planId = searchParams.get("plan") || "pro";
  const billingCycle = (searchParams.get("billing") || "monthly") as "monthly" | "yearly";

  const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[1];
  const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;

  const [cardHolder, setCardHolder] = useState(user?.displayName || "Ad Soyad");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-center max-w-md space-y-4">
          <Lock className="h-8 w-8 text-purple-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-zinc-400">
            Please log in or register to activate your {plan.name} subscription.
          </p>
          <Link href="/login">
            <Button variant="primary" className="w-full text-xs rounded-xl">
              Log In to Continue
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          planId: plan.id,
          billingCycle,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Upgraded to ${plan.name}!`);
        await updateProfile({
          quotaBytes: plan.quotaBytes,
          role: data.role || "premium",
          subscriptionTier: plan.id,
        });
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Subscription upgrade failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Checkout error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Pricing</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Complete your subscription
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Your storage quota will be instantly expanded to {plan.quotaLabel}.
            </p>
          </div>

          {/* Payment Gateway Integration Notice */}
          <div className="rounded-3xl border border-sky-500/30 bg-sky-500/10 p-5 space-y-2.5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span>Ödeme Altyapısı Entegrasyonu Devam Ediyor / Payment Gateway In Progress</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Kredi kartı ve dijital ödeme ağ geçidi altyapımız entegrasyon aşamasındadır. Çok yakında otomatik ödeme ve anında aktivasyon sistemi devreye alınacaktır.
            </p>
          </div>

          <form onSubmit={handleCheckout} className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-5 apple-card">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <CreditCard className="h-4 w-4 text-sky-400" />
                <span>Ödeme / Ön Kayıt Bilgileri</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                256-Bit SSL Koruması
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Kart Üzerindeki İsim</label>
                <Input
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Ad Soyad"
                  className="rounded-xl text-xs bg-zinc-950/60"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">E-Posta (Bildirim İçin)</label>
                <Input
                  value={user.email}
                  disabled
                  className="rounded-xl text-xs bg-zinc-950/40 text-zinc-400 font-mono"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isProcessing}
                  className="w-full text-xs rounded-xl py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-xl shadow-sky-500/25 gap-2 font-bold"
                >
                  <Zap className="h-4 w-4" />
                  <span>{isProcessing ? "İşleniyor..." : `Ön Kayıt Ol & Açıldığında Haberdar Et ($${price})`}</span>
                </Button>
              </div>

              <p className="text-[11px] text-center text-zinc-500">
                Ödeme sistemi canlıya alındığında e-posta adresinize bilgilendirme ve indirim kuponu iletilecektir.
              </p>
            </div>
          </form>
        </div>

        {/* Right column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-7 space-y-5 apple-card">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400">
              Order Summary
            </h3>

            {/* Selected Plan card */}
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">{plan.name}</h4>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                  {billingCycle === "yearly" ? "Annual" : "Monthly"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
                <HardDrive className="h-3.5 w-3.5" />
                <span>{plan.quotaLabel} High-Speed Secure Cloud Storage</span>
              </div>
            </div>

            {/* Features check */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-semibold text-zinc-400">Includes:</span>
              <ul className="space-y-1.5">
                {plan.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                    <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="truncate">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Total calculation */}
            <div className="space-y-2 pt-4 border-t border-zinc-800/80 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>${price}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Taxes & Fees</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800">
                <span>Total Due Today</span>
                <span className="text-base text-purple-400 font-extrabold">${price}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-zinc-400">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
