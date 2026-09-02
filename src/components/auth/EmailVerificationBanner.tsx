"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle, RefreshCw, X, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const EmailVerificationBanner: React.FC = () => {
  const { user, resendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // If not logged in, or already verified, or user dismissed for this view
  if (!user || user.isEmailVerified !== false || isDismissed) {
    return null;
  }

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      const res = await resendVerificationEmail(user.email);
      if (res.success) {
        toast.success(`Verification email sent to ${user.email}!`);
        setCooldown(60);
        const interval = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(res.error || "Failed to resend email.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-zinc-900/90 to-amber-950/20 p-4 backdrop-blur-xl shadow-lg animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex-shrink-0 mt-0.5">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-amber-200">Verify Your Email Address</h4>
              <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 font-mono">
                PENDING
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 mt-0.5 max-w-xl">
              Please verify <strong className="text-white">{user.email}</strong> to secure your free unlimited NearDrop account and enable account recovery.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="text-xs h-8 rounded-xl border-amber-500/30 bg-zinc-950/60 text-amber-300 hover:bg-amber-500/20 hover:text-white gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
            <span>{cooldown > 0 ? `Resend (${cooldown}s)` : "Resend Email"}</span>
          </Button>

          <Link href={`/verify-email?email=${encodeURIComponent(user.email)}`}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="text-xs h-8 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold shadow-md shadow-amber-500/20 gap-1.5"
            >
              <span>Enter Code</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 rounded-lg transition-colors"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
