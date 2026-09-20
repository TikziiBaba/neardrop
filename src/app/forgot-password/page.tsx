"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
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
        toast.error("Supabase is not configured.");
        setIsLoading(false);
        return;
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "https://neardrop.bekirr.dev";
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset instructions");
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      toast.success("Password recovery instructions sent!");
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-8 bg-[#f5f5f7]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0071e3] text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold text-[#1d1d1f] tracking-tight">NearDrop</span>
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1d1d1f]">Reset your password</h1>
          <p className="text-sm text-[#6e6e73]">
            Enter your account email to receive recovery instructions.
          </p>
        </div>

        <div className="rounded-[28px] border border-[#d2d2d7]/70 bg-white p-7 sm:p-9 shadow-[0_4px_24px_rgba(0,0,0,0.04)] space-y-5">
          {isSubmitted ? (
            <div className="text-center space-y-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eafbf0] text-[#34c759] mx-auto border border-[#34c759]/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-[#1d1d1f]">Check your email</h3>
                <p className="text-xs text-[#6e6e73]">
                  We sent recovery instructions to <span className="font-semibold text-[#1d1d1f]">{email}</span>.
                </p>
              </div>
              <Link href="/login" className="block pt-2">
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-full border-[#d2d2d7] text-[#1d1d1f] hover:bg-[#f5f5f7]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to login</span>
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#1d1d1f]">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl bg-[#f5f5f7] border-[#d2d2d7] text-[#1d1d1f] placeholder:text-[#86868b] focus:bg-white focus:border-[#0071e3]"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gap-2 py-2.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm font-semibold"
              >
                <span>{isLoading ? "Sending..." : "Send Reset Instructions"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-[#6e6e73]">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-[#0071e3] hover:underline transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
