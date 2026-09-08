"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICING_PLANS } from "@/lib/subscription/plans";
import { TIER_LIMITS } from "@/lib/subscription/permissions";
import { useAuth } from "@/lib/auth/context";
import confetti from "canvas-confetti";
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
  AlertCircle,
  Clock,
  Info,
  Phone,
  User,
  MapPin,
  RefreshCw,
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

  // Fire confetti on successful return
  useEffect(() => {
    if (paymentStatus === "success" && user) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      // Update local profile state
      updateProfile({
        subscriptionTier: plan.id,
        subscriptionStatus: "active",
        quotaBytes: plan.quotaBytes,
        role: user.role === "admin" || user.role === "moderator" ? user.role : "premium",
      }).catch(console.error);
    }
  }, [paymentStatus, plan.id, plan.quotaBytes, updateProfile, user]);

  // If not logged in, ask to log in
  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center max-w-md space-y-4 shadow-2xl backdrop-blur-xl">
          <Lock className="h-8 w-8 text-sky-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Giriş Yapmanız Gerekiyor</h2>
          <p className="text-xs text-zinc-400">
            {plan.name} aboneliğinizi başlatmak için lütfen önce hesabınıza giriş yapın veya ücretsiz kayıt olun.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link href={`/login?redirect=/checkout?plan=${plan.id}&billing=${billingCycle}`}>
              <Button variant="primary" className="w-full text-xs rounded-xl">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full text-xs rounded-xl">
                Ücretsiz Hesap Oluştur
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS STATE
  if (paymentStatus === "success") {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="rounded-3xl border border-emerald-500/30 bg-zinc-900/90 p-8 sm:p-10 text-center max-w-lg space-y-6 shadow-2xl backdrop-blur-2xl">
          <div className="h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
              <Sparkles className="h-3 w-3" /> Ödeme Başarıyla Tamamlandı
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Tebrikler, {plan.name} Aktif Edildi!
            </h1>
            <p className="text-xs text-zinc-300 max-w-sm mx-auto leading-relaxed">
              Depolama kotanız anında <strong className="text-sky-400">{plan.quotaLabel}</strong> seviyesine yükseltildi ve tüm premium özellikler hesabınıza tanımlandı.
            </p>
          </div>

          {orderId && (
            <div className="py-2 px-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 font-mono">
              Sipariş Referansı: <span className="text-zinc-200">{orderId}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => router.push("/dashboard")}
              className="flex-1 text-xs rounded-xl py-3 font-bold"
            >
              Dashboard&apos;a Git
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/settings")}
              className="text-xs rounded-xl py-3"
            >
              Abonelik Ayarları
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // FAILED STATE
  if (paymentStatus === "failed") {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="rounded-3xl border border-rose-500/30 bg-zinc-900/90 p-8 sm:p-10 text-center max-w-md space-y-6 shadow-2xl backdrop-blur-2xl">
          <div className="h-16 w-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="h-9 w-9" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Ödeme Tamamlanamadı
            </h1>
            <p className="text-xs text-zinc-300 leading-relaxed">
              İşlem bankanız tarafından reddedildi veya 3D Secure doğrulaması iptal edildi. Kartınızdan herhangi bir ücret tahsil edilmemiştir.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="primary"
              onClick={() => {
                setPaytrToken(null);
                router.push(`/checkout?plan=${plan.id}&billing=${billingCycle}`);
              }}
              className="w-full text-xs rounded-xl py-3 font-bold"
            >
              Tekrar Dene
            </Button>
            <Link href="/pricing">
              <Button variant="outline" className="w-full text-xs rounded-xl py-3">
                Paketlere Dön
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Request PayTR Token & show iframe
  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone || phone.length < 10) {
      toast.error("Lütfen 3D Secure SMS onayı için geçerli bir telefon numarası girin.");
      return;
    }

    if (!isAgreed) {
      toast.error("Lütfen Mesafeli Satış ve Ön Bilgilendirme şartlarını kabul edin.");
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
          userPhone: phone.trim(),
          userAddress: `${city}, Türkiye`,
          planId: plan.id,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        setPaytrToken(data.token);
        toast.success("PayTR güvenli ödeme ekranı hazırlanıyor...");
      } else {
        toast.error(data.error || "Ödeme oturumu açılamadı. Lütfen tekrar deneyin.");
      }
    } catch (err: any) {
      toast.error(err.message || "Bağlantı hatası oluştu.");
    } finally {
      setIsLoadingToken(false);
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
        {/* Left Column: Checkout or PayTR iFrame */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Aboneliğinizi Başlatın
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Bulut depolama alanınız anında <strong className="text-sky-400">{plan.quotaLabel}</strong> seviyesine yükseltilecektir.
            </p>
          </div>

          {/* If PayTR token exists, render the PayTR iFrame */}
          {paytrToken ? (
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-4 sm:p-6 space-y-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>PayTR 256-Bit SSL & 3D Secure Güvenli Ödeme</span>
                </div>
                <button
                  onClick={() => setPaytrToken(null)}
                  className="text-xs text-zinc-400 hover:text-white underline"
                >
                  Bilgileri Değiştir
                </button>
              </div>

              {/* Secure iFrame Container */}
              <div className="w-full min-h-[580px] rounded-2xl overflow-hidden bg-white/5 relative">
                <iframe
                  src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
                  id="paytriframe"
                  frameBorder="0"
                  scrolling="no"
                  className="w-full min-h-[580px] rounded-2xl"
                  title="PayTR Güvenli Sanal POS"
                />
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5" /> 3D Secure Doğrulama
                </span>
                <span>•</span>
                <span>Troy, Visa, MasterCard Destekli</span>
                <span>•</span>
                <span>BDDK Lisanslı PayTR Altyapısı</span>
              </div>
            </div>
          ) : (
            /* Billing Details Form */
            <form onSubmit={handleStartPayment} className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-5 apple-card shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <CreditCard className="h-4 w-4 text-sky-400" />
                  <span>Fatura & Müşteri Bilgileri</span>
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
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Ad Soyad</span>
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="rounded-xl text-xs bg-zinc-950/60 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Telefon No (3D Secure SMS)</span>
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="05XXXXXXXXX"
                      maxLength={14}
                      className="rounded-xl text-xs bg-zinc-950/60 font-mono"
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
                      className="rounded-xl text-xs bg-zinc-950/60"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">E-Posta Adresi (Fatura ve Dekont)</label>
                  <Input
                    value={user.email}
                    disabled
                    className="rounded-xl text-xs bg-zinc-950/40 text-zinc-400 font-mono"
                  />
                </div>

                {/* Agreement checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-zinc-400 leading-snug">
                    <input
                      type="checkbox"
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-sky-500 focus:ring-0"
                    />
                    <span>
                      <Link href="/terms" target="_blank" className="text-sky-400 hover:underline">
                        Mesafeli Satış Sözleşmesi
                      </Link>
                      &apos;ni ve{" "}
                      <Link href="/privacy" target="_blank" className="text-sky-400 hover:underline">
                        Ön Bilgilendirme Formu
                      </Link>
                      &apos;nu okudum, onaylıyorum.
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isLoadingToken}
                    className="w-full text-xs rounded-xl py-3.5 font-bold gap-2 shadow-lg shadow-sky-500/20"
                  >
                    {isLoadingToken ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>PayTR Güvenli Ödeme Ekranı Hazırlanıyor...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 text-emerald-300" />
                        <span>PayTR ile Güvenli Ödemeye Geç ({price} ₺)</span>
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-[11px] text-center text-zinc-500 pt-1">
                  Ödemeniz BDDK lisanslı PayTR Sanal POS altyapısı ve 3D Secure SMS onayı ile güvenle gerçekleştirilir.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-7 space-y-5 apple-card shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400">
              Sipariş Özeti
            </h3>

            {/* Selected Plan card */}
            <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">{plan.name}</h4>
                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300 border border-sky-500/30">
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
              <span className="text-[11px] font-semibold text-zinc-400">Paket Ayrıcalıkları:</span>
              <ul className="space-y-2">
                {limits.features.slice(0, 5).map((f, i) => (
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
                <span>Ödenecek Tutar</span>
                <span className="text-lg text-sky-400 font-extrabold font-mono">{price} ₺</span>
              </div>
            </div>
          </div>

          {/* Security Guarantee Box */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Güvenli Ödeme Garantisi</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Kart bilgileriniz sunucularımızda asla tutulmaz. Tüm işlemler 256-Bit SSL şifreleme ve banka 3D Secure SMS onayı ile PayTR güvencesinde tamamlanır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-zinc-400">Ödeme sayfası yükleniyor...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
