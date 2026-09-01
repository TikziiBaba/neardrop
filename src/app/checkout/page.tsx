"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICING_PLANS } from "@/lib/subscription/plans";
import { TIER_LIMITS } from "@/lib/subscription/permissions";
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
  CheckCircle2,
  Building,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateProfile } = useAuth();

  const planId = searchParams.get("plan") || "pro";
  const billingCycle = (searchParams.get("billing") || "monthly") as "monthly" | "yearly";

  const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[1];
  const limits = TIER_LIMITS[plan.id];
  const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;

  // POS Card Fields
  const [cardHolder, setCardHolder] = useState(user?.displayName || "");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Auto format card number with spaces (4-4-4-4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardNumber(formatted);
  };

  // Auto format expiry date MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center max-w-md space-y-4 shadow-2xl">
          <Lock className="h-8 w-8 text-purple-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Giriş Yapmanız Gerekiyor</h2>
          <p className="text-xs text-zinc-400">
            {plan.name} aboneliğinizi aktive etmek için lütfen hesabınıza giriş yapın veya yeni bir hesap oluşturun.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/login">
              <Button variant="primary" className="w-full text-xs rounded-xl">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full text-xs rounded-xl">
                Hesap Oluştur
              </Button>
            </Link>
          </div>
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
          cardHolder: cardHolder.trim(),
          cardLastFour: cardNumber.replace(/\s/g, "").slice(-4) || "0000",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${plan.name} aboneliğiniz başarıyla aktive edildi!`);
        await updateProfile({
          quotaBytes: plan.quotaBytes,
          role: data.role || "premium",
          subscriptionTier: plan.id,
          subscriptionStatus: "active",
        });
        router.push("/dashboard");
      } else {
        toast.error(data.error || data.message || "Abonelik işlemi gerçekleştirilemedi.");
      }
    } catch (err: any) {
      toast.error(err.message || "Ödeme sırasında bir hata oluştu.");
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
        <span>Fiyatlandırmaya Dön</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Payment & Card Form */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Aboneliğinizi Tamamlayın
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Bulut depolama alanınız anında <strong className="text-sky-400">{plan.quotaLabel}</strong> kapasiteye yükseltilecektir.
            </p>
          </div>

          {/* Virtual POS Integration Card */}
          <div className="rounded-3xl border border-sky-500/30 bg-sky-500/10 p-5 space-y-2.5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>
              <span>Sanal POS & 3D Secure Güvenli Ödeme Altyapısı</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Tüm ödemeler 256-Bit SSL şifreleme ve banka düzeyinde 3D Secure güvencesiyle gerçekleştirilir. Kredi kartı bilgileriniz sunucularımızda saklanmaz.
            </p>
          </div>

          <form onSubmit={handleCheckout} className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-5 apple-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <CreditCard className="h-4 w-4 text-sky-400" />
                <span>Kart Bilgileri</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 font-mono">Troy • Visa • Mastercard</span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 ml-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  3D Secure
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Kart Üzerindeki İsim</label>
                <Input
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Adınız Soyadınız"
                  className="rounded-xl text-xs bg-zinc-950/60 font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Kart Numarası</label>
                <div className="relative">
                  <Input
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="rounded-xl text-xs bg-zinc-950/60 font-mono tracking-wider pl-10"
                    required
                  />
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Son Kullanma (AA/YY)</label>
                  <Input
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="rounded-xl text-xs bg-zinc-950/60 font-mono text-center"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Güvenlik Kodu (CVV)</label>
                  <Input
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="•••"
                    maxLength={4}
                    type="password"
                    className="rounded-xl text-xs bg-zinc-950/60 font-mono text-center"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">E-Posta (Fatura ve Dekont)</label>
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
                  className="w-full text-xs rounded-xl py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-xl shadow-sky-500/25 gap-2 font-bold"
                >
                  <Zap className="h-4 w-4" />
                  <span>
                    {isProcessing ? "İşleniyor..." : `Ödemeyi Tamamla (${price} ₺)`}
                  </span>
                </Button>
              </div>

              <p className="text-[11px] text-center text-zinc-500">
                Siparişinizi tamamlayarak NearDrop Kullanım Koşulları ve Gizlilik Politikasını kabul etmiş olursunuz.
              </p>
            </div>
          </form>
        </div>

        {/* Right column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-7 space-y-5 apple-card shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400">
              Sipariş Özeti
            </h3>

            {/* Selected Plan card */}
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">{plan.name}</h4>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                  {billingCycle === "yearly" ? "Yıllık" : "Aylık"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
                <HardDrive className="h-3.5 w-3.5" />
                <span>{plan.quotaLabel} Yüksek Hızlı Güvenli Bulut Depolama</span>
              </div>
            </div>

            {/* Features check */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-semibold text-zinc-400">Paket Kapsamı:</span>
              <ul className="space-y-2">
                {limits.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-tight">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Total calculation in TL */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-800/80 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Ara Toplam</span>
                <span className="font-mono text-zinc-200">{price} ₺</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>KDV (%20)</span>
                <span className="font-mono text-emerald-400">Dahil</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2.5 border-t border-zinc-800">
                <span>Ödenecek Toplam Tutar</span>
                <span className="text-lg text-sky-400 font-extrabold font-mono">{price} ₺</span>
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
    <Suspense fallback={<div className="py-24 text-center text-zinc-400">Ödeme ekranı yükleniyor...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
