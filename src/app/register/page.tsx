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
  AlertCircle,
  CheckCircle2,
  HardDrive,
  ShieldCheck,
  Zap,
  RefreshCw,
  ExternalLink,
  KeyRound,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/context";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function RegisterPage() {
  const router = useRouter();
  const { register, signInWithOAuth, resendVerificationEmail, verifyOtp } = useAuth();

  // State: "form" | "verify"
  const [viewState, setViewState] = useState<"form" | "verify">("form");

  // Form fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Verification state (if email confirmation required)
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true);
    try {
      const res = await register(email.trim(), password, displayName.trim(), "free");
      if (!res.success) {
        setError(res.error || "Failed to create account.");
        setIsLoading(false);
        return;
      }

      if (res.requiresVerification) {
        setViewState("verify");
        toast.info("Account created! Please check your email for the verification link or code.");
      } else {
        toast.success("Account created successfully! Welcome to NearDrop.");
        try {
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError("Please enter the 6-digit confirmation code.");
      return;
    }

    setIsVerifyingOtp(true);
    setError(null);
    try {
      const res = await verifyOtp(email.trim(), otpCode.trim(), "signup");
      if (!res.success) {
        setError(res.error || "Invalid code. Please try again or click the email link.");
      } else {
        toast.success("Email verified! Redirecting to your dashboard...");
        try {
          confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Verification failed.");
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
        setError(res.error || "Failed to resend confirmation email.");
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

      <div className="relative w-full max-w-lg space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-1 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">NearDrop</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {viewState === "form" ? "Create Free Account" : "Check Your Email"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
            {viewState === "form"
              ? "Get 1 TB free cloud storage, password protection & unlimited transfer speeds."
              : `We sent a confirmation link and code to ${email}.`}
          </p>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form View */}
        {viewState === "form" ? (
          <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5 animate-in fade-in">
            {/* Free Perks Callout */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-sky-500/15 via-zinc-900 to-purple-500/10 border border-sky-500/30 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <HardDrive className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">1 TB Free VIP Storage</span>
                  <span className="text-[10px] text-zinc-400">All features 100% unlocked forever</span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
                0 ₺ Free
              </span>
            </div>

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
                <span>{isSocialLoading === "google" ? "Connecting..." : "Google"}</span>
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
                <span>{isSocialLoading === "github" ? "Connecting..." : "GitHub"}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-zinc-800" />
              <span className="absolute bg-zinc-900 px-3 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                or sign up with email
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Full Name"
                    className="pl-10 text-xs rounded-2xl bg-zinc-950/60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-10 text-xs rounded-2xl bg-zinc-950/60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="pl-10 text-xs rounded-2xl bg-zinc-950/60"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="pl-10 text-xs rounded-2xl bg-zinc-950/60"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full gap-2 text-xs font-bold rounded-2xl shadow-lg shadow-sky-500/25 mt-2"
              >
                <span>{isLoading ? "Creating Account..." : "Create Free Account"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="text-center pt-2 border-t border-zinc-800/80">
              <p className="text-xs text-zinc-400">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        ) : (
          /* Email Verification Step */
          <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in">
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 shadow-md">
                  <Mail className="h-7 w-7" />
                </div>
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-black">
                  <KeyRound className="h-3 w-3" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Sent to:</span>
                <span className="font-semibold text-white font-mono truncate max-w-[220px]">{email}</span>
              </div>

              {emailProviderUrl && (
                <a
                  href={emailProviderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/60 text-xs font-semibold text-sky-400 hover:text-white hover:bg-zinc-800 transition-all group"
                >
                  <span>Open Email Inbox</span>
                  <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </a>
              )}
            </div>

            {/* 6-Digit OTP Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">Enter 6-Digit Verification Code</label>
                  <span className="text-[10px] text-zinc-500">From confirmation email</span>
                </div>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\s+/g, ""))}
                  className="text-center font-mono text-base tracking-widest rounded-xl bg-zinc-950/60"
                  maxLength={12}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isVerifyingOtp}
                className="w-full gap-2 text-xs font-bold rounded-2xl shadow-lg shadow-sky-500/25"
              >
                <span>{isVerifyingOtp ? "Verifying..." : "Verify & Complete Registration"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-zinc-400">Didn&apos;t get the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || cooldown > 0}
                className="inline-flex items-center gap-1.5 font-semibold text-sky-400 hover:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`} />
                <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Email"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
