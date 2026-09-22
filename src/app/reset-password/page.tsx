"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-zinc-950">
          <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setErrorMessage(isTr ? "Supabase yapılandırılmamış." : "Supabase is not configured.");
      setIsAuthenticated(false);
      return;
    }

    // Check if recovery session is active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsAuthenticated(true);
        setErrorMessage(null);
      }
    });

    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthenticated(Boolean(session));
      });
    }, 1500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [isTr]);

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage(isTr ? "Şifreniz en az 6 karakter olmalıdır." : "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(isTr ? "Şifreler birbiriyle eşleşmiyor." : "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error(isTr ? "Supabase yapılandırılmamış." : "Supabase is not configured.");
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setIsSuccess(true);
      toast.success(isTr ? "Şifreniz başarıyla güncellendi!" : "Password updated successfully!");
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {}
    } catch (err: any) {
      setErrorMessage(err.message || (isTr ? "Şifre güncellenirken bir hata oluştu." : "Failed to update password."));
      toast.error(err.message || (isTr ? "Şifre güncellenemedi." : "Password update failed."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-8 bg-zinc-950 text-zinc-100 select-none relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-b from-[#0071e3]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0071e3] text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">NearDrop</span>
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {isTr ? "Yeni Şifre Belirleyin" : "Set New Password"}
          </h1>
          <p className="text-sm text-zinc-400">
            {isTr
              ? "Hesabınızın güvenliği için güçlü ve yeni bir şifre girin."
              : "Enter a strong new password for your account."}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-5">
          {isSuccess ? (
            <div className="text-center space-y-4 py-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto border border-emerald-500/30">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-white">
                  {isTr ? "Şifreniz Değiştirildi!" : "Password Changed!"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isTr
                    ? "Yeni şifreniz başarıyla kaydedildi. Artık yeni şifrenizle giriş yapabilirsiniz."
                    : "Your new password has been saved. You can now log in with it."}
                </p>
              </div>
              <Link href="/login" className="block pt-2">
                <Button className="w-full gap-2 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-blue-500/20 font-semibold cursor-pointer">
                  <span>{isTr ? "Giriş Yap" : "Log In"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  {isTr ? "Yeni Şifre" : "New Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={isTr ? "En az 6 karakter" : "At least 6 characters"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 rounded-xl bg-zinc-950/70 border-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-950 focus:border-[#0071e3]"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Strength Meter */}
                {password.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength <= 25
                            ? "w-1/4 bg-[#ff3b30]"
                            : strength <= 50
                            ? "w-2/4 bg-[#ff9500]"
                            : strength <= 70
                            ? "w-3/4 bg-[#0071e3]"
                            : "w-full bg-[#34c759]"
                        }`}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 text-right font-medium">
                      {strength <= 25
                        ? isTr ? "Zayıf" : "Weak"
                        : strength <= 50
                        ? isTr ? "Orta" : "Fair"
                        : strength <= 70
                        ? isTr ? "İyi" : "Good"
                        : isTr ? "Çok Güçlü" : "Strong"}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  {isTr ? "Yeni Şifreyi Onaylayın" : "Confirm New Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={isTr ? "Şifreyi tekrar yazın" : "Re-enter password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 rounded-xl bg-zinc-950/70 border-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-950 focus:border-[#0071e3]"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gap-2 py-2.5 mt-2 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-blue-500/20 font-semibold cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isTr ? "Güncelleniyor..." : "Updating..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isTr ? "Şifremi Güncelle" : "Update Password"}</span>
                    <ShieldCheck className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Back Link */}
        <p className="text-center text-xs text-zinc-400">
          {isTr ? "Vazgeçtiniz mi? " : "Changed your mind? "}
          <Link href="/login" className="font-semibold text-[#0071e3] hover:underline transition-colors">
            {isTr ? "Giriş Yap" : "Log In"}
          </Link>
        </p>
      </div>
    </div>
  );
}
