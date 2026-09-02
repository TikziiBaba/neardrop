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
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                {isFolder ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Folder className="h-4 w-4" />
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                    <FileText className="h-4 w-4" />
                  </div>
                )}
                <span className="font-semibold text-zinc-200 truncate max-w-[220px]">
                  {targetName}
                </span>
              </div>
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
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              <span>Preview shared page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* QR Code toggle */}
          <div className="space-y-3 pt-1 border-t border-zinc-800/60">
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
          <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border flex-shrink-0 ${
                  isFolder
                    ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
                    : "bg-zinc-800 border-zinc-700/60 text-zinc-300"
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
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {isFolder
                    ? `${folder?.filesCount} files • ${formatBytes(folder?.totalBytes || 0)}`
                    : formatBytes(targetSize)}
                </p>
              </div>
            </div>
          </div>

          {/* Free Tier Warning if active link count reached */}
          {isFreeTier && shares.filter((s) => s.isActive).length >= 1 && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>You have reached the 1 active share link limit on the Free plan.</span>
              </div>
              <Link href="/pricing" className="text-sky-400 hover:underline font-bold whitespace-nowrap ml-2">
                Upgrade to Pro
              </Link>
            </div>
          )}

          {/* Expiration selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                <span>Link Expiration</span>
              </label>
              {isFreeTier && (
                <span className="text-[10px] text-zinc-400 font-mono">Free: Max 12 Hours</span>
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
                        ? "border-zinc-800/40 bg-zinc-950/40 text-zinc-600 cursor-not-allowed"
                        : expirationHours === opt.hours
                        ? "border-sky-500 bg-sky-500/15 text-sky-400 font-semibold"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isLocked && (
                      <span className="block text-[8px] text-purple-400 uppercase font-bold mt-0.5">
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
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-blue-400" />
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
                      ? "border-sky-500 bg-sky-500/15 text-sky-400 font-semibold"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Burn After Read option */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-zinc-800 bg-zinc-950/60">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Burn After Read</span>
              </label>
              <p className="text-[11px] text-zinc-500">
                Link and file will be automatically destroyed after first download.
              </p>
            </div>
            <input
              type="checkbox"
              checked={burnAfterRead}
              onChange={(e) => setBurnAfterRead(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-sky-500 focus:ring-sky-500/20"
            />
          </div>

          {/* Password Protection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Password Protection (Optional)</span>
              </label>
              {isFreeTier ? (
                <Link href="/pricing" className="text-[10px] text-purple-400 font-bold hover:underline flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  <span>Pro Feature</span>
                </Link>
              ) : (
                <span className="text-[10px] text-zinc-500 font-normal">SHA-256 Encrypted</span>
              )}
            </div>
            <Input
              type="password"
              placeholder={isFreeTier ? "Upgrade to Pro to password-protect links..." : "Enter a password or leave blank for open link..."}
              value={password}
              disabled={isFreeTier}
              onChange={(e) => setPassword(e.target.value)}
              className={`text-xs ${isFreeTier ? "opacity-60 bg-zinc-950/40 cursor-not-allowed" : ""}`}
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
