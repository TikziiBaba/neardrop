"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  User,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Check,
  HardDrive,
  ShieldCheck,
  Zap,
  Crown,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/context";
import { useLanguage } from "@/lib/i18n/context";
import { PRICING_PLANS } from "@/lib/subscription/plans";
import { TIER_LIMITS } from "@/lib/subscription/permissions";
import { SubscriptionTier } from "@/types";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { register, signInWithOAuth } = useAuth();
  const { t } = useLanguage();

  // Wizard Step: 1 = Account Credentials, 2 = Plan Selection
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 Form fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 2 Selection
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("free");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Validate step 1 and proceed to step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Lütfen tüm alanları eksiksiz doldurunuz.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler birbiriyle uyuşmuyor.");
      return;
    }

    if (password.length < 6) {
      setError("Şifreniz en az 6 karakter olmalıdır.");
      return;
    }

    setStep(2);
  };

  // Final submission on Step 2
  const handleFinalSubmit = async (tierToRegister: SubscriptionTier = selectedTier) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await register(email.trim(), password, displayName.trim(), tierToRegister);
      if (!res.success) {
        setError(res.error || "Kayıt işlemi gerçekleştirilemedi.");
        setIsLoading(false);
        return;
      }

      if (tierToRegister === "free") {
        toast.success("Hesabınız başarıyla oluşturuldu! Hoş geldiniz.");
        router.push("/dashboard");
      } else {
        toast.success("Hesabınız oluşturuldu! Şimdi ödeme adımına aktarılıyorsunuz...");
        router.push(`/checkout?plan=${tierToRegister}&billing=${billingCycle}`);
      }
    } catch (err: any) {
      setError(err.message || "Kayıt sırasında bir hata oluştu.");
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsSocialLoading(provider);
    try {
      const res = await signInWithOAuth(provider);
      if (!res.success) {
        toast.error(res.error || `${provider} ile kayıt başlatılamadı`);
      }
    } catch (err: any) {
      toast.error(err.message || "Sosyal giriş hatası");
    } finally {
      setIsSocialLoading(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative">
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />

      <div className="relative w-full max-w-5xl space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-1 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">NearDrop</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {step === 1 ? "NearDrop Hesabı Oluşturun" : "Abonelik Planınızı Belirleyin"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            {step === 1
              ? "Saniyeler içinde kaydolun, 2. adımda size en uygun planı seçerek hemen başlayın."
              : "İhtiyacınıza en uygun depolama ve transfer planını seçin. İstediğiniz an değiştirebilirsiniz."}
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                step === 1
                  ? "bg-sky-500/20 border border-sky-500/40 text-sky-400"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-400 cursor-pointer"
              }`}
              onClick={() => setStep(1)}
            >
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[10px] font-bold text-black">
                1
              </span>
              <span>Hesap Bilgileri</span>
            </div>

            <div className="w-6 h-px bg-zinc-800" />

            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                step === 2
                  ? "bg-sky-500/20 border border-sky-500/40 text-sky-400"
                  : "bg-zinc-900 border border-zinc-800 text-zinc-500"
              }`}
            >
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                step === 2 ? "bg-sky-500 text-black" : "bg-zinc-800 text-zinc-400"
              }`}>
                2
              </span>
              <span>Plan & Abonelik</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="max-w-md mx-auto flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: CREDENTIALS & ACCOUNT CREATION                   */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="max-w-md mx-auto rounded-3xl border border-zinc-800/90 bg-zinc-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5 animate-in fade-in">
            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={Boolean(isSocialLoading)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800/60 hover:text-white transition-all shadow-sm group"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 12.2 0 15s.7 5.4 1.9 7.8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.2 7.5 23 12 23z"
                  />
                </svg>
                <span>{isSocialLoading === "google" ? "Bağlanıyor..." : "Google"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("github")}
                disabled={Boolean(isSocialLoading)}
                className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800/60 hover:text-white transition-all shadow-sm group"
              >
                <svg className="h-4 w-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>{isSocialLoading === "github" ? "Bağlanıyor..." : "GitHub"}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-zinc-800" />
              <span className="absolute bg-zinc-900 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                veya e-posta ile devam edin
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleProceedToStep2} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Ad Soyad</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Adınız Soyadınız"
                    className="pl-10 text-xs rounded-2xl bg-zinc-950/60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@domain.com"
                    className="pl-10 text-xs rounded-2xl bg-zinc-950/60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="pl-10 text-xs rounded-2xl bg-zinc-950/60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Şifre Tekrar</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Şifrenizi doğrulayın"
                    className="pl-10 text-xs rounded-2xl bg-zinc-950/60"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full gap-2 text-xs font-bold rounded-2xl shadow-lg shadow-sky-500/20 mt-2"
              >
                <span>Devam Et: Planını Seç</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-zinc-800/80">
              <p className="text-xs text-zinc-400">
                Zaten bir hesabınız var mı?{" "}
                <Link href="/login" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                  Giriş Yapın
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: PLAN & SUBSCRIPTION SELECTION (TL / ₺)           */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center p-1 rounded-2xl bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl shadow-xl">
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

            {/* 4 Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {PRICING_PLANS.map((plan) => {
                const isSelected = selectedTier === plan.id;
                const limits = TIER_LIMITS[plan.id];
                const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
                const period = billingCycle === "yearly" ? "/yıl" : "/ay";

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedTier(plan.id)}
                    className={`relative rounded-3xl border p-5 sm:p-6 flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-sky-500 bg-gradient-to-b from-sky-950/40 via-zinc-900/90 to-zinc-950 ring-2 ring-sky-500 shadow-2xl shadow-sky-500/10 scale-[1.02]"
                        : plan.popular
                        ? "border-purple-500/50 bg-zinc-900/80 hover:border-purple-400/80"
                        : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-gradient-to-r from-sky-400 to-purple-500 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Plan Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-bold text-white">{plan.name}</h3>
                          <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                            {plan.tagline}
                          </p>
                        </div>
                        <div className={`flex h-5 w-5 rounded-full border items-center justify-center transition-colors ${
                          isSelected ? "border-sky-400 bg-sky-500 text-black" : "border-zinc-700 bg-zinc-800"
                        }`}>
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Storage Quota Pill */}
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 text-xs font-bold text-sky-400">
                        <HardDrive className="h-3.5 w-3.5" />
                        <span>{plan.quotaLabel} Depolama</span>
                      </div>

                      {/* Price in TL */}
                      <div className="flex items-baseline gap-1 pt-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-white">
                          {price === 0 ? "Ücretsiz" : `${price} ₺`}
                        </span>
                        {price > 0 && (
                          <span className="text-xs font-semibold text-zinc-400 font-mono">{period}</span>
                        )}
                      </div>

                      {/* Key features */}
                      <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                        <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                          Paket Özellikleri:
                        </div>
                        <ul className="space-y-1.5 text-xs text-zinc-300">
                          {limits.features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span className="leading-tight">{f}</span>
                            </li>
                          ))}
                          {limits.limitations.length > 0 && limits.limitations.slice(0, 2).map((l, i) => (
                            <li key={i} className="flex items-start gap-2 text-zinc-500">
                              <XCircle className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0 mt-0.5" />
                              <span className="leading-tight">{l}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Card Action Button */}
                    <div className="pt-5 mt-4 border-t border-zinc-800/60">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTier(plan.id);
                          handleFinalSubmit(plan.id);
                        }}
                        disabled={isLoading}
                        variant={isSelected ? "primary" : plan.popular ? "outline" : "ghost"}
                        className={`w-full text-xs h-9 font-bold rounded-xl ${
                          isSelected ? "shadow-md shadow-sky-500/20" : "border-zinc-700 text-zinc-200"
                        }`}
                      >
                        {isLoading && selectedTier === plan.id ? (
                          "Kaydediliyor..."
                        ) : plan.id === "free" ? (
                          "Ücretsiz Başla"
                        ) : (
                          `${plan.name} ile Başla`
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Geri: Hesap Bilgilerini Düzenle</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">
                  Seçilen: <strong className="text-white">{TIER_LIMITS[selectedTier].name}</strong>
                </span>
                <Button
                  type="button"
                  variant="primary"
                  size="default"
                  onClick={() => handleFinalSubmit(selectedTier)}
                  disabled={isLoading}
                  className="gap-2 text-xs font-bold rounded-xl shadow-lg shadow-sky-500/25 px-6"
                >
                  {isLoading ? (
                    "İşleniyor..."
                  ) : selectedTier === "free" ? (
                    <>
                      <span>Ücretsiz Hesabı Oluştur</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Seçimi Onayla & Ödemeye Geç</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
