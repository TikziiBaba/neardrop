"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useStorage } from "@/lib/storage/store";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import {
  HardDrive,
  FolderOpen,
  PieChart,
  Trash2,
  Share2,
  FileArchive,
  FileText,
  FileVideo,
  FileImage,
  FileCode,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmModal } from "@/components/files/DeleteConfirmModal";
import { ShareModal } from "@/components/sharing/ShareModal";
import { CloudFile } from "@/types";

export default function StoragePage() {
  const { stats, files } = useStorage();
  const [selectedFileForDelete, setSelectedFileForDelete] = useState<CloudFile | null>(null);
  const [selectedFileForShare, setSelectedFileForShare] = useState<CloudFile | null>(null);

  const quotaPercent = Math.min(100, Math.round((stats.usedBytes / stats.quotaBytes) * 100)) || 0;
  const remainingBytes = Math.max(0, stats.quotaBytes - stats.usedBytes);

  // Sorted largest files
  const largestFiles = [...files].sort((a, b) => b.size - a.size).slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Cloud Storage</span>
              <Badge variant="sky" className="text-xs">
                10 GB Standard
              </Badge>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Monitor quota limits, file distribution categories, and storage optimization.
            </p>
          </div>

          <Link href="/files">
            <Button variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
              <FolderOpen className="h-4 w-4 text-sky-400" />
              <span>Manage All Files</span>
            </Button>
          </Link>
        </div>

        {/* Quota Main Banner */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-zinc-400">Total Usage</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {formatBytes(stats.usedBytes)}
                </span>
                <span className="text-sm text-zinc-500 font-medium">/ {formatBytes(stats.quotaBytes)}</span>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-0.5">
              <span className="text-xs font-medium text-emerald-400">
                {formatBytes(remainingBytes)} free available
              </span>
              <p className="text-[11px] text-zinc-500">{quotaPercent}% allocated</p>
            </div>
          </div>

          {/* Large custom progress bar */}
          <div className="space-y-2">
            <Progress value={stats.usedBytes} max={stats.quotaBytes} className="h-3 rounded-full" />
          </div>

          {/* Categories Legend Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {stats.categories.map((cat) => (
              <div
                key={cat.category}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="truncate">{cat.category}</span>
                </div>
                <p className="font-semibold text-xs text-white">{formatBytes(cat.bytes)}</p>
                <p className="text-[10px] text-zinc-500">{cat.count} files</p>
              </div>
            ))}
          </div>
        </div>

        {/* Largest Files Cleanup Advisor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Large Files Cleanup Advisor</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review your heaviest files to free up cloud storage capacity quickly.
              </p>
            </div>
          </div>

          {largestFiles.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center text-xs text-zinc-500">
              No files currently stored.
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 divide-y divide-zinc-800/60 overflow-hidden">
              {largestFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/60 flex-shrink-0">
                      <FileArchive className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-xs sm:text-sm text-zinc-100 truncate max-w-xs sm:max-w-md">
                        {file.filename}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {formatBytes(file.size)} • Uploaded {formatRelativeTime(file.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFileForShare(file)}
                      className="text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 h-8"
                    >
                      <Share2 className="h-3.5 w-3.5 mr-1" />
                      <span>Share</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFileForDelete(file)}
                      className="text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8 p-0"
                      title="Delete to free space"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ShareModal
        file={selectedFileForShare}
        open={Boolean(selectedFileForShare)}
        onOpenChange={(open) => !open && setSelectedFileForShare(null)}
      />

      <DeleteConfirmModal
        file={selectedFileForDelete}
        open={Boolean(selectedFileForDelete)}
        onOpenChange={(open) => !open && setSelectedFileForDelete(null)}
      />
    </DashboardLayout>
  );
}
