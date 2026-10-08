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
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-warning/30 bg-gradient-to-r from-warning/10 via-surface/90 to-warning/20 p-4 backdrop-blur-xl shadow-lg animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/20 border border-warning/30 text-warning flex-shrink-0 mt-0.5">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-warning">Verify Your Email Address</h4>
              <span className="rounded-full bg-warning/20 px-1.5 py-0.5 text-[9px] font-bold text-warning font-mono">
                PENDING
              </span>
            </div>
            <p className="text-[11px] text-foreground/80 mt-0.5 max-w-xl">
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
            className="text-xs h-8 rounded-xl border-warning/30 bg-background/60 text-warning hover:bg-warning/20 hover:text-white gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isResending ? "animate-spin" : ""}`} />
            <span>{cooldown > 0 ? `Resend (${cooldown}s)` : "Resend Email"}</span>
          </Button>

          <Link href={`/verify-email?email=${encodeURIComponent(user.email)}`}>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="text-xs h-8 rounded-xl bg-warning hover:bg-warning/90 text-black font-bold shadow-md shadow-warning/20 gap-1.5"
            >
              <span>Enter Code</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-subtle hover:text-foreground/80 rounded-2xl transition-colors"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
