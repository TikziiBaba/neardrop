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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(Boolean(queryVerified) || user?.isEmailVerified === true);
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
  const canSubmitOtp = cleanCode.length === 6 && !isVerifyingOtp && Boolean(email.trim());

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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-8 relative text-foreground select-none">
      {/* Background Soft Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-gradient-to-b from-accent/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block group">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-accent to-success p-0.5 shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-accent-text">
                <ShieldCheck className="h-8 w-8" />
              </div>
            </div>
          </Link>

          <div>
            <h1 className="display-title">
              {isSuccess
                ? isTr ? "E-posta Başarıyla Doğrulandı" : "Email Successfully Verified"
                : isTr ? "E-posta Doğrulaması Gerekiyor" : "Email Verification Required"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
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
        <div className="rounded-3xl border border-border bg-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
          {/* Success State */}
          {isSuccess ? (
            <div className="text-center space-y-5 py-4 animate-in zoom-in-95 duration-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 border border-success/30 text-success mx-auto shadow-lg shadow-success/15">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">
                  {isTr ? "Hesabınız Doğrulandı" : "Account Verified"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isTr
                    ? "Dosyalarınızı güvenle yükleyebilir, şifreleyebilir ve dilediğiniz gibi paylaşabilirsiniz."
                    : "You can now upload, encrypt, and share your files seamlessly."}
                </p>
              </div>

              <div className="pt-2">
                <Link href="/dashboard" className="block w-full">
                  <Button className="w-full gap-2 rounded-full font-bold py-3 bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/25 cursor-pointer">
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
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-danger/10 border border-danger/20 text-xs text-danger">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-danger" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email Address & Quick Webmail Shortcut */}
              <div className="rounded-2xl border border-border bg-background/70 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{isTr ? "Doğrulanan E-posta:" : "Target Email:"}</span>
                  <span className="font-semibold text-white font-mono truncate max-w-[220px]">
                    {email || (isTr ? "Belirtilen e-posta" : "Pending email")}
                  </span>
                </div>

                {emailProviderUrl && (
                  <a
                    href={emailProviderUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-hover hover:from-accent hover:to-accent text-white font-bold text-xs shadow-lg shadow-accent/20 transition-all cursor-pointer"
                  >
                    <span>{isTr ? "Gelen Kutusunu Aç" : "Open Email Inbox"}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {/* OTP Code Form with Exactly 6 Button-Like Digit Cells */}
              <form onSubmit={handleOtpVerify} className="rounded-2xl border border-border bg-background/70 p-5 space-y-4">
                <div className="text-center space-y-1">
                  <label className="text-xs font-semibold text-foreground block">
                    {isTr ? "Güvenlik Onay Kodu (6 Haneli)" : "Security Verification Code (6 Digits)"}
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    {isTr
                      ? "E-postanıza gelen 6 haneli güvenlik kodunu girin."
                      : "Enter the 6-digit verification code received in your email."}
                  </p>
                </div>

                {/* Discrete 6 Button-Like OTP Cells */}
                <div
                  onClick={() => inputRef.current?.focus()}
                  className="relative cursor-pointer py-1"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                    autoFocus
                  />

                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {Array.from({ length: 6 }).map((_, idx) => {
                      const digit = cleanCode[idx] || "";
                      const isCurrent = idx === cleanCode.length && isInputFocused;

                      return (
                        <div
                          key={idx}
                          className={`w-11 h-14 sm:w-12 sm:h-16 rounded-2xl border flex items-center justify-center font-mono text-2xl sm:text-3xl font-bold transition-all select-none ${
                            digit
                              ? "border-accent bg-surface text-white shadow-lg shadow-accent/10 ring-1 ring-accent/30"
                              : isCurrent
                              ? "border-accent bg-surface/90 text-white ring-2 ring-accent/30 animate-pulse"
                              : "border-border bg-background/80 text-subtle hover:border-border-strong hover:bg-surface/40"
                          }`}
                        >
                          {digit}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmitOtp}
                  className="w-full py-3 rounded-full text-xs font-bold gap-2 bg-accent hover:bg-accent-hover text-white shadow-md shadow-accent/20 cursor-pointer disabled:opacity-40 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {isVerifyingOtp ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-success" />
                  )}
                  <span>{isTr ? "Kodu Doğrula ve Başla" : "Verify Code & Continue"}</span>
                </Button>
              </form>

              {/* Spam Folder Warning Reminder */}
              <div className="rounded-2xl border border-warning/25 bg-warning/10 p-4 space-y-1.5 text-left">
                <div className="flex items-center gap-2 text-xs font-semibold text-warning">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{isTr ? "E-posta Gelen Kutunuzda Yok mu? Spam Kutusunu Kontrol Edin!" : "Email Missing? Check Spam Folder!"}</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {isTr
                    ? "Doğrulama e-postası bazen sağlayıcınız (Gmail, Outlook vb.) tarafından Spam (İstenmeyen / Gereksiz) klasörüne yönlendirilebilir. Lütfen spam kutunuzu mutlaka kontrol edin."
                    : "Verification emails may sometimes be delivered to your Spam, Junk, or Promotions folder. Please make sure to check all mailbox folders."}
                </p>
              </div>

              {/* Resend Link Section */}
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{isTr ? "Kod ulaşmadı mı?" : "Didn't receive code?"}</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || cooldown > 0 || !email}
                  className="inline-flex items-center gap-1.5 font-semibold text-accent-text hover:underline disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`} />
                  <span>
                    {cooldown > 0
                      ? isTr ? `Tekrar gönder (${cooldown}s)` : `Resend (${cooldown}s)`
                      : isTr ? "Yeni Kod Gönder" : "Resend Code"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-subtle">
          <ShieldCheck className="h-3.5 w-3.5 text-success" />
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
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-text" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
