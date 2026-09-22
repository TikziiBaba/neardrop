"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  ExternalLink,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { useLanguage } from "@/lib/i18n/context";
import { toast } from "sonner";
import { SoundManager } from "@/lib/utils/sound-effects";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <Loader2 className="h-7 w-7 animate-spin text-[#0071e3]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const { login, signInWithOAuth, resendVerificationEmail } = useAuth();
  const { t, locale } = useLanguage();
  const isTr = locale === "tr";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const getEmailProviderUrl = (emailAddress: string) => {
    const domain = emailAddress.split("@")[1]?.toLowerCase() || "";
    if (domain.includes("gmail.com")) return "https://mail.google.com";
    if (domain.includes("outlook.com") || domain.includes("hotmail.com")) return "https://outlook.live.com";
    if (domain.includes("yahoo.com")) return "https://mail.yahoo.com";
    if (domain.includes("icloud.com")) return "https://www.icloud.com/mail";
    if (domain.includes("proton") || domain.includes("protonmail.com")) return "https://mail.proton.me";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowResend(false);

    if (!email || !password) {
      setError(isTr ? "Lütfen tüm alanları doldurun." : "Please fill out all fields.");
      return;
    }

    SoundManager.play("pop");
    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || (isTr ? "Geçersiz e-posta veya şifre." : "Invalid email or password."));
        if (res.requiresVerification) {
          setShowResend(true);
        }
      } else {
        SoundManager.play("success");
        toast.success(isTr ? "Giriş başarılı! Yönlendiriliyorsunuz..." : "Welcome back!");
        router.push(redirectUrl);
      }
    } catch (err: any) {
      setError(err.message || (isTr ? "Beklenmeyen bir hata oluştu." : "Unexpected error."));
    } finally {
      setIsLoading(false);
    }
  };

  const [isDirectConfirming, setIsDirectConfirming] = useState(false);

  const handleDirectConfirm = async () => {
    if (!email.trim() || isDirectConfirming) return;
    setIsDirectConfirming(true);
    try {
      const res = await fetch("/api/auth/confirm-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(isTr ? "E-posta doğrulandı! Giriş yapılıyor..." : "Email verified! Signing in...");
        setError(null);
        setShowResend(false);
        if (password) {
          await handleSubmit(new Event("submit") as any);
        } else {
          toast.info(isTr ? "Lütfen parolanızı girip Giriş Yap'a tıklayın." : "Please enter your password to sign in.");
        }
      } else {
        toast.error(data.error || "Doğrulama başarısız.");
      }
    } catch (err: any) {
      toast.error(err.message || "Hata oluştu.");
    } finally {
      setIsDirectConfirming(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email.trim() || isResending || cooldown > 0) return;
    setIsResending(true);
    try {
      const res = await resendVerificationEmail(email.trim());
      if (res.success) {
        toast.success(isTr ? `Onay bağlantısı ${email} adresine tekrar gönderildi!` : `Verification link resent to ${email}`);
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
        toast.error(res.error || "E-posta gönderilemedi.");
      }
    } catch (err: any) {
      toast.error(err.message || "Hata oluştu.");
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
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 sm:p-8 bg-zinc-950 text-zinc-100 select-none">
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-b from-[#0071e3]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-[420px] space-y-6">
        {/* Apple ID Brand Avatar & Header */}
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
              {isTr ? "NearDrop ID ile Giriş Yapın" : "Sign in with NearDrop ID"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xs mx-auto">
              {isTr
                ? "Tüm transferlerinizi yönetin ve güvenli bulut kotalarınıza erişin."
                : "Manage your transfers and access your cloud storage."}
            </p>
          </div>
        </div>

        {/* Apple ID Container Box */}
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                <span className="font-medium">{error}</span>
              </div>
              {showResend && (
                <div className="pt-2 border-t border-red-500/20 space-y-2">
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {isTr
                      ? "E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzdaki bağlantıya tıklayın."
                      : "Your email is not verified yet. Please check your inbox for the link."}
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={isResending || cooldown > 0}
                      className="text-xs font-semibold text-[#0071e3] hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {isResending ? <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> : null}
                      <span>{cooldown > 0 ? (isTr ? `Tekrar gönder (${cooldown}s)` : `Resend (${cooldown}s)`) : (isTr ? "Bağlantıyı Tekrar Gönder" : "Resend Link")}</span>
                    </button>

                    {getEmailProviderUrl(email) && (
                      <a
                        href={getEmailProviderUrl(email)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-emerald-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{isTr ? "Gelen Kutusu" : "Inbox"}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleDirectConfirm}
                    disabled={isDirectConfirming}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-[#0071e3]/30 bg-zinc-900 py-2 text-xs font-bold text-blue-400 shadow-sm hover:bg-zinc-800 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isDirectConfirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />}
                    <span>{isTr ? "E-posta Gelmedi — Hesabı Şimdi Doğrula" : "Instant Verify Account Without Email"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Apple ID Grouped Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 overflow-hidden focus-within:border-[#0071e3] focus-within:ring-2 focus-within:ring-[#0071e3]/20 transition-all bg-zinc-950/70">
              {/* Email Input */}
              <div className="relative border-b border-zinc-800/80 p-3">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  {isTr ? "NearDrop ID (E-posta)" : "NearDrop ID (Email)"}
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

              {/* Password Input */}
              <div className="relative p-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    {isTr ? "Parola" : "Password"}
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] text-[#0071e3] hover:underline font-medium"
                  >
                    {isTr ? "Unuttunuz mu?" : "Forgot?"}
                  </Link>
                </div>
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
                    className="text-zinc-400 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Apple Primary Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#0071e3] py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#0077ed] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{isTr ? "Giriş Yap" : "Sign In"}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-1">
            <div className="w-full border-t border-zinc-800" />
            <span className="absolute bg-zinc-900 px-3 text-[11px] font-medium text-zinc-400">
              {isTr ? "veya" : "or continue with"}
            </span>
          </div>

          {/* Apple Style Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={Boolean(isSocialLoading)}
              className="flex items-center justify-center gap-2 rounded-full border border-zinc-800 bg-zinc-900 py-2.5 px-4 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 active:scale-95 transition-all shadow-sm cursor-pointer"
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
              <span>{isSocialLoading === "google" ? "..." : "Google"}</span>
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
              <span>{isSocialLoading === "github" ? "..." : "GitHub"}</span>
            </button>
          </div>
        </div>

        {/* Footer Create Account Link */}
        <div className="text-center space-y-4">
          <p className="text-xs text-zinc-400">
            {isTr ? "NearDrop ID'niz yok mu?" : "Don't have a NearDrop ID?"}{" "}
            <Link
              href="/register"
              className="text-[#0071e3] font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              <span>{isTr ? "Şimdi oluşturun" : "Create yours now"}</span>
              <span className="text-sm leading-none">›</span>
            </Link>
          </p>

          {/* Privacy Note */}
          <div className="pt-2 text-[11px] text-zinc-500 max-w-xs mx-auto flex items-center justify-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>
              {isTr
                ? "NearDrop ID bilgileriniz yalnızca güvenli oturum açma amacıyla kullanılır."
                : "Your NearDrop ID is used solely to provide secure sign-in."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
