"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/context";
import { toast } from "sonner";
import confetti from "canvas-confetti";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, verifyOtp, resendVerificationEmail } = useAuth();

  const queryEmail = searchParams.get("email") || user?.email || "";
  const queryError = searchParams.get("error");
  const queryVerified = searchParams.get("verified");

  const [email, setEmail] = useState(queryEmail);
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(Boolean(queryVerified) || user?.isEmailVerified === true);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    queryError === "invalid_token" ? "The confirmation link has expired or is invalid. Please request a new link below." : null
  );

  useEffect(() => {
    if (queryEmail && !email) {
      setEmail(queryEmail);
    }
  }, [queryEmail, email]);

  useEffect(() => {
    if (queryVerified || user?.isEmailVerified) {
      setIsSuccess(true);
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    }
  }, [queryVerified, user?.isEmailVerified]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !otpCode.trim()) {
      setErrorMessage("Please enter both your email address and 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await verifyOtp(email.trim(), otpCode.trim(), "signup");
      if (!res.success) {
        setErrorMessage(res.error || "Verification failed. Please check the code and try again.");
      } else {
        setIsSuccess(true);
        toast.success("Email verified successfully! Welcome to NearDrop.");
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || cooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);

    try {
      const res = await resendVerificationEmail(email.trim());
      if (res.success) {
        toast.success(`New verification link and code sent to ${email}!`);
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
        setErrorMessage(res.error || "Failed to resend confirmation email.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Could not resend email.");
    } finally {
      setIsResending(false);
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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-8 relative">
      <div className="pointer-events-none absolute inset-0 hero-glow" />

      <div className="relative w-full max-w-lg space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">NearDrop</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {isSuccess ? "Email Verified Successfully" : "Verify Your Email Address"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto">
            {isSuccess
              ? "Your NearDrop account is fully authenticated with 1 TB free unlimited storage."
              : "Click the link in your email or enter the 6-digit confirmation code below."}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Success State */}
          {isSuccess ? (
            <div className="text-center space-y-5 py-4 animate-in zoom-in-95 duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Account Confirmed</h3>
                <p className="text-xs text-zinc-400">
                  All Pro and Enterprise capabilities are unlocked and ready to use.
                </p>
              </div>

              <div className="pt-2">
                <Link href="/dashboard">
                  <Button variant="primary" size="lg" className="w-full gap-2 rounded-2xl font-bold shadow-lg shadow-sky-500/25">
                    <span>Go to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Pending / Input State */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Top illustration envelope */}
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

              {/* Error banner */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email badge & Quick Webmail Shortcut */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Confirmation Sent To:</span>
                  <span className="font-semibold text-white font-mono truncate max-w-[200px]">
                    {email || "your email"}
                  </span>
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
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Email Address</label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs rounded-xl bg-zinc-950/60"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">6-Digit Code / Token</label>
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
                  disabled={isLoading}
                  className="w-full gap-2 text-xs font-bold rounded-2xl shadow-lg shadow-sky-500/25"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Confirm & Activate Account</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Resend Action */}
              <div className="pt-2 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-zinc-400">Didn&apos;t receive the email?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || cooldown > 0 || !email}
                  className="inline-flex items-center gap-1.5 font-semibold text-sky-400 hover:text-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <RefreshCw className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`} />
                  <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend Verification Email"}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>NearDrop 100% Free VIP Cloud Security</span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
