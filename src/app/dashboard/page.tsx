"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DropZone } from "@/components/upload/DropZone";
import { ShareModal } from "@/components/sharing/ShareModal";
import { FileDetailsDrawer } from "@/components/files/FileDetailsDrawer";
import { RenameModal } from "@/components/files/RenameModal";
import { DeleteConfirmModal } from "@/components/files/DeleteConfirmModal";
import { useAuth } from "@/lib/auth/context";
import { useStorage } from "@/lib/storage/store";
import { useLanguage } from "@/lib/i18n/context";
import { CloudFile, ShareLink } from "@/types";
import { formatBytes, formatRelativeTime, formatExpiresIn, getFileCategory } from "@/lib/utils";
import {
  FileText,
  FileArchive,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  HardDrive,
  Share2,
  Download,
  MoreVertical,
  ArrowRight,
  Sparkles,
  Clock,
  Lock,
  Eye,
  Trash2,
  Edit2,
  CheckCircle2,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { user } = useAuth();
  const { files, shares, stats } = useStorage();
  const { t } = useLanguage();

  // Modals state
  const [selectedFileForShare, setSelectedFileForShare] = useState<CloudFile | null>(null);
  const [selectedFileForDetails, setSelectedFileForDetails] = useState<CloudFile | null>(null);
  const [selectedFileForRename, setSelectedFileForRename] = useState<CloudFile | null>(null);
  const [selectedFileForDelete, setSelectedFileForDelete] = useState<CloudFile | null>(null);

  const renderFileIcon = (file: CloudFile) => {
    const cat = getFileCategory(file.mimeType, file.filename);
    switch (cat) {
      case "archive":
        return <FileArchive className="h-5 w-5 text-amber-400" />;
      case "image":
        return <FileImage className="h-5 w-5 text-emerald-400" />;
      case "video":
        return <FileVideo className="h-5 w-5 text-purple-400" />;
      case "audio":
        return <FileAudio className="h-5 w-5 text-pink-400" />;
      case "code":
        return <FileCode className="h-5 w-5 text-cyan-400" />;
      default:
        return <FileText className="h-5 w-5 text-sky-400" />;
    }
  };

  const recentFiles = files.slice(0, 5);
  const recentShares = shares.slice(0, 3);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header & Statistics */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>{t.dashboard.welcomeBack} {user?.displayName || "NearDrop User"}</span>
                <span className="inline-block animate-wave">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                {t.dashboard.subtitle}
              </p>
            </div>
            <Link href="/files">
              <Button variant="outline" size="sm" className="gap-1.5 self-start sm:self-auto">
                <FolderOpen className="h-4 w-4 text-sky-400" />
                <span>{t.dashboard.viewAllFiles} ({files.length})</span>
              </Button>
            </Link>
          </div>

          {/* Quick Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{t.dashboard.filesStored}</span>
                <FileText className="h-4 w-4 text-zinc-500" />
              </div>
              <p className="text-2xl font-bold text-white tracking-tight">{stats.filesCount}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{t.dashboard.cloudStorage}</span>
                <HardDrive className="h-4 w-4 text-sky-400" />
              </div>
              <p className="text-2xl font-bold text-sky-400 tracking-tight">
                {formatBytes(stats.usedBytes)}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{t.dashboard.activeShares}</span>
                <Share2 className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400 tracking-tight">
                {stats.sharedCount}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{t.dashboard.totalDownloads}</span>
                <Download className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-indigo-400 tracking-tight">
                {stats.totalDownloads}
              </p>
            </div>
          </div>
        </div>

        {/* Hero DropZone Upload */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <span>{t.dashboard.instantCloudUpload}</span>
            </h2>
            <span className="text-[11px] text-zinc-500">{t.dashboard.encryptedR2Storage}</span>
          </div>
          <DropZone />
        </div>

        {/* Recent Files Table & Active Shares */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Files (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white">{t.dashboard.recentFiles}</h3>
              <Link
                href="/files"
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                <span>{t.dashboard.browseAll}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentFiles.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center space-y-2">
                <FolderOpen className="h-8 w-8 text-zinc-600 mx-auto" />
                <h4 className="text-sm font-semibold text-zinc-300">{t.dashboard.noFilesTitle}</h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {t.dashboard.noFilesDesc}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden divide-y divide-zinc-800/60">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-zinc-800/40 transition-colors group"
                  >
                    {/* Left: Icon & Info */}
                    <div
                      className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                      onClick={() => setSelectedFileForDetails(file)}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/60 flex-shrink-0">
                        {renderFileIcon(file)}
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="font-semibold text-xs sm:text-sm text-zinc-100 truncate group-hover:text-sky-300 transition-colors">
                          {file.filename}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span>{formatBytes(file.size)}</span>
                          <span>•</span>
                          <span>{formatRelativeTime(file.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFileForShare(file)}
                        className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 gap-1.5 text-xs h-8"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{t.dashboard.share}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFileForDetails(file)}
                        className="text-zinc-400 hover:text-white h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFileForDelete(file)}
                        className="text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Shares Column (1 col) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-bold text-white">{t.dashboard.activeSharesTitle}</h3>
              <Link
                href="/shared"
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
              >
                <span>{t.dashboard.manage}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentShares.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center space-y-2">
                <Share2 className="h-6 w-6 text-zinc-600 mx-auto" />
                <p className="text-xs text-zinc-400 font-medium">{t.dashboard.noActiveShares}</p>
                <p className="text-[11px] text-zinc-500">
                  {t.dashboard.noActiveSharesDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentShares.map((share) => {
                  const file = files.find((f) => f.id === share.cloudFileId);
                  return (
                    <div
                      key={share.id}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {file?.filename || t.dashboard.sharedFile}
                          </p>
                          <p className="font-mono text-[10px] text-sky-400 mt-0.5">/s/{share.token}</p>
                        </div>
                        <Badge variant="success" className="text-[10px]">
                          {share.downloadCount} dl
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-zinc-500" />
                          {formatExpiresIn(share.expiresAt)}
                        </span>
                        {share.passwordProtected && (
                          <span className="flex items-center gap-1 text-amber-400">
                            <Lock className="h-3 w-3" />
                            {t.dashboard.locked}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <ShareModal
        file={selectedFileForShare}
        open={Boolean(selectedFileForShare)}
        onOpenChange={(open) => !open && setSelectedFileForShare(null)}
      />

      <FileDetailsDrawer
        file={selectedFileForDetails}
        open={Boolean(selectedFileForDetails)}
        onClose={() => setSelectedFileForDetails(null)}
        onShare={(f) => setSelectedFileForShare(f)}
        onDelete={(f) => setSelectedFileForDelete(f)}
      />

      <RenameModal
        file={selectedFileForRename}
        open={Boolean(selectedFileForRename)}
        onOpenChange={(open) => !open && setSelectedFileForRename(null)}
      />

      <DeleteConfirmModal
        file={selectedFileForDelete}
        open={Boolean(selectedFileForDelete)}
        onOpenChange={(open) => !open && setSelectedFileForDelete(null)}
      />
    </DashboardLayout>
  );
}
