"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useStorage } from "@/lib/storage/store";
import { formatBytes, formatRelativeTime, formatExpiresIn } from "@/lib/utils";
import {
  Share2,
  Copy,
  Check,
  QrCode,
  Clock,
  Download,
  Lock,
  Trash2,
  Ban,
  ExternalLink,
  ShieldCheck,
  Plus,
  Folder,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

export default function SharedPage() {
  const { shares, files, revokeShareLink, deleteShareLink, updateShareExpiry } = useStorage();

  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [selectedQrShare, setSelectedQrShare] = useState<{ token: string; filename: string } | null>(null);

  const getFullShareUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/s/${token}`;
    }
    return `https://neardrop.bekirr.dev/s/${token}`;
  };

  const handleCopy = (token: string) => {
    const url = getFullShareUrl(token);
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    toast.success("Share link copied to clipboard!");
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Shared Links</span>
              <Badge variant="secondary" className="text-xs">
                {shares.length} link{shares.length === 1 ? "" : "s"}
              </Badge>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Manage your active share links, track downloads, revoke access, and copy public URLs.
            </p>
          </div>

          <Link href="/files">
            <Button variant="primary" size="default" className="gap-2 shadow-lg shadow-sky-500/25">
              <Plus className="h-4 w-4" />
              <span>Create New Share</span>
            </Button>
          </Link>
        </div>

        {/* Shares Table / List */}
        {shares.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-3">
            <Share2 className="h-10 w-10 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-zinc-300">You haven&apos;t shared anything yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Select any file from your dashboard or files tab to create an expiring, password-protected share link.
            </p>
            <Link href="/files">
              <Button variant="outline" size="sm" className="mt-2">
                Browse Files
              </Button>
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden divide-y divide-zinc-800/60">
            {shares.map((share) => {
              const file = files.find((f) => f.id === share.cloudFileId);
              const isFolder = Boolean(share.folderPath || share.isFolder);
              const isCopied = copiedToken === share.token;
              const isExpired = share.expiresAt && new Date(share.expiresAt).getTime() < Date.now();
              const displayName = isFolder
                ? share.title || share.folderPath?.split("/").pop() || "Shared Folder"
                : file?.filename || "Shared Object";
              const displaySize = isFolder
                ? share.folderTotalBytes || 0
                : file?.size || 0;

              return (
                <div
                  key={share.id}
                  className="p-4 sm:p-5 hover:bg-zinc-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {isFolder ? (
                          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            <Folder className="h-3.5 w-3.5" />
                          </div>
                        ) : null}
                        <h4 className="font-semibold text-sm text-white truncate max-w-md">
                          {displayName}
                        </h4>
                      </div>

                      {isFolder ? (
                        <Badge variant="sky" className="text-[10px]">
                          Folder ({share.folderFilesCount || 0} files)
                        </Badge>
                      ) : null}

                      {displaySize > 0 && (
                        <span className="text-xs text-zinc-400">({formatBytes(displaySize)})</span>
                      )}

                      {/* Status Badges */}
                      {isExpired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : share.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Revoked</Badge>
                      )}

                      {share.passwordProtected && (
                        <Badge variant="warning" className="gap-1">
                          <Lock className="h-3 w-3" />
                          <span>Password</span>
                        </Badge>
                      )}
                    </div>

                    {/* Link info */}
                    <div className="flex items-center gap-3 text-xs font-mono text-sky-400">
                      <span className="truncate max-w-xs sm:max-w-md">{getFullShareUrl(share.token)}</span>
                      <a
                        href={`/s/${share.token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-zinc-500 hover:text-sky-300 transition-colors"
                        title="Open Public Share Page"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center gap-4 text-[11px] text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        <span>{formatExpiresIn(share.expiresAt)}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3 text-zinc-500" />
                        <span>
                          {share.downloadCount}
                          {share.maxDownloads ? ` / ${share.maxDownloads}` : ""} downloads
                        </span>
                      </span>
                      <span>•</span>
                      <span>Created {formatRelativeTime(share.createdAt)}</span>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-start md:self-center">
                    <Button
                      variant={isCopied ? "default" : "primary"}
                      size="sm"
                      onClick={() => handleCopy(share.token)}
                      className="gap-1.5 text-xs h-8"
                    >
                      {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{isCopied ? "Copied" : "Copy Link"}</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedQrShare({
                          token: share.token,
                          filename: displayName,
                        })
                      }
                      className="h-8 w-8 p-0"
                      title="Show QR Code"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </Button>

                    <Link href={`/shared/${share.id}/analytics`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-zinc-400 hover:text-sky-400"
                        title="View Download Analytics"
                      >
                        <BarChart3 className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        revokeShareLink(share.id);
                        toast.info(share.isActive ? "Link deactivated" : "Link reactivated");
                      }}
                      className={`h-8 w-8 p-0 ${!share.isActive ? "text-emerald-400" : "text-amber-400"}`}
                      title={share.isActive ? "Deactivate Link" : "Activate Link"}
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        deleteShareLink(share.id);
                        toast.success("Share link removed");
                      }}
                      className="text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8 p-0"
                      title="Delete Share"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Dialog */}
      <Dialog
        open={Boolean(selectedQrShare)}
        onOpenChange={(open) => !open && setSelectedQrShare(null)}
        title="Scan to Download"
        description={selectedQrShare?.filename}
      >
        {selectedQrShare && (
          <div className="flex flex-col items-center justify-center p-6 bg-white text-zinc-950 rounded-2xl mx-auto max-w-xs space-y-4">
            <QRCodeSVG value={getFullShareUrl(selectedQrShare.token)} size={180} />
            <p className="text-xs text-center font-medium text-zinc-600">
              Point your smartphone camera to open and download.
            </p>
          </div>
        )}
      </Dialog>
    </DashboardLayout>
  );
}
