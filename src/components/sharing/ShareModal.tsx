"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Folder,
  FolderOpen,
  FileText,
  Layers,
  ExternalLink,
  Crown,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/context";
import { getTierLimits } from "@/lib/subscription/permissions";
import Link from "next/link";

export interface FolderShareTarget {
  name: string;
  fullPath: string;
  filesCount: number;
  totalBytes: number;
}

interface ShareModalProps {
  file?: CloudFile | null;
  folder?: FolderShareTarget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  file,
  folder,
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const { createShareLink, shares } = useStorage();
  const tierLimits = getTierLimits(user?.subscriptionTier || "free", user?.role || "member");
  const isFreeTier = (user?.subscriptionTier || "free") === "free" && user?.role !== "admin" && user?.role !== "moderator";

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [expirationHours, setExpirationHours] = useState<number>(isFreeTier ? 12 : 24);
  const [downloadLimit, setDownloadLimit] = useState<number | undefined>(undefined);
  const [password, setPassword] = useState<string>("");
  const [burnAfterRead, setBurnAfterRead] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdShare, setCreatedShare] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);

  const isFolder = Boolean(folder);
  const targetName = isFolder ? folder?.name : file?.filename?.split("/").pop() || file?.filename;
  const targetSize = isFolder ? folder?.totalBytes || 0 : file?.size || 0;

  if (!file && !folder) return null;

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        expiresInHours: expirationHours,
        maxDownloads: downloadLimit,
        password: password.trim() || undefined,
        burnAfterRead,
      };

      if (isFolder && folder) {
        payload.folderPath = folder.fullPath;
        payload.title = title.trim() || folder.name;
        payload.description = description.trim() || undefined;
      } else if (file) {
        payload.cloudFileId = file.id;
        payload.title = title.trim() || undefined;
        payload.description = description.trim() || undefined;
      }

      const share = await createShareLink(payload);
      setCreatedShare(share);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}

      toast.success(
        isFolder
          ? `Folder share link for "${folder?.name}" created!`
          : "File share link created successfully!"
      );
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
    setTitle("");
    setDescription("");
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
      title={
        createdShare
          ? isFolder
            ? "Folder Share Link Ready"
            : "Share Link Ready"
          : isFolder
          ? "Share Folder"
          : "Create Share Link"
      }
      description={
        createdShare
          ? isFolder
            ? "Anyone with this link can explore, browse, and download files from this shared folder."
            : "Anyone with this secure link can download your shared file."
          : isFolder
          ? `Configure security, expiration, and download limits for folder "${folder?.name}".`
          : `Configure security and expiration settings for "${targetName}" (${formatBytes(targetSize)}).`
      }
    >
      {createdShare ? (
        /* Step 2: Share Created Success View */
        <div className="space-y-5 pt-2">
          {/* Target Preview Box */}
          <div className="rounded-2xl border border-border bg-background p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                {isFolder ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-accent/10 text-accent-text border border-accent/20">
                    <Folder className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-surface-secondary text-foreground/80">
                    <FileText className="h-4 w-4" />
                  </div>
                )}
                <span className="font-semibold text-foreground truncate max-w-[220px]">
                  {targetName}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-success">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Protected</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={getFullShareUrl(createdShare.token)}
                className="bg-surface font-mono text-xs text-accent-text"
              />
              <Button
                variant={copied ? "default" : "primary"}
                onClick={handleCopy}
                className="gap-1.5 flex-shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>

          {/* Share summary badges */}
          <div className="flex flex-wrap gap-2 text-xs">
            {isFolder && (
              <Badge variant="sky">
                <Layers className="h-3 w-3 mr-1" />
                {folder?.filesCount} files ({formatBytes(folder?.totalBytes || 0)})
              </Badge>
            )}
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {createdShare.expiresAt ? `Expires in ${expirationHours}h` : "Never expires"}
            </Badge>
            <Badge variant="secondary">
              <Download className="h-3 w-3 mr-1" />
              {createdShare.maxDownloads
                ? `${createdShare.maxDownloads} downloads limit`
                : "Unlimited downloads"}
            </Badge>
            {createdShare.passwordProtected && (
              <Badge variant="warning">
                <Lock className="h-3 w-3 mr-1" />
                Password protected
              </Badge>
            )}
          </div>

          {/* Open Test Link button */}
          <div className="flex items-center justify-between pt-1">
            <a
              href={getFullShareUrl(createdShare.token)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent-text hover:text-accent-text transition-colors"
            >
              <span>Preview shared page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* QR Code toggle */}
          <div className="space-y-3 pt-1 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
            >
              <QrCode className="h-4 w-4 text-accent-text" />
              <span>{showQR ? "Hide QR Code" : "Show QR Code for Mobile Scanning"}</span>
            </button>

            {showQR && (
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white text-background mx-auto max-w-xs animate-in zoom-in-95 duration-200">
                <QRCodeSVG value={getFullShareUrl(createdShare.token)} size={160} />
                <p className="text-[11px] font-medium text-subtle/80 mt-2 text-center">
                  Scan to explore and download {targetName}
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
          {/* Target Folder / File Banner */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-background/70 p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border flex-shrink-0 ${
                  isFolder
                    ? "bg-accent/10 border-accent/30 text-accent-text"
                    : "bg-surface-secondary border-border-strong/60 text-foreground/80"
                }`}
              >
                {isFolder ? <Folder className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-white truncate">{targetName}</span>
                  {isFolder && (
                    <Badge variant="sky" className="text-[10px]">
                      Folder
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isFolder
                    ? `${folder?.filesCount} files • ${formatBytes(folder?.totalBytes || 0)}`
                    : formatBytes(targetSize)}
                </p>
              </div>
            </div>
          </div>

          {/* Free Tier Warning if active link count reached */}
          {isFreeTier && shares.filter((s) => s.isActive).length >= 1 && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-warning/10 border border-warning/20 text-xs text-warning">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning flex-shrink-0" />
                <span>You have reached the 1 active share link limit on the Free plan.</span>
              </div>
              <Link href="/pricing" className="text-accent-text hover:underline font-bold whitespace-nowrap ml-2">
                Upgrade to Pro
              </Link>
            </div>
          )}

          {/* Expiration selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-accent-text" />
                <span>Link Expiration</span>
              </label>
              {isFreeTier && (
                <span className="text-[10px] text-muted-foreground font-mono">Free: Max 12 Hours</span>
              )}
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { label: "1 Hour", hours: 1, minTier: "free" },
                { label: "6 Hours", hours: 6, minTier: "free" },
                { label: "12 Hours", hours: 12, minTier: "free" },
                { label: "7 Days", hours: 168, minTier: "pro" },
                { label: "30 Days", hours: 720, minTier: "ultra" },
              ].map((opt) => {
                const isLocked = isFreeTier && opt.minTier !== "free";
                return (
                  <button
                    key={opt.hours}
                    type="button"
                    disabled={isLocked}
                    onClick={() => setExpirationHours(opt.hours)}
                    className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center relative ${
                      isLocked
                        ? "border-border/40 bg-background/40 text-subtle/80 cursor-not-allowed"
                        : expirationHours === opt.hours
                        ? "border-accent bg-accent/15 text-accent-text font-semibold"
                        : "border-border bg-surface/60 text-muted-foreground hover:border-border-strong hover:text-foreground"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isLocked && (
                      <span className="block text-[8px] text-accent-text uppercase font-bold mt-0.5">
                        {opt.minTier}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Download limit selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-accent-text" />
              <span>Download Limit</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: "Unlimited", limit: undefined },
                { label: "5 Downloads", limit: 5 },
                { label: "20 Downloads", limit: 20 },
                { label: "50 Downloads", limit: 50 },
              ].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setDownloadLimit(opt.limit)}
                  className={`py-2 px-1 rounded-xl text-xs font-medium border transition-all text-center ${
                    downloadLimit === opt.limit
                      ? "border-accent bg-accent/15 text-accent-text font-semibold"
                      : "border-border bg-surface/60 text-muted-foreground hover:border-border-strong hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Burn After Read option */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-border bg-background/60">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-warning" />
                <span>Burn After Read</span>
              </label>
              <p className="text-[11px] text-subtle">
                Link and file will be automatically destroyed after first download.
              </p>
            </div>
            <Checkbox
              checked={burnAfterRead}
              onCheckedChange={setBurnAfterRead}
              ariaLabel="Burn After Read"
            />
          </div>

          {/* Password Protection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-warning" />
                <span>Password Protection (Optional)</span>
              </label>
              {isFreeTier ? (
                <Link href="/pricing" className="text-[10px] text-accent-text font-bold hover:underline flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  <span>Pro Feature</span>
                </Link>
              ) : (
                <span className="text-[10px] text-subtle font-normal">SHA-256 Encrypted</span>
              )}
            </div>
            <Input
              type="password"
              placeholder={isFreeTier ? "Upgrade to Pro to password-protect links..." : "Enter a password or leave blank for open link..."}
              value={password}
              disabled={isFreeTier}
              onChange={(e) => setPassword(e.target.value)}
              className={`text-xs ${isFreeTier ? "opacity-60 bg-background/40 cursor-not-allowed" : ""}`}
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
              <span>
                {isSubmitting
                  ? "Creating..."
                  : isFolder
                  ? "Create Folder Link"
                  : "Create Share Link"}
              </span>
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
};
