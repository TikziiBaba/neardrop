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
  CheckCircle2,
  HardDrive,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { useLanguage } from "@/lib/i18n/context";
import { getPricingPlans } from "@/lib/subscription/plans";
import { SubscriptionTier } from "@/types";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { SoundManager } from "@/lib/utils/sound-effects";

export default function RegisterPage() {
  const router = useRouter();
  const { register, login, signInWithOAuth, resendVerificationEmail, verifyOtp } = useAuth();
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  // Stepper: 1 = Credentials, 2 = Plan Selection, 3 = OTP Verification
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const plans = getPricingPlans(isTr);

  // Step 1: Credentials
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: Plan Selection
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("free");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  // Step 3: OTP Code
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim() || !email.trim() || !password || !confirmPassword) {
      setError(isTr ? "Lütfen tüm zorunlu alanları doldurun." : "Please fill out all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError(isTr ? "Girdiğiniz parolalar eşleşmiyor." : "Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(isTr ? "Parola en az 6 karakter olmalıdır." : "Password must be at least 6 characters.");
      return;
    }

    SoundManager.play("pop");
    setStep(2);
  };

  const handleFinalSubmit = async (chosenTier: SubscriptionTier = selectedTier) => {
    setError(null);
    setIsLoading(true);
    SoundManager.play("click");

    try {
      const res = await register(email.trim(), password, displayName.trim(), chosenTier);

      if (!res.success) {
        setError(res.error || (isTr ? "Kayıt işlemi başarısız oldu." : "Registration failed."));
        setIsLoading(false);
        return;
      }

      if (res.requiresVerification) {
        setStep(3);
        SoundManager.play("chime");
        toast.info(isTr ? "Hesap oluşturuldu! Lütfen e-postanızı kontrol edin." : "Account created! Please check your email.");
      } else {
        SoundManager.play("success");
        toast.success(isTr ? "Hesabınız başarıyla oluşturuldu!" : "Account created successfully!");
        try {
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
        setTimeout(() => {
          router.push("/dashboard");
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || (isTr ? "Beklenmeyen bir hata oluştu." : "Registration error."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = otpCode.trim().replace(/\D/g, "");
    if (!cleanCode || isVerifyingOtp) return;
    setIsVerifyingOtp(true);
    setError(null);
    try {
      const res = await verifyOtp(email.trim(), cleanCode);
      if (res.success) {
        SoundManager.play("success");
        toast.success(isTr ? "E-posta doğrulandı! Hoş geldiniz!" : "Email verified! Welcome!");

        // Auto-login with password if available so session is active
        if (password) {
          const loginRes = await login(email.trim(), password);
          if (loginRes.success) {
            try {
              confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
            } catch (e) {}
            setTimeout(() => {
              router.push("/dashboard");
            }, 800);
            return;
          }
        }

        try {
          confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
        } catch (e) {}
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setError(res.error || (isTr ? "Geçersiz veya süresi dolmuş kod." : "Invalid code."));
      }
    } catch (err: any) {
      setError(err.message || "Doğrulama hatası.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const [isDirectConfirming, setIsDirectConfirming] = useState(false);

  const handleDirectConfirm = async () => {
    if (!email.trim() || isDirectConfirming) return;
    setIsDirectConfirming(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/confirm-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        SoundManager.play("success");
        toast.success(isTr ? "E-posta doğrulandı! Giriş yapılıyor..." : "Email verified! Logging in...");
        const loginRes = await login(email.trim(), password);
        if (loginRes.success) {
          try {
            confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
          } catch (e) {}
          setTimeout(() => {
            router.push("/dashboard");
          }, 800);
        } else {
          router.push("/login?verified=true");
        }
      } else {
        setError(data.error || "Doğrulama başarısız.");
      }
    } catch (err: any) {
      setError(err.message || "Hata oluştu.");
    } finally {
      setIsDirectConfirming(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim() || isResending || cooldown > 0) return;
    setIsResending(true);
    setError(null);
    try {
      const res = await resendVerificationEmail(email.trim());
      if (res.success) {
        toast.success(isTr ? `Doğrulama bağlantısı ${email} adresine iletildi!` : `Email resent to ${email}`);
        setCooldown(60);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(res.error || "E-posta gönderilemedi.");
      }
    } catch (err: any) {
      setError(err.message || "Hata oluştu.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    SoundManager.play("click");
    setIsSocialLoading(provider);
    try {
      const res = await signInWithOAuth(provider);
      if (!res.success) {
        toast.error(res.error || `${provider} ile bağlanılamadı.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Sosyal giriş hatası");
    } finally {
      setIsSocialLoading(null);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 select-none">
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#0071e3]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className={`relative z-10 w-full ${step === 2 ? "max-w-5xl" : "max-w-[440px]"} space-y-6 transition-all duration-300`}>
        {/* Apple ID Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-[#0071e3] to-[#43a047] p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-[#0071e3]">
                <ShieldCheck className="h-8 w-8" />
              </div>
            </div>
          </Link>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {step === 1
                ? isTr ? "Yeni NearDrop ID Oluşturun" : "Create Your NearDrop ID"
                : step === 2
                ? isTr ? "Bulut Depolama Planınızı Seçin" : "Select Your Storage Plan"
                : isTr ? "E-postanızı Doğrulayın" : "Verify Your Email"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
              {step === 1
                ? isTr ? "Tek bir hesapla güvenli dosya paylaşımı ve depolama dünyasına adım atın." : "One account to share, store, and manage files securely."
                : step === 2
                ? isTr ? "İhtiyacınıza uygun kapasiteyi belirleyin. Dilediğiniz an değiştirebilirsiniz." : "Choose the storage tier that matches your workflow."
                : isTr ? `Onay kodunu ${email} adresine ilettik.` : `We sent a confirmation link or code to ${email}.`}
            </p>
          </div>

          {/* Apple Stepper Pill */}
          {step < 3 && (
            <div className="flex justify-center pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-200 shadow-sm">
                <span className={`h-2 w-2 rounded-full ${step === 1 ? "bg-[#0071e3]" : "bg-emerald-500"}`} />
                <span>{isTr ? `Adım ${step} / 2` : `Step ${step} of 2`}</span>
              </div>
            </div>
          )}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 animate-in fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* ── STEP 1: CREDENTIALS ── */}
        {step === 1 && (
          <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5 animate-in fade-in">
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 overflow-hidden focus-within:border-[#0071e3] focus-within:ring-2 focus-within:ring-[#0071e3]/20 transition-all bg-zinc-950/70">
                {/* Name */}
                <div className="p-3 border-b border-zinc-800/80">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    {isTr ? "Adınız & Soyadınız" : "Full Name"}
                  </label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <User className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder={isTr ? "Adınız Soyadınız" : "John Appleseed"}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="p-3 border-b border-zinc-800/80">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    {isTr ? "E-posta Adresi" : "Email Address"}
                  </label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Mail className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="p-3 border-b border-zinc-800/80">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    {isTr ? "Parola (En az 6 karakter)" : "Password (Min 6 chars)"}
                  </label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Lock className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-zinc-400 hover:text-white p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="p-3">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    {isTr ? "Parolayı Onaylayın" : "Confirm Password"}
                  </label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Lock className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0071e3] py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#0077ed] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>{isTr ? "Devam Et (Plan Seçimi)" : "Continue (Choose Plan)"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-zinc-800" />
              <span className="absolute bg-zinc-900 px-3 text-[11px] font-medium text-zinc-400">
                {isTr ? "veya hızlı kayıt" : "or quick sign up"}
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={Boolean(isSocialLoading)}
                className="flex items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 py-2.5 px-4 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 12.2 0 15s.7 5.4 1.9 7.8l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.4C3.7 20.2 7.5 23 12 23z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("github")}
                disabled={Boolean(isSocialLoading)}
                className="flex items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 py-2.5 px-4 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <svg className="h-4 w-4 fill-current text-zinc-200" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Login Link */}
            <p className="text-center text-xs text-zinc-400 pt-2">
              {isTr ? "Zaten bir hesabınız var mı?" : "Already have an account?"}{" "}
              <Link href="/login" className="text-[#0071e3] font-semibold hover:underline">
                {isTr ? "Giriş yapın ›" : "Sign in ›"}
              </Link>
            </p>
          </div>
        )}

        {/* ── STEP 2: PLAN SELECTION ── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            {/* Monthly / Yearly Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center p-1 rounded-full bg-zinc-900 border border-zinc-800 shadow-sm">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    billingCycle === "monthly" ? "bg-[#0071e3] text-white shadow-sm" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {isTr ? "Aylık Ödeme" : "Monthly"}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    billingCycle === "yearly" ? "bg-[#0071e3] text-white shadow-sm" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {isTr ? "Yıllık (2 Ay Hediye)" : "Yearly (Save 20%)"}
                </button>
              </div>
            </div>

            {/* 4 Plans Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {plans.map((plan) => {
                const isSelected = selectedTier === plan.id;
                const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedTier(plan.id)}
                    className={`rounded-[24px] border p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "border-[#0071e3] bg-zinc-900 ring-2 ring-[#0071e3]/20 shadow-lg scale-[1.02] text-white"
                        : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 shadow-sm text-white"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-white">{plan.name}</h3>
                        {plan.badge && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[10px] font-bold text-[#0071e3]">
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tight text-white">
                          {price === 0 ? "0 ₺" : `${price} ₺`}
                        </span>
                        <span className="text-xs text-zinc-400">
                          /{billingCycle === "monthly" ? (isTr ? "ay" : "mo") : (isTr ? "yıl" : "yr")}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-[#0071e3] bg-blue-500/10 px-2.5 py-1 rounded-xl">
                        {plan.quotaLabel} {isTr ? "Depolama" : "Storage"}
                      </div>

                      <p className="text-[11px] text-zinc-400">{plan.tagline}</p>

                      <ul className="space-y-2 pt-2 border-t border-zinc-800 text-xs text-zinc-200">
                        {plan.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <Check className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                            <span className="text-[11px] text-zinc-300">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6">
                      <button
                        type="button"
                        className={`w-full py-2.5 rounded-full text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-[#0071e3] text-white shadow-md shadow-blue-500/20"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        }`}
                      >
                        {isSelected ? (isTr ? "✓ Seçildi" : "✓ Selected") : (isTr ? "Bu Planı Seç" : "Select Plan")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{isTr ? "Geri Dön" : "Back"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleFinalSubmit(selectedTier)}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-full bg-[#0071e3] px-8 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#0077ed] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{isTr ? "Hesabı Tamamla ve Başla" : "Complete Registration"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: OTP VERIFICATION ── */}
        {step === 3 && (
          <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5 animate-in fade-in">
            <div className="text-center space-y-1">
              <p className="text-xs text-zinc-400">
                {isTr
                  ? `Onay bağlantısı veya kodu ${email} adresine gönderildi.`
                  : `Verification email or code was sent to ${email}.`}
              </p>
            </div>

            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div className="space-y-2 text-center">
                <label className="text-xs font-semibold text-zinc-200 block">
                  {isTr ? "E-posta Doğrulama Kodu (6 veya 8 Haneli)" : "Verification Code (6 or 8 Digits)"}
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder={isTr ? "6 veya 8 haneli kod" : "6 or 8-digit code"}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  className="w-full text-center text-2xl sm:text-3xl font-mono tracking-[0.25em] sm:tracking-[0.35em] py-3 rounded-2xl border border-zinc-800 bg-zinc-950 text-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
                  autoFocus
                />
                <p className="text-[11px] text-zinc-400">
                  {isTr
                    ? "Gelen kutunuzdaki 6 veya 8 haneli güvenlik kodunu girin."
                    : "Enter the 6 or 8-digit security code received in your inbox."}
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-left animate-in fade-in">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={otpCode.length < 6 || isVerifyingOtp}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0071e3] py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#0077ed] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isVerifyingOtp ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <span>{isTr ? "Kodu Doğrula ve Başla" : "Verify Code & Start"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Instant Verification Fallback for Mail Delays / Spam / Rate-limits */}
            <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4 text-center space-y-2.5">
              <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-400">
                <ShieldCheck className="h-4 w-4" />
                <span>{isTr ? "E-posta Gelen Kutunuza Ulaşmadı mı?" : "Email Not Arriving?"}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {isTr
                  ? "E-posta sağlayıcınız spam filtreleri veya sunucu kotaları nedeniyle gecikiyorsa, hesabınızı tek tıkla hemen doğrulayıp platforma giriş yapabilirsiniz."
                  : "If emails are delayed by spam filters or provider rate limits, you can instantly verify and proceed directly."}
              </p>
              <button
                type="button"
                onClick={handleDirectConfirm}
                disabled={isDirectConfirming}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#0071e3]/30 bg-zinc-900 py-2.5 text-xs font-bold text-blue-400 shadow-sm hover:bg-zinc-800 transition-all disabled:opacity-50 active:scale-[0.98] cursor-pointer"
              >
                {isDirectConfirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                <span>{isTr ? "Hesabı Şimdi Doğrula ve Başla" : "Verify Instantly & Get Started"}</span>
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-800 text-center space-y-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending || cooldown > 0}
                className="text-xs font-semibold text-[#0071e3] hover:underline disabled:opacity-50 cursor-pointer"
              >
                {isResending ? <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> : null}
                <span>{cooldown > 0 ? (isTr ? `Tekrar gönder (${cooldown}s)` : `Resend (${cooldown}s)`) : (isTr ? "E-postayı Tekrar Gönder" : "Resend Verification Email")}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
