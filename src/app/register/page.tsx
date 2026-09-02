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
  ShieldCheck,
  Zap,
  Check,
  XCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/context";
import { PRICING_PLANS } from "@/lib/subscription/plans";
import { TIER_LIMITS } from "@/lib/subscription/permissions";
import { SubscriptionTier } from "@/types";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function RegisterPage() {
  const router = useRouter();
  const { register, signInWithOAuth, resendVerificationEmail, verifyOtp } = useAuth();

  // Step: 1 = Account Credentials, 2 = Plan Selection, 3 = Email Verification
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Credentials
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
      setError("Please fill out all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async (chosenTier: SubscriptionTier = selectedTier) => {
    setError(null);
    setIsLoading(true);

    try {
      const res = await register(email.trim(), password, displayName.trim(), chosenTier);

      if (!res.success) {
        setError(res.error || "Registration failed.");
        setIsLoading(false);
        return;
      }

      if (res.requiresVerification) {
        setStep(3);
        toast.info("Account created! Please check your email for the verification link or code.");
      } else {
        toast.success("Account created successfully!");
        try {
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}

        if (chosenTier === "free") {
          router.push("/dashboard");
        } else {
          router.push(`/checkout?plan=${chosenTier}&billing=${billingCycle}`);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setIsVerifyingOtp(true);
    setError(null);

    try {
      const res = await verifyOtp(email.trim(), otpCode.trim(), "signup");
      if (res.success) {
        toast.success("Email verified successfully! Welcome to NearDrop.");
        try {
          confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } });
        } catch (e) {}

        if (selectedTier === "free") {
          router.push("/dashboard");
        } else {
          router.push(`/checkout?plan=${selectedTier}&billing=${billingCycle}`);
        }
      } else {
        setError(res.error || "Invalid or expired confirmation code.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify code.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending || !email) return;
    setIsResending(true);
    setError(null);
    try {
      const res = await resendVerificationEmail(email.trim());
      if (res.success) {
        toast.success(`Verification email sent to ${email}!`);
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
        setError(res.error || "Failed to resend verification email.");
      }
    } catch (err: any) {
      setError(err.message || "Error resending email.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsSocialLoading(provider);
    try {
      const res = await signInWithOAuth(provider);
      if (!res.success) {
        toast.error(res.error || `Failed to sign up with ${provider}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Social login error");
    } finally {
      setIsSocialLoading(null);
    }
  };

  const getEmailProviderUrl = (emailAddress: string) => {
    const domain = emailAddress.split("@")[1]?.toLowerCase() || "";
    if (domain.includes("gmail.com")) return "https://mail.google.com";
    if (domain.includes("outlook.com") || domain.includes("hotmail.com")) return "https://outlook.live.com";
    if (domain.includes("yahoo.com")) return "https://mail.yahoo.com";
    if (domain.includes("icloud.com")) return "https://www.icloud.com/mail";
    if (domain.includes("proton") || domain.includes("protonmail.com")) return "https://mail.proton.me";
    return null;
  };

  const emailProviderUrl = getEmailProviderUrl(email);

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center relative">
      <div className="pointer-events-none absolute inset-0 hero-glow" />

      <div className={`relative w-full ${step === 2 ? "max-w-6xl" : "max-w-md"} space-y-6 transition-all duration-300`}>
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-1 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">NearDrop</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {step === 1
              ? "Create Your Account"
              : step === 2
              ? "Select Your Cloud Storage Plan"
              : "Verify Your Email"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
            {step === 1
              ? "Sign up in seconds to start transferring and sharing secure files."
              : step === 2
              ? "Choose the plan that fits your capacity and workflow requirements."
              : `We sent a confirmation link and 6-digit code to ${email}.`}
          </p>

          {/* Stepper Pill */}
          {step < 3 && (
            <div className="flex justify-center pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-semibold text-zinc-400">
                <span className={`h-2 w-2 rounded-full ${step === 1 ? "bg-sky-400" : "bg-emerald-400"}`} />
                <span>Step {step} of 2</span>
              </div>
            </div>
          )}
        </div>

        {/* Global Error */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: CREDENTIALS                                       */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5 animate-in fade-in">
            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("google")}
                disabled={Boolean(isSocialLoading)}
                className="h-10 text-xs rounded-xl border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/80 gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("github")}
                disabled={Boolean(isSocialLoading)}
                className="h-10 text-xs rounded-xl border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800/80 gap-2"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
                <span>GitHub</span>
              </Button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-zinc-900 px-3 text-[11px] uppercase font-mono text-zinc-500 absolute">
                Or continue with email
              </span>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Full Name</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Jane Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-9 text-xs rounded-xl bg-zinc-950/60"
                    required
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs rounded-xl bg-zinc-950/60"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-xs rounded-xl bg-zinc-950/60"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Confirm Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 text-xs rounded-xl bg-zinc-950/60"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full gap-2 text-xs font-bold rounded-2xl shadow-lg shadow-sky-500/25 mt-2"
              >
                <span>Continue: Choose Plan</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-zinc-400">Already have an account? </span>
              <Link href="/login" className="text-xs font-semibold text-sky-400 hover:underline">
                Log in
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: PLAN SELECTION                                    */}
        {/* ========================================================= */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            {/* Monthly / Yearly Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center p-1 rounded-2xl bg-zinc-900/80 border border-zinc-800 backdrop-blur-xl shadow-xl">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    billingCycle === "monthly"
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    billingCycle === "yearly"
                      ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
                    2 Months Free
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
                const period = billingCycle === "yearly" ? "/year" : "/mo";

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
                        <div
                          className={`flex h-5 w-5 rounded-full border items-center justify-center transition-colors ${
                            isSelected ? "border-sky-400 bg-sky-500 text-black" : "border-zinc-700 bg-zinc-800"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Storage Quota Pill */}
                      <div className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 px-2.5 py-1 text-xs font-bold text-sky-400">
                        <HardDrive className="h-3.5 w-3.5" />
                        <span>{plan.quotaLabel} Storage</span>
                      </div>

                      {/* Price in TL */}
                      <div className="flex items-baseline gap-1 pt-1">
                        <span className="text-2xl sm:text-3xl font-extrabold text-white">
                          {price === 0 ? "Free" : `${price} ₺`}
                        </span>
                        {price > 0 && (
                          <span className="text-xs font-semibold text-zinc-400 font-mono">{period}</span>
                        )}
                      </div>

                      {/* Key features */}
                      <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                        <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                          Includes:
                        </div>
                        <ul className="space-y-1.5 text-xs text-zinc-300">
                          {limits.features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                              <span className="leading-tight">{f}</span>
                            </li>
                          ))}
                          {limits.limitations.length > 0 &&
                            limits.limitations.slice(0, 2).map((l, i) => (
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
                        {isLoading && selectedTier === plan.id
                          ? "Creating Account..."
                          : plan.id === "free"
                          ? "Start for Free"
                          : `Select ${plan.name}`}
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
                <span>Back: Edit Account Information</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">
                  Selected Plan: <strong className="text-white">{TIER_LIMITS[selectedTier].name}</strong>
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
                    "Processing..."
                  ) : selectedTier === "free" ? (
                    <>
                      <span>Create Free Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span>Confirm & Proceed to Checkout</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: EMAIL VERIFICATION (LINK CONFIRMATION)            */}
        {/* ========================================================= */}
        {step === 3 && (
          <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in max-w-md mx-auto">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/10 animate-bounce">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Doğrulama Bağlantısı Gönderildi</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Hesabınızı aktifleştirmek için lütfen gelen kutunuzdaki Supabase onay bağlantısına tıklayın. Onayladıktan sonra doğrudan kullanmaya başlayabilirsiniz.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Gönderilen Adres:</span>
                <span className="font-semibold text-white font-mono truncate max-w-[200px]">{email}</span>
              </div>

              {emailProviderUrl && (
                <a
                  href={emailProviderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all group"
                >
                  <span>Gelen Kutusunu Aç</span>
                  <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3.5 text-center space-y-1">
                <p className="text-xs font-bold text-amber-300">
                  E-posta onayı zorunludur
                </p>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Güvenliğiniz için hesabınızı onaylamadan sisteme giriş yapılamaz. Gelen kutunuzdaki bağlantıya tıkladığınızda oturumunuz otomatik açılacaktır.
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400">E-posta ulaşmadı mı?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || cooldown > 0}
                  className="inline-flex items-center gap-1.5 font-semibold text-sky-400 hover:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`} />
                  <span>{cooldown > 0 ? `Tekrar gönder (${cooldown}s)` : "Bağlantıyı Tekrar Gönder"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
