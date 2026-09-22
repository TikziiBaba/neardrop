"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";
import { useLanguage } from "@/lib/i18n/context";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { SoundManager } from "@/lib/utils/sound-effects";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, resendVerificationEmail, verifyOtp } = useAuth();
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  const queryEmail = searchParams.get("email") || user?.email || "";
  const queryError = searchParams.get("error");
  const queryVerified = searchParams.get("verified");

  const [email, setEmail] = useState(queryEmail);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(Boolean(queryVerified) || user?.isEmailVerified === true);
  const [isDirectConfirming, setIsDirectConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    queryError === "invalid_token"
      ? isTr
        ? "Doğrulama bağlantısının süresi dolmuş veya geçersiz. Lütfen yeni bir kod veya bağlantı isteyin."
        : "Verification link is invalid or expired. Please request a new one below."
      : null
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

  const cleanCode = otpCode.trim().replace(/\D/g, "");
  const canSubmitOtp = cleanCode.length >= 6 && !isVerifyingOtp && Boolean(email.trim());

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitOtp) return;
    setIsVerifyingOtp(true);
    setErrorMessage(null);
    SoundManager.play("click");

    try {
      const res = await verifyOtp(email.trim(), cleanCode);
      if (res.success) {
        setIsSuccess(true);
        SoundManager.play("success");
        toast.success(isTr ? "E-posta adresiniz başarıyla onaylandı!" : "Email verified successfully!");
        try {
          confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
        } catch (e) {}
        setTimeout(() => {
          router.push("/dashboard?verified=true");
        }, 1200);
      } else {
        setErrorMessage(res.error || (isTr ? "Geçersiz veya süresi dolmuş kod." : "Invalid or expired code."));
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isTr ? "Doğrulama hatası oluştu." : "Verification failed."));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleDirectConfirm = async () => {
    if (!email.trim() || isDirectConfirming) return;
    setIsDirectConfirming(true);
    setErrorMessage(null);
    SoundManager.play("click");

    try {
      const res = await fetch("/api/auth/confirm-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        SoundManager.play("success");
        toast.success(isTr ? "E-posta adresiniz başarıyla onaylandı!" : "Email verified successfully!");
        try {
          confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
        } catch (e) {}
        setTimeout(() => {
          router.push("/dashboard?verified=true");
        }, 1200);
      } else {
        setErrorMessage(data.error || (isTr ? "Doğrulama başarısız." : "Verification failed."));
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isTr ? "Hata oluştu." : "An error occurred."));
    } finally {
      setIsDirectConfirming(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || cooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMessage(null);

    try {
      const res = await resendVerificationEmail(email.trim());
      if (res.success) {
        toast.success(isTr ? `Yeni doğrulama bağlantısı ${email} adresine gönderildi!` : `Verification email resent to ${email}!`);
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
        setErrorMessage(res.error || (isTr ? "Doğrulama e-postası gönderilemedi." : "Failed to resend verification email."));
      }
    } catch (err: any) {
      setErrorMessage(err.message || (isTr ? "E-posta gönderilirken hata oluştu." : "Error while sending email."));
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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-8 relative bg-zinc-950 text-zinc-100 select-none">
      {/* Background Soft Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-gradient-to-b from-[#0071e3]/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg space-y-6">
        {/* Brand header */}
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
              {isSuccess
                ? isTr ? "E-posta Başarıyla Doğrulandı" : "Email Successfully Verified"
                : isTr ? "E-posta Doğrulaması Gerekiyor" : "Email Verification Required"}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
              {isSuccess
                ? isTr
                  ? "NearDrop hesabınız başarıyla aktifleştirildi. Paneliniz kullanıma hazır!"
                  : "Your NearDrop ID is fully active and ready to use."
                : isTr
                  ? "Hesabınızı aktifleştirmek için gelen kutunuzdaki onay linkine tıklayın veya kodu girin."
                  : "Please click the link in your inbox or enter your verification code below."}
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
          {/* Success State */}
          {isSuccess ? (
            <div className="text-center space-y-5 py-4 animate-in zoom-in-95 duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto shadow-lg shadow-emerald-500/15">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {isTr ? "Hesabınız Doğrulandı" : "Account Verified"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isTr
                    ? "Dosyalarınızı güvenle yükleyebilir, şifreleyebilir ve dilediğiniz gibi paylaşabilirsiniz."
                    : "You can now upload, encrypt, and share your files seamlessly."}
                </p>
              </div>

              <div className="pt-2">
                <Link href="/dashboard" className="block w-full">
                  <Button className="w-full gap-2 rounded-full font-bold py-3 bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-lg shadow-blue-500/25 cursor-pointer">
                    <span>{isTr ? "Panele Git" : "Go to Dashboard"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Pending Verification State */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Error banner */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email Address & Quick Webmail Shortcut */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{isTr ? "Doğrulanan E-posta:" : "Target Email:"}</span>
                  <span className="font-semibold text-white font-mono truncate max-w-[220px]">
                    {email || (isTr ? "Belirtilen e-posta" : "Pending email")}
                  </span>
                </div>

                {emailProviderUrl && (
                  <a
                    href={emailProviderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0071e3] to-[#0077ed] hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <span>{isTr ? "Gelen Kutusunu Aç" : "Open Email Inbox"}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {/* OTP Code Form (Supports 6 to 8+ digits) */}
              <form onSubmit={handleOtpVerify} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 space-y-3">
                <div className="text-center space-y-1">
                  <label className="text-xs font-semibold text-zinc-200 block">
                    {isTr ? "Güvenlik Onay Kodu (6 veya 8 Haneli)" : "Security Code (6 or 8 Digits)"}
                  </label>
                  <p className="text-[11px] text-zinc-400">
                    {isTr
                      ? "Gelen kutunuzdaki veya bildirimdeki güvenlik kodunu buraya girin."
                      : "Enter the security code received in your inbox."}
                  </p>
                </div>

                <input
                  type="text"
                  maxLength={10}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full text-center text-2xl sm:text-3xl font-mono tracking-[0.25em] sm:tracking-[0.35em] py-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 outline-none"
                  autoFocus
                />

                <Button
                  type="submit"
                  disabled={!canSubmitOtp}
                  className="w-full py-2.5 rounded-full text-xs font-bold gap-2 bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-40"
                >
                  {isVerifyingOtp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  )}
                  <span>{isTr ? "Kodu Doğrula ve Başla" : "Verify Code & Continue"}</span>
                </Button>
              </form>

              {/* Fallback Direct Confirmation */}
              <div className="space-y-3 pt-1">
                <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-3.5 text-center space-y-1.5">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{isTr ? "E-posta Gelen Kutunuza Ulaşmadı mı?" : "Email Not Arriving?"}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {isTr
                      ? "E-posta sağlayıcınız spam filtreleri veya sunucu gecikmesi yaşıyorsa, hesabınızı tek tıkla hemen doğrulayabilirsiniz."
                      : "If emails are delayed by spam filters or provider latency, you can instantly verify your account."}
                  </p>
                  <button
                    type="button"
                    onClick={handleDirectConfirm}
                    disabled={isDirectConfirming || !email}
                    className="w-full mt-1 flex items-center justify-center gap-2 rounded-xl border border-[#0071e3]/30 bg-zinc-900 py-2.5 text-xs font-bold text-blue-400 hover:bg-zinc-800 transition-all disabled:opacity-50 active:scale-[0.98] cursor-pointer"
                  >
                    {isDirectConfirming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                    <span>{isTr ? "Hesabı Şimdi Doğrula ve Başla" : "Verify Instantly & Get Started"}</span>
                  </button>
                </div>

                {/* Resend Link Button */}
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">{isTr ? "E-posta gelmedi mi?" : "Didn't get an email?"}</span>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isResending || cooldown > 0 || !email}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#0071e3] hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`} />
                    <span>
                      {cooldown > 0
                        ? isTr ? `Tekrar gönder (${cooldown}s)` : `Resend (${cooldown}s)`
                        : isTr ? "Tekrar Gönder" : "Resend Email"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>{isTr ? "NearDrop Güvenli Bulut Mimarisi" : "NearDrop Secure Cloud Architecture"}</span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-950">
          <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
