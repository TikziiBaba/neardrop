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
import { LandingAmbient } from "@/components/landing/LandingAmbient";

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
    <div className="relative min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center overflow-hidden">
      <LandingAmbient />
      <div className={`relative z-10 w-full ${step === 2 ? "max-w-6xl" : "max-w-md"} space-y-6 transition-all duration-300`}>
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-1 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0071e3] text-white shadow-md shadow-blue-500/25 group-hover:scale-110 transition-transform duration-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-[#09090b] tracking-tight">NearDrop</span>
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#09090b]">
            {step === 1
              ? "Create Your Account"
              : step === 2
              ? "Select Your Cloud Storage Plan"
              : "Verify Your Email"}
          </h1>
          <p className="text-sm text-[#27272a] font-normal max-w-sm mx-auto">
            {step === 1
              ? "Sign up in seconds to start transferring and sharing secure files."
              : step === 2
              ? "Choose the plan that fits your capacity and workflow requirements."
              : `We sent a confirmation link to ${email}.`}
          </p>

          {/* Stepper Pill */}
          {step < 3 && (
            <div className="flex justify-center pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#d4d4d8] text-xs font-semibold text-[#09090b] shadow-sm">
                <span className={`h-2 w-2 rounded-full ${step === 1 ? "bg-[#0071e3]" : "bg-[#16a34a]"}`} />
                <span>Step {step} of 2</span>
              </div>
            </div>
          )}
        </div>

        {/* Global Error */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-[#fff2f2] border border-[#ff3b30]/20 text-xs text-[#ff3b30] animate-in fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-[#ff3b30]" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: CREDENTIALS                                       */}
        {/* ========================================================= */}
        {step === 1 && (
          <div className="rounded-[28px] border border-[#d2d2d7]/70 bg-white p-7 sm:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-5 animate-in fade-in">
            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={Boolean(isSocialLoading)}
                className="flex items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-4 py-2.5 text-xs font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all shadow-sm"
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
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin("github")}
                disabled={Boolean(isSocialLoading)}
                className="flex items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-white px-4 py-2.5 text-xs font-medium text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all shadow-sm"
              >
                <svg className="h-4 w-4 fill-current text-[#1d1d1f]" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#e8e8ed] w-full" />
              <span className="bg-white px-3 text-[11px] uppercase font-semibold text-[#86868b] absolute">
                Or continue with email
              </span>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1d1d1f]">Full Name</label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Jane Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-9 text-xs rounded-xl bg-[#f5f5f7] border-[#d2d2d7] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:border-[#0071e3]"
                    required
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1d1d1f]">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 text-xs rounded-xl bg-[#f5f5f7] border-[#d2d2d7] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:border-[#0071e3]"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1d1d1f]">Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 text-xs rounded-xl bg-[#f5f5f7] border-[#d2d2d7] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:border-[#0071e3]"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1d1d1f]">Confirm Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-9 text-xs rounded-xl bg-[#f5f5f7] border-[#d2d2d7] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:border-[#0071e3]"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2 text-xs font-semibold rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm mt-2 py-2.5"
              >
                <span>Continue: Choose Plan</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-[#6e6e73]">Already have an account? </span>
              <Link href="/login" className="text-xs font-semibold text-[#0071e3] hover:underline">
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
              <div className="inline-flex items-center p-1 rounded-full bg-[#e8e8ed] border border-[#d2d2d7]/60 shadow-inner">
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    billingCycle === "monthly"
                      ? "bg-white text-[#1d1d1f] shadow-sm"
                      : "text-[#6e6e73] hover:text-[#1d1d1f]"
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    billingCycle === "yearly"
                      ? "bg-white text-[#1d1d1f] shadow-sm"
                      : "text-[#6e6e73] hover:text-[#1d1d1f]"
                  }`}
                >
                  <span>Annual Billing</span>
                  <span className="rounded-full bg-[#eaf4fe] px-2 py-0.5 text-[10px] font-bold text-[#0071e3]">
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
                    className={`relative rounded-[24px] p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-white border-2 border-[#0071e3] ring-2 ring-[#0071e3]/20 shadow-[0_8px_32px_rgba(0,113,227,0.12)] scale-[1.01]"
                        : "bg-white border border-[#d2d2d7]/70 shadow-sm hover:border-[#d2d2d7] hover:shadow-md"
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="rounded-full bg-[#0071e3] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Plan Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold text-[#1d1d1f]">{plan.name}</h3>
                          <p className="text-[11px] text-[#6e6e73] mt-0.5 line-clamp-2">
                            {plan.tagline}
                          </p>
                        </div>
                        <div
                          className={`flex h-5 w-5 rounded-full border items-center justify-center transition-colors ${
                            isSelected ? "border-[#0071e3] bg-[#0071e3] text-white" : "border-[#d2d2d7] bg-[#f5f5f7]"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Storage Quota Pill */}
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] border border-[#e5e5ea] px-2.5 py-1 text-xs font-semibold text-[#1d1d1f]">
                        <HardDrive className="h-3.5 w-3.5 text-[#0071e3]" />
                        <span>{plan.quotaLabel} Storage</span>
                      </div>

                      {/* Price in TL */}
                      <div className="flex items-baseline gap-1 pt-1">
                        <span className="text-2xl sm:text-3xl font-semibold text-[#1d1d1f]">
                          {price === 0 ? "Free" : `${price} ₺`}
                        </span>
                        {price > 0 && (
                          <span className="text-xs font-medium text-[#86868b]">{period}</span>
                        )}
                      </div>

                      {/* Key features */}
                      <div className="space-y-2 pt-2 border-t border-[#e8e8ed]">
                        <div className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                          Includes
                        </div>
                        <ul className="space-y-1.5 text-xs text-[#1d1d1f]">
                          {limits.features.slice(0, 4).map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#0071e3] flex-shrink-0 mt-0.5" />
                              <span className="leading-tight">{f}</span>
                            </li>
                          ))}
                          {limits.limitations.length > 0 &&
                            limits.limitations.slice(0, 2).map((l, i) => (
                              <li key={i} className="flex items-start gap-2 text-[#86868b]">
                                <XCircle className="h-3.5 w-3.5 text-[#d2d2d7] flex-shrink-0 mt-0.5" />
                                <span className="leading-tight">{l}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>

                    {/* Card Action Button */}
                    <div className="pt-5 mt-4 border-t border-[#e8e8ed]">
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTier(plan.id);
                          handleFinalSubmit(plan.id);
                        }}
                        disabled={isLoading}
                        className={`w-full text-xs h-9 font-semibold rounded-full ${
                          isSelected
                            ? "bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm"
                            : "bg-[#f5f5f7] border border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#ebebeb]"
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl mx-auto pt-4 border-t border-[#d2d2d7]/60">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#6e6e73] hover:text-[#1d1d1f] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back: Edit Account Information</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[#6e6e73]">
                  Selected Plan: <strong className="text-[#1d1d1f]">{TIER_LIMITS[selectedTier].name}</strong>
                </span>
                <Button
                  type="button"
                  size="default"
                  onClick={() => handleFinalSubmit(selectedTier)}
                  disabled={isLoading}
                  className="gap-2 text-xs font-semibold rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm px-6"
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
          <div className="rounded-[28px] border border-[#d2d2d7]/70 bg-white p-7 sm:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-6 animate-in fade-in max-w-md mx-auto">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#eaf4fe] text-[#0071e3] flex items-center justify-center mx-auto mb-3 shadow-sm">
                <Mail className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-[#1d1d1f]">Doğrulama Bağlantısı Gönderildi</h3>
              <p className="text-xs text-[#6e6e73] leading-relaxed">
                Hesabınızı aktifleştirmek için lütfen gelen kutunuzdaki onay bağlantısına tıklayın. Onayladıktan sonra doğrudan kullanmaya başlayabilirsiniz.
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e8ed] bg-[#fbfbfd] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#86868b]">Gönderilen Adres:</span>
                <span className="font-semibold text-[#1d1d1f] font-mono truncate max-w-[200px]">{email}</span>
              </div>

              {emailProviderUrl && (
                <a
                  href={emailProviderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-xs shadow-sm transition-all"
                >
                  <span>Gelen Kutusunu Aç</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <div className="rounded-2xl bg-[#fff9ea] border border-[#ff9500]/20 p-3.5 text-center space-y-1">
                <p className="text-xs font-semibold text-[#ff9500]">
                  E-posta onayı zorunludur
                </p>
                <p className="text-[11px] text-[#6e6e73] leading-relaxed">
                  Güvenliğiniz için hesabınızı onaylamadan sisteme giriş yapılamaz. Gelen kutunuzdaki bağlantıya tıkladığınızda oturumunuz otomatik açılacaktır.
                </p>
              </div>

              <div className="pt-2 border-t border-[#e8e8ed] flex items-center justify-between text-xs">
                <span className="text-[#86868b]">E-posta ulaşmadı mı?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || cooldown > 0}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#0071e3] hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
