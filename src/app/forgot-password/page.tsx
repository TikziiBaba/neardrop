"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";

export default function ForgotPasswordPage() {
  const { locale } = useLanguage();
  const isTr = locale === "tr";

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      const supabase = createClient();
      if (!supabase) {
        toast.error(isTr ? "Supabase yapılandırılmamış." : "Supabase is not configured.");
        setIsLoading(false);
        return;
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "https://neardrop.bekirr.dev";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || (isTr ? "Sıfırlama talimatı gönderilemedi." : "Failed to send reset instructions"));
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      toast.success(isTr ? "Şifre sıfırlama talimatları e-posta adresinize gönderildi!" : "Password recovery instructions sent!");
    } catch (err: any) {
      toast.error(err?.message || (isTr ? "Beklenmeyen bir hata oluştu." : "An unexpected error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-8 bg-zinc-950 text-zinc-100 select-none relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-b from-[#0071e3]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0071e3] text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">NearDrop</span>
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            {isTr ? "Parolanızı Sıfırlayın" : "Reset your password"}
          </h1>
          <p className="text-sm text-zinc-400">
            {isTr
              ? "Kurtarma bağlantısı almak için hesap e-postanızı girin."
              : "Enter your account email to receive recovery instructions."}
          </p>
        </div>

        <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/90 p-7 sm:p-9 shadow-2xl backdrop-blur-xl space-y-5">
          {isSubmitted ? (
            <div className="text-center space-y-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto border border-emerald-500/30">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">
                  {isTr ? "E-postanızı Kontrol Edin" : "Check your email"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isTr ? "Sıfırlama talimatlarını şu adrese ilettik: " : "We sent recovery instructions to "}
                  <span className="font-semibold text-white">{email}</span>.
                </p>
              </div>
              <Link href="/login" className="block pt-2">
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-full border-zinc-700 text-zinc-200 hover:bg-zinc-800 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{isTr ? "Giriş sayfasına dön" : "Back to login"}</span>
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  {isTr ? "E-posta Adresi" : "Email Address"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl bg-zinc-950/70 border-zinc-800 text-white placeholder:text-zinc-500 focus:bg-zinc-950 focus:border-[#0071e3]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gap-2 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-blue-500/20 font-semibold cursor-pointer"
              >
                <span>
                  {isLoading
                    ? isTr ? "Gönderiliyor..." : "Sending..."
                    : isTr ? "Sıfırlama Bağlantısı Gönder" : "Send Reset Instructions"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-zinc-400">
          {isTr ? "Parolanızı hatırladınız mı? " : "Remember your password? "}
          <Link href="/login" className="font-semibold text-[#0071e3] hover:underline transition-colors">
            {isTr ? "Giriş yapın" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
