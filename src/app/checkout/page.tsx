"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PRICING_PLANS } from "@/lib/subscription/plans";
import { TIER_LIMITS } from "@/lib/subscription/permissions";
import { useAuth } from "@/lib/auth/context";
import {
  Sparkles,
  ShieldCheck,
  CreditCard,
  ArrowLeft,
  HardDrive,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  MapPin,
  RefreshCw,
  ChevronRight,
  Zap,
  Check,
  Building,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

declare global {
  interface Window {
    iFrameResize?: any;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateProfile } = useAuth();

  const planId = searchParams.get("plan") || "pro";
  const billingCycle = (searchParams.get("billing") || "monthly") as "monthly" | "yearly";
  const paymentStatus = searchParams.get("status"); // "success" | "failed" | null
  const orderId = searchParams.get("oid") || "";

  const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[1];
  const limits = TIER_LIMITS[plan.id];
  const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;

  // Billing Contact inputs required by PayTR
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("İstanbul");
  const [isAgreed, setIsAgreed] = useState(true);

  // PayTR iFrame state
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [paytrToken, setPaytrToken] = useState<string | null>(null);

  // Update profile on successful return
  useEffect(() => {
    if (paymentStatus === "success" && user) {
      // Update local profile state
      updateProfile({
        subscriptionTier: plan.id,
        subscriptionStatus: "active",
        quotaBytes: plan.quotaBytes,
        role: user.role === "admin" || user.role === "moderator" ? user.role : "premium",
      }).catch(console.error);
    }
  }, [paymentStatus, plan.id, plan.quotaBytes, updateProfile, user]);

  // Break out of PayTR iframe if payment succeeded
  useEffect(() => {
    if (paymentStatus === "success" && typeof window !== "undefined") {
      try {
        if (window.self !== window.top && window.top) {
          window.top.location.href = window.location.href;
        }
      } catch (e) {
        console.warn("Iframe breakout notice:", e);
      }
    }
  }, [paymentStatus]);

  // Hook PayTR iframe resize once loaded
  useEffect(() => {
    if (paytrToken && typeof window !== "undefined" && window.iFrameResize) {
      try {
        window.iFrameResize({ checkOrigin: false }, "#paytriframe");
      } catch (err) {
        console.warn("PayTR iframe resizer notice:", err);
      }
    }
  }, [paytrToken]);

  // If not logged in, show Apple-grade login prompt
  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[28px] border border-white/10 bg-zinc-950/70 p-8 sm:p-10 text-center max-w-md space-y-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl"
        >
          <div className="h-14 w-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center mx-auto text-sky-400">
            <Lock className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Giriş Yapmanız Gerekiyor</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              <strong className="text-zinc-200">{plan.name}</strong> aboneliğinizi başlatmak ve kotanızı yükseltmek için lütfen hesabınıza giriş yapın.
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <Link href={`/login?redirect=/checkout?plan=${plan.id}&billing=${billingCycle}`}>
              <Button variant="primary" className="w-full text-xs rounded-xl py-3 font-semibold">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full text-xs rounded-xl py-3 border-white/10 text-zinc-300">
                Ücretsiz Hesap Oluştur
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // SUCCESS STATE (Apple Pay-Inspired Elegant Full-Screen Radial Waves)
  if (paymentStatus === "success") {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Full-Screen Radiating Emerald Waves */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center">
          {/* Ambient full-bleed emerald radial backdrop glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22)_0%,rgba(6,78,59,0.08)_45%,transparent_75%)]" />

          {/* Wave Ring 1 */}
          <motion.div
            initial={{ scale: 0.15, opacity: 0.9 }}
            animate={{ scale: [0.15, 2.2, 4.5], opacity: [0.9, 0.45, 0] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: [0.16, 1, 0.3, 1], repeatDelay: 0.2 }}
            className="absolute w-[500px] h-[500px] rounded-full border-2 border-emerald-400/50 bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent blur-sm"
          />

          {/* Wave Ring 2 */}
          <motion.div
            initial={{ scale: 0.15, opacity: 0.9 }}
            animate={{ scale: [0.15, 2.2, 4.5], opacity: [0.9, 0.45, 0] }}
            transition={{ duration: 3.6, delay: 1.2, repeat: Infinity, ease: [0.16, 1, 0.3, 1], repeatDelay: 0.2 }}
            className="absolute w-[500px] h-[500px] rounded-full border border-emerald-300/40 bg-emerald-500/10 blur-md"
          />

          {/* Wave Ring 3 */}
          <motion.div
            initial={{ scale: 0.15, opacity: 0.9 }}
            animate={{ scale: [0.15, 2.2, 5], opacity: [0.9, 0.35, 0] }}
            transition={{ duration: 3.6, delay: 2.4, repeat: Infinity, ease: [0.16, 1, 0.3, 1], repeatDelay: 0.2 }}
            className="absolute w-[500px] h-[500px] rounded-full border border-teal-400/30 bg-teal-400/5 blur-lg"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[36px] border border-emerald-500/35 bg-zinc-950/90 p-8 sm:p-12 text-center max-w-lg w-full space-y-7 shadow-[0_30px_100px_rgba(16,185,129,0.25)] backdrop-blur-3xl relative z-10 overflow-hidden"
        >
          {/* Subtle top specular sheen */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

          {/* Centerpiece: Glowing Checkmark with Spring Entry and Draw */}
          <div className="relative flex items-center justify-center mx-auto my-2">
            {/* Ambient emerald radial aura */}
            <div className="absolute -inset-6 rounded-full bg-emerald-500/35 blur-2xl animate-pulse pointer-events-none" />

            {/* Frosted concentric glass ring */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              className="relative h-28 w-28 rounded-full bg-emerald-950/50 border border-emerald-500/40 backdrop-blur-2xl flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.45)] ring-2 ring-emerald-400/20"
            >
              {/* Inner glowing emerald checkmark sphere */}
              <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.6)] border border-emerald-200/50">
                <motion.svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 text-white stroke-[3.5]"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <motion.path
                    d="M5 13l4 4L19 7"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                  />
                </motion.svg>
              </div>
            </motion.div>
          </div>

          <div className="space-y-2.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" /> 3D Secure İle Onaylandı
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tebrikler, {plan.name} Aktif!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
              Bulut depolama alanınız anında <strong className="text-emerald-400 font-bold">{plan.quotaLabel}</strong> seviyesine yükseltildi. Tüm ayrıcalıklar hesabınıza tanımlandı.
            </p>
          </div>

          {orderId && (
            <div className="py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] text-zinc-400 font-mono tracking-wider">
              Sipariş Kodu: <span className="text-zinc-100 font-bold">{orderId}</span>
            </div>
          )}

          {/* Action Buttons: Guaranteed Top-Level Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="/dashboard"
              target="_top"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  if (window.top) window.top.location.href = "/dashboard";
                  else window.location.href = "/dashboard";
                }
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold rounded-2xl py-4 px-6 text-white bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-[0_10px_35px_-10px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all cursor-pointer z-20"
            >
              <Sparkles className="h-4 w-4" />
              <span>Dashboard&apos;a Git</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/settings"
              target="_top"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  if (window.top) window.top.location.href = "/settings";
                  else window.location.href = "/settings";
                }
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold rounded-2xl py-4 px-6 text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 active:scale-[0.98] transition-all cursor-pointer z-20"
            >
              <span>Abonelik Detayları</span>
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // FAILED STATE
  if (paymentStatus === "failed") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[32px] border border-rose-500/30 bg-zinc-950/80 p-8 sm:p-12 text-center max-w-md space-y-6 shadow-[0_30px_90px_rgba(244,63,94,0.15)] backdrop-blur-3xl"
        >
          <div className="h-18 w-18 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="h-10 w-10 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Ödeme Tamamlanamadı
            </h1>
            <p className="text-xs text-zinc-300 leading-relaxed">
              İşlem bankanız tarafından onaylanmadı veya SMS doğrulaması tamamlanamadı. Kartınızdan herhangi bir ücret tahsil edilmemiştir.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              variant="primary"
              onClick={() => {
                setPaytrToken(null);
                if (typeof window !== "undefined") {
                  if (window.top) window.top.location.href = `/checkout?plan=${plan.id}&billing=${billingCycle}`;
                  else router.push(`/checkout?plan=${plan.id}&billing=${billingCycle}`);
                }
              }}
              className="w-full text-xs rounded-xl py-3.5 font-bold"
            >
              Tekrar Dene
            </Button>
            <a
              href="/pricing"
              target="_top"
              onClick={(e) => {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  if (window.top) window.top.location.href = "/pricing";
                  else window.location.href = "/pricing";
                }
              }}
              className="w-full inline-flex items-center justify-center text-xs rounded-xl py-3.5 border border-white/10 text-zinc-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Paketlere Dön
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // Request PayTR Token & start payment
  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length < 10) {
      toast.error("Lütfen 3D Secure SMS onayı için geçerli bir cep telefonu numarası girin.");
      return;
    }

    if (!isAgreed) {
      toast.error("Lütfen Mesafeli Satış ve Ön Bilgilendirme şartlarını onaylayın.");
      return;
    }

    setIsLoadingToken(true);

    try {
      const res = await fetch("/api/payment/paytr/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: fullName.trim() || user.email?.split("@")[0],
          userPhone: cleanDigits,
          userAddress: `${city}, Türkiye`,
          planId: plan.id,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        setPaytrToken(data.token);
        toast.success("PayTR 3D Secure güvenli ödeme terminali açılıyor...");
      } else {
        toast.error(data.error || "Ödeme oturumu açılamadı. Lütfen bilgilerinizi kontrol edin.");
      }
    } catch (err: any) {
      toast.error(err.message || "Bağlantı hatası oluştu.");
    } finally {
      setIsLoadingToken(false);
    }
  };

  return (
    <>
      {/* PayTR official iframe auto-resizer script */}
      <Script
        src="https://www.paytr.com/js/iframeResizer.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined" && window.iFrameResize) {
            try {
              window.iFrameResize({ checkOrigin: false }, "#paytriframe");
            } catch (e) {
              console.warn("PayTR iframeResizer load notice:", e);
            }
          }
        }}
      />

      <div className="min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-white/20 transition-all backdrop-blur-xl group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Paket Seçimine Dön</span>
          </Link>

          {/* Micro trust indicators */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> 256-Bit SSL
            </span>
            <span className="text-zinc-600">•</span>
            <span>3D Secure Onayı</span>
            <span className="text-zinc-600">•</span>
            <span>BDDK Lisanslı Altyapı</span>
          </div>
        </div>

        {/* PAYTR IFRAME STAGE (Full-Width Focused Apple Stage) */}
        {paytrToken ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto space-y-5"
          >
            {/* Top Bar for iFrame */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaytrToken(null)}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-white/5"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Bilgileri Değiştir</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 border border-sky-500/25 text-sky-300 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {plan.name} • {price} ₺ ({billingCycle === "yearly" ? "Yıllık" : "Aylık"})
                </span>
              </div>
            </div>

            {/* Glass Container with FULL SCROLL FREEDOM */}
            <div className="rounded-[32px] border border-white/10 bg-zinc-950/85 p-2 sm:p-5 shadow-[0_30px_90px_rgba(0,0,0,0.85)] backdrop-blur-3xl relative">
              {/* Inner wrapper with smooth vertical scrolling */}
              <div
                className="w-full rounded-[24px] bg-white/[0.02] border border-white/5 overflow-y-auto overflow-x-hidden"
                style={{
                  maxHeight: "calc(88vh - 120px)",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {/* 
                  scrolling="yes" allows internal PayTR scrolling.
                  min-height 760px ensures ample space for card form + 3D secure SMS button.
                */}
                <iframe
                  src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
                  id="paytriframe"
                  frameBorder="0"
                  scrolling="yes"
                  className="w-full min-h-[760px] sm:min-h-[800px] border-0 rounded-2xl block"
                  title="PayTR Güvenli Ödeme Terminali"
                />
              </div>

              {/* Bottom security strip */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-400 pt-4 pb-2">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" /> 3D Secure Koruması
                </span>
                <span className="text-zinc-600">•</span>
                <span className="font-mono text-zinc-300">Troy • Visa • MasterCard</span>
                <span className="text-zinc-600">•</span>
                <span>PayTR Ödeme ve Elektronik Para Kuruluşu A.Ş.</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* PRE-PAYMENT: Grouped Apple Details & Bento Order Summary */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Aboneliğinizi Başlatın
                </h1>
                <p className="text-xs text-zinc-400">
                  Depolama alanınız anında <strong className="text-sky-400 font-semibold">{plan.quotaLabel}</strong> seviyesine yükseltilecektir.
                </p>
              </div>

              <form
                onSubmit={handleStartPayment}
                className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6 sm:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center text-sky-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Fatura & İletişim Bilgileri
                      </h3>
                      <p className="text-[11px] text-zinc-400">3D Secure SMS doğrulaması için gereklidir</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    <ShieldCheck className="h-3 w-3" />
                    <span>3D Secure</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Ad Soyad</span>
                    </label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Kart üzerindeki isim"
                      className="rounded-xl text-xs bg-white/[0.03] border-white/10 font-medium focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-white placeholder:text-zinc-600 py-3"
                      required
                    />
                  </div>

                  {/* Phone and City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Cep Telefonu (SMS için)</span>
                      </label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05XXXXXXXXX"
                        maxLength={15}
                        className="rounded-xl text-xs bg-white/[0.03] border-white/10 font-mono focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-white placeholder:text-zinc-600 py-3"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                        <span>Şehir</span>
                      </label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="İstanbul"
                        className="rounded-xl text-xs bg-white/[0.03] border-white/10 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 text-white placeholder:text-zinc-600 py-3"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-300">E-Posta Adresi (Hesap & Fatura)</label>
                      <span className="text-[10px] font-semibold text-sky-400">Doğrulanmış</span>
                    </div>
                    <Input
                      value={user.email}
                      disabled
                      className="rounded-xl text-xs bg-white/[0.02] border-white/5 text-zinc-400 font-mono py-3"
                    />
                  </div>

                  {/* Legal acceptance checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer text-[11px] text-zinc-400 leading-relaxed select-none group">
                      <input
                        type="checkbox"
                        checked={isAgreed}
                        onChange={(e) => setIsAgreed(e.target.checked)}
                        className="mt-0.5 rounded-md border-white/20 bg-zinc-900 text-sky-500 focus:ring-0 h-4 w-4 transition-colors"
                      />
                      <span>
                        <Link href="/terms" target="_blank" className="text-sky-400 hover:underline">
                          Mesafeli Satış Sözleşmesi
                        </Link>
                        &apos;ni ve{" "}
                        <Link href="/privacy" target="_blank" className="text-sky-400 hover:underline">
                          Ön Bilgilendirme Formu
                        </Link>
                        &apos;nu okudum, kabul ediyorum.
                      </span>
                    </label>
                  </div>

                  {/* Submit CTA Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={isLoadingToken}
                      className="w-full text-xs sm:text-sm rounded-2xl py-4 font-bold gap-2 text-white bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-[0_10px_35px_-10px_rgba(14,165,233,0.5)] transition-all active:scale-[0.99] cursor-pointer"
                    >
                      {isLoadingToken ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>PayTR Güvenli Ödeme Ekranı Hazırlanıyor...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4 text-emerald-300" />
                          <span>PayTR ile Güvenli Ödemeye Geç • {price} ₺</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-[11px] text-center text-zinc-500 leading-snug">
                    Ödemeniz PayTR 256-Bit SSL altyapısı ve banka 3D Secure SMS onayı ile güvence altındadır. Kart bilgileriniz sunucularımızda asla saklanmaz.
                  </p>
                </div>
              </form>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-6 sm:p-7 space-y-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-3xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-300">
                    Sipariş Özeti
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Anında Aktivasyon
                  </span>
                </div>

                {/* Selected Plan Bento */}
                <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-500/10 to-sky-950/20 p-4 space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-base text-white">{plan.name}</h4>
                    <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-500/30">
                      {billingCycle === "yearly" ? "Yıllık Plan" : "Aylık Plan"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-sky-300 font-medium">
                    <HardDrive className="h-3.5 w-3.5 text-sky-400" />
                    <span>{plan.quotaLabel} Yüksek Hızlı Güvenli Bulut Alanı</span>
                  </div>
                </div>

                {/* Features Highlights */}
                <div className="space-y-2.5 pt-1">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Dahil Olan Özellikler:
                  </span>
                  <ul className="space-y-2">
                    {limits.features.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Abonelik Ücreti</span>
                    <span className="font-mono text-zinc-200 font-semibold">{price} ₺</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>KDV (%20)</span>
                    <span className="font-mono text-emerald-400 font-medium">Fiyata Dahil</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-3 border-t border-white/10">
                    <span>Toplam Tutar</span>
                    <div className="text-right">
                      <span className="text-xl text-sky-400 font-extrabold font-mono">{price} ₺</span>
                      <span className="text-[11px] text-zinc-400 block font-normal">
                        /{billingCycle === "yearly" ? "yıl" : "ay"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Apple Security Pill Box */}
              <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-4 space-y-2 text-xs text-zinc-400 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Güvenli Alışveriş Teminatı</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  Ödemeniz doğrudan bankanızın 3D Secure SMS doğrulama sayfası üzerinden gerçekleşir. İstediğiniz zaman ayarlarınızdan aboneliğinizi iptal edebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <RefreshCw className="h-4 w-4 animate-spin text-sky-400" />
            <span>Ödeme sayfası hazırlanıyor...</span>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
