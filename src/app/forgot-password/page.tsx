"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      toast.success("Password recovery instructions sent!");
    }, 800);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-8 relative">
      <div className="pointer-events-none absolute inset-0 hero-glow" />

      <div className="relative w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">NearDrop</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reset your password</h1>
          <p className="text-xs text-zinc-400">
            Enter your account email to receive recovery instructions.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          {isSubmitted ? (
            <div className="text-center space-y-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mx-auto border border-emerald-500/20">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white">Check your email</h3>
                <p className="text-xs text-zinc-400">
                  We sent recovery instructions to <span className="text-zinc-200">{email}</span>.
                </p>
              </div>
              <Link href="/login">
                <Button variant="outline" className="w-full mt-2 gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to login</span>
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full gap-2 py-2.5 shadow-lg shadow-sky-500/25"
              >
                <span>{isLoading ? "Sending..." : "Send Reset Instructions"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-zinc-400">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
