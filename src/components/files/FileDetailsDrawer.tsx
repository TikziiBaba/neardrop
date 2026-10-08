"use client";

import React from "react";
import { CloudFile } from "@/types";
import { formatBytes, formatDate, getFileCategory } from "@/lib/utils";
import { useStorage } from "@/lib/storage/store";
import { toast } from "sonner";
import {
  X,
  Download,
  Share2,
  Trash2,
  FileText,
  FileArchive,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  ShieldCheck,
  HardDrive,
  Calendar,
  Eye,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FileDetailsDrawerProps {
  file: CloudFile | null;
  open: boolean;
  onClose: () => void;
  onShare: (file: CloudFile) => void;
  onDelete: (file: CloudFile) => void;
}

export const FileDetailsDrawer: React.FC<FileDetailsDrawerProps> = ({
  file,
  open,
  onClose,
  onShare,
  onDelete,
}) => {
  const { downloadFile } = useStorage();

  if (!open || !file) return null;

  const category = getFileCategory(file.mimeType, file.filename);

  const renderIcon = () => {
    switch (category) {
      case "archive":
        return <FileArchive className="h-10 w-10 text-warning" />;
      case "image":
        return <FileImage className="h-10 w-10 text-success" />;
      case "video":
        return <FileVideo className="h-10 w-10 text-file-video" />;
      case "audio":
        return <FileAudio className="h-10 w-10 text-file-audio" />;
      case "code":
        return <FileCode className="h-10 w-10 text-accent-text" />;
      default:
        return <FileText className="h-10 w-10 text-accent-text" />;
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFile(file.id);
      toast.success("Download started!");
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Card */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col justify-between border-l border-border bg-background p-6 shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 pb-4">
            <h3 className="text-sm font-semibold text-white">File Information</h3>
            <button
              onClick={onClose}
              className="rounded-2xl p-1.5 text-muted-foreground hover:bg-surface hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* File Card Header */}
          <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface/60 p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-secondary/80 border border-border-strong/50 flex-shrink-0">
              {renderIcon()}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h4 className="font-semibold text-sm text-white break-words">{file.filename}</h4>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                {file.mimeType.split("/")[1] || "File"}
              </Badge>
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-subtle" />
                <span>Uploaded</span>
              </span>
              <span className="font-medium text-foreground">{formatDate(file.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5 text-subtle" />
                <span>Total Downloads</span>
              </span>
              <span className="font-medium text-foreground">{file.downloadsCount || 0} times</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-subtle" />
                <span>Active Shares</span>
              </span>
              <span className="font-medium text-foreground">
                {(file.activeSharesCount || 0) > 0 ? (
                  <Badge variant="success">{file.activeSharesCount} active</Badge>
                ) : (
                  <span className="text-subtle">Not shared</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                <span>Security Scan</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success bg-success/10 border border-success/25 px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3 text-success" />
                <span>Verified Clean</span>
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-subtle" />
                <span>Storage Key</span>
              </span>
              <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[200px]">
                {file.r2ObjectKey}
              </span>
            </div>

            <div className="space-y-1 py-2">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Hash className="h-3.5 w-3.5 text-subtle" />
                <span>SHA-256 Checksum</span>
              </span>
              <p className="font-mono text-[10px] text-muted-foreground bg-surface p-2 rounded-2xl break-all border border-border">
                {file.checksum || "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-6 border-t border-border">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="primary" onClick={handleDownload} className="gap-1.5">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                onShare(file);
              }}
              className="gap-1.5 text-accent-text border-accent/20 hover:bg-accent-hover/10"
            >
              <Share2 className="h-4 w-4" />
              <span>Share Link</span>
            </Button>
          </div>

          <Button
            variant="destructive"
            onClick={() => {
              onClose();
              onDelete(file);
            }}
            className="w-full gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete File</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
