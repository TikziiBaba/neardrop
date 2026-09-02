"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICING_PLANS } from "@/lib/subscription/plans";
import { TIER_LIMITS } from "@/lib/subscription/permissions";
import { useAuth } from "@/lib/auth/context";
import {
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  HardDrive,
  Lock,
  ArrowRight,
  Zap,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import confetti from "canvas-confetti";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateProfile } = useAuth();

  const planId = searchParams.get("plan") || "free";
  const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[0];
  const limits = TIER_LIMITS[plan.id];

  const [isProcessing, setIsProcessing] = useState(false);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center max-w-md space-y-4 shadow-2xl backdrop-blur-xl">
          <Lock className="h-8 w-8 text-sky-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-zinc-400">
            Please log in or create a free account to activate your {plan.name} storage.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/login">
              <Button variant="primary" className="w-full text-xs rounded-xl">
                Log In to Continue
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="w-full text-xs rounded-xl">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          planId: plan.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Activated ${plan.name} for 0 ₺!`);
        await updateProfile({
          quotaBytes: plan.quotaBytes,
          role: data.role || "member",
          subscriptionTier: plan.id,
          subscriptionStatus: "active",
        });
        try {
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
        } catch (e) {}
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Activation failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Pricing</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left column: Free Activation */}
        <div className="md:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Activate {plan.name}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Your storage quota will be immediately provisioned to <strong className="text-sky-400">{plan.quotaLabel}</strong>.
            </p>
          </div>

          {/* 100% Free Plan Banner */}
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <Sparkles className="h-4 w-4" />
              <span>100% Free Community Access</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              No credit card or subscription needed. NearDrop provides unlimited enterprise file sharing to everyone at zero cost.
            </p>
          </div>

          <form onSubmit={handleActivate} className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-5 apple-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Plan Confirmation</span>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/30">
                0 ₺ Free Forever
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Target Account:</span>
                  <span className="font-semibold text-white truncate max-w-[200px]">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Included Capacity:</span>
                  <span className="font-semibold text-sky-400">{plan.quotaLabel} Storage</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Encryption:</span>
                  <span className="font-semibold text-zinc-300">AES-256-GCM + SHA-256</span>
                </div>
                <div className="flex justify-between border-t border-zinc-800/80 pt-2">
                  <span className="text-zinc-400">Amount Due:</span>
                  <span className="font-bold text-emerald-400 text-sm">0 ₺</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isProcessing}
                className="w-full text-xs rounded-xl py-3 bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 shadow-xl shadow-sky-500/25 gap-2 font-bold text-black"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-current" />
                    <span>Activate {plan.name} Now</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Right column: Highlights */}
        <div className="md:col-span-5 space-y-4">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 apple-card">
            <div className="flex items-center gap-2 text-xs font-bold text-white border-b border-zinc-800 pb-3">
              <HardDrive className="h-4 w-4 text-sky-400" />
              <span>Features Summary</span>
            </div>

            <ul className="space-y-2.5">
              {limits.features.slice(0, 5).map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-tight">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
