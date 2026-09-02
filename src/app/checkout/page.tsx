"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PRICING_PLANS } from "@/lib/subscription/plans";
import { TIER_LIMITS } from "@/lib/subscription/permissions";
import { useAuth } from "@/lib/auth/context";
import { formatBytes } from "@/lib/utils";
import {
  Sparkles,
  ShieldCheck,
  CreditCard,
  Check,
  ArrowLeft,
  HardDrive,
  Lock,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, updateProfile } = useAuth();

  const planId = searchParams.get("plan") || "pro";
  const billingCycle = (searchParams.get("billing") || "monthly") as "monthly" | "yearly";

  const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[1];
  const limits = TIER_LIMITS[plan.id];
  const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;

  // Card Inputs
  const [cardHolder, setCardHolder] = useState(user?.displayName || "");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPosNoticeModal, setShowPosNoticeModal] = useState(false);

  // Auto format card number (4-4-4-4)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(" ") || raw;
    setCardNumber(formatted);
  };

  // Auto format expiry date MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardExpiry(raw);
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center max-w-md space-y-4 shadow-2xl backdrop-blur-xl">
          <Lock className="h-8 w-8 text-purple-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-zinc-400">
            Please log in or create an account to activate your {plan.name} subscription.
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

  const handleCheckout = async (e: React.FormEvent) => {
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
          billingCycle,
          cardHolder: cardHolder.trim(),
          cardLastFour: cardNumber.replace(/\s/g, "").slice(-4) || "0000",
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Upgraded to ${plan.name}!`);
        await updateProfile({
          quotaBytes: plan.quotaBytes,
          role: data.role || "premium",
          subscriptionTier: plan.id,
          subscriptionStatus: "active",
        });
        router.push("/dashboard");
      } else {
        // Show Virtual POS integration notice modal
        setShowPosNoticeModal(true);
        toast.info(data.message || "Virtual POS Gateway is currently being connected.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during checkout.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Pricing</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Complete Your Subscription
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Your storage quota will be instantly upgraded to <strong className="text-sky-400">{plan.quotaLabel}</strong>.
            </p>
          </div>

          {/* Virtual POS Gateway Notice Banner */}
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-2.5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>Virtual POS Gateway Integration in Progress</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              We are currently establishing our banking POS and 3D Secure merchant integration. Direct card checkout will be fully operational tomorrow. No charges will be processed today.
            </p>
          </div>

          <form onSubmit={handleCheckout} className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-5 apple-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <CreditCard className="h-4 w-4 text-sky-400" />
                <span>Payment Information</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 font-mono">Troy • Visa • Mastercard</span>
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 ml-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  3D Secure
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Name on Card</label>
                <Input
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="Cardholder Name"
                  className="rounded-xl text-xs bg-zinc-950/60 font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Card Number</label>
                <div className="relative">
                  <Input
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="rounded-xl text-xs bg-zinc-950/60 font-mono tracking-wider pl-10"
                    required
                  />
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Expiration (MM/YY)</label>
                  <Input
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="rounded-xl text-xs bg-zinc-950/60 font-mono text-center"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Security Code (CVV)</label>
                  <Input
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="•••"
                    maxLength={4}
                    type="password"
                    className="rounded-xl text-xs bg-zinc-950/60 font-mono text-center"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Email for Receipts</label>
                <Input
                  value={user.email}
                  disabled
                  className="rounded-xl text-xs bg-zinc-950/40 text-zinc-400 font-mono"
                />
              </div>

              <div className="pt-2 space-y-2.5">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isProcessing}
                  className="w-full text-xs rounded-xl py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-xl shadow-sky-500/25 gap-2 font-bold"
                >
                  <Zap className="h-4 w-4" />
                  <span>
                    {isProcessing ? "Processing..." : `Simulate Direct Card Payment (${price} ₺)`}
                  </span>
                </Button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsProcessing(true);
                    try {
                      const res = await fetch("/api/payment/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ planId: plan.id, billingCycle }),
                      });
                      const data = await res.json();
                      if (data.checkoutUrl) {
                        window.location.href = data.checkoutUrl;
                      } else {
                        toast.info("LemonSqueezy test simulation: activating plan directly.");
                        await updateProfile({
                          quotaBytes: plan.quotaBytes,
                          subscriptionTier: plan.id,
                          subscriptionStatus: "active",
                        });
                        router.push("/dashboard");
                      }
                    } catch (err: any) {
                      toast.error(err.message || "Payment service unavailable");
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span>Pay via LemonSqueezy (Hosted Checkout)</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-zinc-500">
                By subscribing, you agree to the NearDrop Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>
        </div>

        {/* Right column: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-7 space-y-5 apple-card shadow-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400">
              Order Summary
            </h3>

            {/* Selected Plan card */}
            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">{plan.name}</h4>
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                  {billingCycle === "yearly" ? "Annual" : "Monthly"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold">
                <HardDrive className="h-3.5 w-3.5" />
                <span>{plan.quotaLabel} High-Speed Secure Cloud Storage</span>
              </div>
            </div>

            {/* Features check */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <span className="text-[11px] font-semibold text-zinc-400">Plan Highlights:</span>
              <ul className="space-y-2">
                {limits.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="leading-tight">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Total calculation in TL */}
            <div className="space-y-2.5 pt-4 border-t border-zinc-800/80 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-200">{price} ₺</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>VAT (20%)</span>
                <span className="font-mono text-emerald-400">Included</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2.5 border-t border-zinc-800">
                <span>Total Due</span>
                <span className="text-lg text-sky-400 font-extrabold font-mono">{price} ₺</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* POS Maintenance Notice Modal */}
      <Dialog
        open={showPosNoticeModal}
        onOpenChange={setShowPosNoticeModal}
        title="Virtual POS Gateway Integration in Progress"
        description="Online card payments are currently being finalized with our banking provider."
      >
        <div className="space-y-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Direct Card Checkout Goes Live Tomorrow</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              We are in the process of linking our Virtual POS terminal and 3D Secure credentials. You will be able to upgrade seamlessly once the connection is activated tomorrow.
            </p>
          </div>

          <p className="text-zinc-400 text-xs">
            In the meantime, you can continue using your <strong className="text-white">Free Starter Plan (2 GB)</strong> without interruption.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPosNoticeModal(false)}
              className="text-xs rounded-xl"
            >
              Close
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => router.push("/dashboard")}
              className="text-xs rounded-xl"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-zinc-400">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
