"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CloudFile, ShareLink } from "@/types";
import { useStorage } from "@/lib/storage/store";
import { formatBytes } from "@/lib/utils";
import {
  Share2,
  Clock,
  Download,
  Lock,
  Copy,
  Check,
  QrCode,
  Sparkles,
  Link as LinkIcon,
  ShieldCheck,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface ShareModalProps {
  file: CloudFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ file, open, onOpenChange }) => {
  const { createShareLink } = useStorage();

  const [expirationHours, setExpirationHours] = useState<number>(24);
  const [downloadLimit, setDownloadLimit] = useState<number | undefined>(undefined);
  const [password, setPassword] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdShare, setCreatedShare] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);

  if (!file) return null;

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const share = await createShareLink({
        cloudFileId: file.id,
        expiresInHours: expirationHours,
        maxDownloads: downloadLimit,
        password: password.trim() || undefined,
      });

      setCreatedShare(share);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}

      toast.success("Share link created successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to create share link");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullShareUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/s/${token}`;
    }
    return `https://neardrop.bekirr.dev/s/${token}`;
  };

  const handleCopy = () => {
    if (!createdShare) return;
    const url = getFullShareUrl(createdShare.token);
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Share link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const resetModal = () => {
    setCreatedShare(null);
    setPassword("");
    setExpirationHours(24);
    setDownloadLimit(undefined);
    setShowQR(false);
    setCopied(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetModal();
        onOpenChange(val);
      }}
      title={createdShare ? "Share Link Ready" : "Create Share Link"}
      description={
        createdShare
          ? "Anyone with this secure link can download your shared file."
          : `Configure security and expiration settings for ${file.filename} (${formatBytes(file.size)}).`
      }
    >
      {createdShare ? (
        /* Step 2: Share Created Success View */
        <div className="space-y-5 pt-2">
          {/* Link Box */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">Secure Share URL</span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Protected</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={getFullShareUrl(createdShare.token)}
                className="bg-zinc-900 font-mono text-xs text-sky-400"
              />
              <Button
                variant={copied ? "default" : "primary"}
                onClick={handleCopy}
                className="gap-1.5 flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>

          {/* Share summary badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="sky">
              <Clock className="h-3 w-3 mr-1" />
              {createdShare.expiresAt ? `Expires in ${expirationHours}h` : "Never expires"}
            </Badge>
            <Badge variant="secondary">
              <Download className="h-3 w-3 mr-1" />
              {createdShare.maxDownloads ? `${createdShare.maxDownloads} downloads limit` : "Unlimited downloads"}
            </Badge>
            {createdShare.passwordProtected && (
              <Badge variant="warning">
                <Lock className="h-3 w-3 mr-1" />
                Password protected
              </Badge>
            )}
          </div>

          {/* QR Code toggle */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <QrCode className="h-4 w-4 text-sky-400" />
              <span>{showQR ? "Hide QR Code" : "Show QR Code for Mobile Scanning"}</span>
            </button>

            {showQR && (
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-zinc-950 mx-auto max-w-xs animate-in zoom-in-95 duration-200">
                <QRCodeSVG value={getFullShareUrl(createdShare.token)} size={160} />
                <p className="text-[11px] font-medium text-zinc-600 mt-2 text-center">
                  Scan to download {file.filename}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                resetModal();
                onOpenChange(false);
              }}
            >
              Done
            </Button>
          </div>
        </div>
      ) : (
        /* Step 1: Configuration Form */
        <div className="space-y-5 pt-2">
          {/* Expiration selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              <span>Link Expiration</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: "1 hour", hours: 1 },
                { label: "24 hours", hours: 24 },
                { label: "7 days", hours: 168 },
                { label: "30 days", hours: 720 },
                { label: "Never", hours: 0 },
              ].map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setExpirationHours(opt.hours)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center ${
                    expirationHours === opt.hours
                      ? "border-sky-500 bg-sky-500/15 text-sky-400 font-semibold"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Download limit selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-blue-400" />
              <span>Download Limit</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: "Unlimited", limit: undefined },
                { label: "1 time", limit: 1 },
                { label: "5 times", limit: 5 },
                { label: "10 times", limit: 10 },
              ].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDownloadLimit(opt.limit)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center ${
                    downloadLimit === opt.limit
                      ? "border-sky-500 bg-sky-500/15 text-sky-400 font-semibold"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Password Protection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Password Protection (Optional)</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-normal">SHA-256 encrypted</span>
            </label>
            <Input
              type="password"
              placeholder="Leave empty for public link or enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span>{isSubmitting ? "Creating link..." : "Create Link"}</span>
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};
