"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DropZone } from "@/components/upload/DropZone";
import { ShareModal } from "@/components/sharing/ShareModal";
import { FilePreviewModal } from "@/components/files/FilePreviewModal";
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
  ArrowRight,
  Sparkles,
  Clock,
  Lock,
  Eye,
  Trash2,
  Edit2,
  CheckCircle2,
  FolderOpen,
  Play,
  Copy,
  Check,
  Search,
  ShieldCheck,
  Zap,
  Layers,
  ArrowUpRight,
  Activity,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuth();
  const { files, shares, stats, downloadFile } = useStorage();
  const { t } = useLanguage();

  // Modals state
  const [selectedFileForShare, setSelectedFileForShare] = useState<CloudFile | null>(null);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<CloudFile | null>(null);
  const [selectedFileForRename, setSelectedFileForRename] = useState<CloudFile | null>(null);
  const [selectedFileForDelete, setSelectedFileForDelete] = useState<CloudFile | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Dynamic Greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    if (hour >= 18 && hour < 22) return "Good evening";
    return "Good night";
  }, []);

  // Category statistics breakdown
  const categoryStats = useMemo(() => {
    const counts = {
      image: { count: 0, bytes: 0, label: "Images", color: "bg-emerald-500", text: "text-emerald-400" },
      video: { count: 0, bytes: 0, label: "Videos", color: "bg-purple-500", text: "text-purple-400" },
      document: { count: 0, bytes: 0, label: "Documents", color: "bg-sky-500", text: "text-sky-400" },
      archive: { count: 0, bytes: 0, label: "Archives", color: "bg-amber-500", text: "text-amber-400" },
      code: { count: 0, bytes: 0, label: "Code & Other", color: "bg-pink-500", text: "text-pink-400" },
    };

    files.forEach((f) => {
      const cat = getFileCategory(f.mimeType, f.filename);
      if (cat === "image") {
        counts.image.count += 1;
        counts.image.bytes += f.size || 0;
      } else if (cat === "video") {
        counts.video.count += 1;
        counts.video.bytes += f.size || 0;
      } else if (cat === "document") {
        counts.document.count += 1;
        counts.document.bytes += f.size || 0;
      } else if (cat === "archive") {
        counts.archive.count += 1;
        counts.archive.bytes += f.size || 0;
      } else {
        counts.code.count += 1;
        counts.code.bytes += f.size || 0;
      }
    });

    const totalBytes = Math.max(stats.usedBytes || 1, 1);
    return {
      counts,
      percentages: {
        image: Math.round((counts.image.bytes / totalBytes) * 100),
        video: Math.round((counts.video.bytes / totalBytes) * 100),
        document: Math.round((counts.document.bytes / totalBytes) * 100),
        archive: Math.round((counts.archive.bytes / totalBytes) * 100),
        code: Math.round((counts.code.bytes / totalBytes) * 100),
      },
    };
  }, [files, stats.usedBytes]);

  // Recent Media Files (Photos and Videos for visual showcase)
  const recentMediaFiles = useMemo(() => {
    return files
      .filter((f) => {
        const cat = getFileCategory(f.mimeType, f.filename);
        return cat === "image" || cat === "video";
      })
      .slice(0, 6);
  }, [files]);

  // Filtered recent files
  const filteredRecentFiles = useMemo(() => {
    if (!searchQuery.trim()) return files.slice(0, 7);
    const q = searchQuery.toLowerCase();
    return files
      .filter((f) => f.filename.toLowerCase().includes(q))
      .slice(0, 7);
  }, [files, searchQuery]);

  const recentShares = useMemo(() => shares.slice(0, 4), [shares]);

  // Render file icon helper
  const renderFileIcon = (file: CloudFile, large = false) => {
    const cat = getFileCategory(file.mimeType, file.filename);
    const sizeCls = large ? "h-6 w-6" : "h-5 w-5";
    switch (cat) {
      case "archive":
        return <FileArchive className={`${sizeCls} text-amber-400`} />;
      case "image":
        return <FileImage className={`${sizeCls} text-emerald-400`} />;
      case "video":
        return <FileVideo className={`${sizeCls} text-purple-400`} />;
      case "audio":
        return <FileAudio className={`${sizeCls} text-pink-400`} />;
      case "code":
        return <FileCode className={`${sizeCls} text-cyan-400`} />;
      default:
        return <FileText className={`${sizeCls} text-sky-400`} />;
    }
  };

  const handleCopyShareLink = async (share: ShareLink) => {
    const url = `${window.location.origin}/s/${share.token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedShareId(share.id);
      toast.success("Share link copied to clipboard!");
      setTimeout(() => setCopiedShareId(null), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDownload = async (file: CloudFile) => {
    try {
      await downloadFile(file.id);
      toast.success("Download started!");
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    }
  };

  const quotaPercent = useMemo(() => {
    if (!stats.quotaBytes || stats.quotaBytes <= 0) return 0;
    return Math.min(100, Math.round((stats.usedBytes / stats.quotaBytes) * 100));
  }, [stats.usedBytes, stats.quotaBytes]);

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        {/* ========================================================= */}
        {/* 1. HERO GREETING & COMMAND BAR                            */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/90 via-zinc-900/50 to-zinc-950 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Ambient luminous glow circles */}
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[11px] font-mono border-sky-500/30 text-sky-400 bg-sky-500/10 py-0.5 px-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5 inline-block" />
                  Cloud Online • R2 Object Storage
                </Badge>
                <span className="text-xs text-zinc-500">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                <span>{greeting}, </span>
                <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  {user?.displayName || "NearDrop User"}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                Store your assets securely, preview photos and videos directly in your browser, and share with encrypted links.
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <Link href="/files">
                <Button variant="primary" size="sm" className="gap-2 shadow-lg shadow-sky-500/20 text-xs sm:text-sm h-9">
                  <FolderOpen className="h-4 w-4" />
                  <span>My Files</span>
                </Button>
              </Link>
              <Link href="/shared">
                <Button variant="outline" size="sm" className="gap-2 border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-xs sm:text-sm h-9">
                  <Share2 className="h-4 w-4 text-emerald-400" />
                  <span>Shared ({shares.length})</span>
                </Button>
              </Link>
              <Link href="/transfers">
                <Button variant="outline" size="sm" className="gap-2 border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-xs sm:text-sm h-9">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span>Transfers</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. KEY METRICS & STORAGE QUOTA GAUGE                      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Files Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-3 hover:border-zinc-700/80 transition-all shadow-md group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">{t.dashboard.filesStored}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stats.filesCount}</p>
              <span className="text-xs text-zinc-500 font-mono">files & folders</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-zinc-800/50 text-[11px] text-zinc-400">
              <span className="text-emerald-400 font-medium">📷 {categoryStats.counts.image.count} Images</span>
              <span>•</span>
              <span className="text-purple-400 font-medium">🎬 {categoryStats.counts.video.count} Videos</span>
            </div>
          </div>

          {/* Cloud Storage Used Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-3 hover:border-zinc-700/80 transition-all shadow-md group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">{t.dashboard.cloudStorage}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 group-hover:scale-110 transition-transform">
                <HardDrive className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-bold text-teal-300 tracking-tight">{formatBytes(stats.usedBytes)}</p>
              <span className="text-xs text-zinc-500 font-mono">/ {formatBytes(stats.quotaBytes || 2147483648)}</span>
            </div>
            <div className="space-y-1 pt-1">
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-sky-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(2, quotaPercent)}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-500 text-right font-mono">{quotaPercent}% Used</p>
            </div>
          </div>

          {/* Active Shares Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-3 hover:border-zinc-700/80 transition-all shadow-md group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">{t.dashboard.activeShares}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Share2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight">{stats.sharedCount}</p>
              <Badge variant="success" className="text-[10px]">Live Links</Badge>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50 text-[11px] text-zinc-400">
              <span>Encrypted & Ephemeral</span>
              <Link href="/shared" className="text-sky-400 hover:underline flex items-center gap-0.5">
                Manage <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Total Downloads Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 space-y-3 hover:border-zinc-700/80 transition-all shadow-md group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">{t.dashboard.totalDownloads}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <Download className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-bold text-purple-400 tracking-tight">{stats.totalDownloads}</p>
              <span className="text-xs text-zinc-500 font-mono">successful hits</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Zap className="h-3 w-3" /> Direct Edge Stream
              </span>
              <span className="text-zinc-500 font-mono">Zero Waiting</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. STORAGE DISTRIBUTION BREAKDOWN BAR                     */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Storage Distribution</h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              Total {formatBytes(stats.usedBytes)} across {files.length} files
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full bg-zinc-800/80 h-3 rounded-xl overflow-hidden flex shadow-inner">
            {categoryStats.percentages.image > 0 && (
              <div
                style={{ width: `${categoryStats.percentages.image}%` }}
                className="bg-emerald-500 hover:opacity-90 transition-all"
                title={`Photos: ${formatBytes(categoryStats.counts.image.bytes)} (${categoryStats.percentages.image}%)`}
              />
            )}
            {categoryStats.percentages.video > 0 && (
              <div
                style={{ width: `${categoryStats.percentages.video}%` }}
                className="bg-purple-500 hover:opacity-90 transition-all"
                title={`Videos: ${formatBytes(categoryStats.counts.video.bytes)} (${categoryStats.percentages.video}%)`}
              />
            )}
            {categoryStats.percentages.document > 0 && (
              <div
                style={{ width: `${categoryStats.percentages.document}%` }}
                className="bg-sky-500 hover:opacity-90 transition-all"
                title={`Documents: ${formatBytes(categoryStats.counts.document.bytes)} (${categoryStats.percentages.document}%)`}
              />
            )}
            {categoryStats.percentages.archive > 0 && (
              <div
                style={{ width: `${categoryStats.percentages.archive}%` }}
                className="bg-amber-500 hover:opacity-90 transition-all"
                title={`Archives: ${formatBytes(categoryStats.counts.archive.bytes)} (${categoryStats.percentages.archive}%)`}
              />
            )}
            {categoryStats.percentages.code > 0 && (
              <div
                style={{ width: `${categoryStats.percentages.code}%` }}
                className="bg-pink-500 hover:opacity-90 transition-all"
                title={`Code: ${formatBytes(categoryStats.counts.code.bytes)} (${categoryStats.percentages.code}%)`}
              />
            )}
          </div>

          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-zinc-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Images ({formatBytes(categoryStats.counts.image.bytes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>Videos ({formatBytes(categoryStats.counts.video.bytes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Documents ({formatBytes(categoryStats.counts.document.bytes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Archives ({formatBytes(categoryStats.counts.archive.bytes)})</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. HERO DROPZONE UPLOAD AREA                              */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <span>{t.dashboard.instantCloudUpload}</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400 inline" />
              <span>End-to-End Encrypted R2 Storage</span>
            </div>
          </div>
          <DropZone />
        </div>

        {/* ========================================================= */}
        {/* 5. NEW: RECENT MEDIA SHOWCASE (PHOTOS & VIDEOS)           */}
        {/* ========================================================= */}
        {recentMediaFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Play className="h-4 w-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Recent Media (Photos & Videos)</h3>
                <Badge variant="secondary" className="text-[10px]">
                  {recentMediaFiles.length} media
                </Badge>
              </div>
              <span className="text-xs text-zinc-400 hidden sm:inline">
                Click to preview or play in full screen
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {recentMediaFiles.map((file) => {
                const cat = getFileCategory(file.mimeType, file.filename);
                const isVid = cat === "video";
                const ext = file.filename.split(".").pop()?.toUpperCase() || "MEDYA";

                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFileForPreview(file)}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 hover:border-sky-500/50 hover:bg-zinc-900/90 transition-all cursor-pointer shadow-md hover:shadow-sky-500/5"
                  >
                    {/* Media Preview Box */}
                    <div className="relative aspect-square w-full rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-center overflow-hidden group-hover:border-sky-500/30 transition-colors">
                      {isVid ? (
                        <div className="flex flex-col items-center justify-center gap-1 text-purple-400">
                          <FileVideo className="h-8 w-8" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg">
                              <Play className="h-5 w-5 ml-0.5 fill-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-emerald-400">
                          <FileImage className="h-8 w-8" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg">
                              <Eye className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm ${
                          isVid ? "bg-purple-500/80 text-white" : "bg-emerald-500/80 text-white"
                        }`}>
                          {ext}
                        </span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="mt-2.5 min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate group-hover:text-sky-300 transition-colors">
                        {file.filename.split("/").pop() || file.filename}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {formatBytes(file.size)} • {formatRelativeTime(file.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. RECENT FILES TABLE & ACTIVE SHARES                     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Files (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">{t.dashboard.recentFiles}</h3>
                <Badge variant="secondary" className="text-[10px]">
                  {files.length} files
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Bar in Recent Files */}
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>

                <Link
                  href="/files"
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  <span>{t.dashboard.browseAll}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {filteredRecentFiles.length === 0 ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center space-y-2">
                <FolderOpen className="h-8 w-8 text-zinc-600 mx-auto" />
                <h4 className="text-sm font-semibold text-zinc-300">
                  {searchQuery ? "No matching files found" : t.dashboard.noFilesTitle}
                </h4>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {searchQuery ? `No results found for "${searchQuery}".` : t.dashboard.noFilesDesc}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden divide-y divide-zinc-800/60 shadow-lg">
                {filteredRecentFiles.map((file) => {
                  const cat = getFileCategory(file.mimeType, file.filename);
                  const isMedia = cat === "image" || cat === "video";

                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 sm:p-4 hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Left: Icon & Info */}
                      <div
                        className={`flex items-center gap-3.5 min-w-0 flex-1 ${isMedia ? "cursor-pointer" : "cursor-default"}`}
                        onClick={() => {
                          if (isMedia) {
                            setSelectedFileForPreview(file);
                          }
                        }}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/60 flex-shrink-0 group-hover:border-sky-500/40 transition-colors">
                          {renderFileIcon(file)}
                        </div>
                        <div className="min-w-0 truncate">
                          <p className={`font-semibold text-xs sm:text-sm text-zinc-100 truncate transition-colors ${isMedia ? "group-hover:text-sky-300" : ""}`}>
                            {file.filename.split("/").pop() || file.filename}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                            <span>{formatBytes(file.size)}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(file.createdAt)}</span>
                            {isMedia && (
                              <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-zinc-400 border-zinc-700">
                                {cat === "video" ? "🎬 Video Preview" : "📷 Photo Preview"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
                        {isMedia && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFileForPreview(file)}
                            className="text-zinc-400 hover:text-sky-400 hover:bg-sky-500/10 h-8 px-2 text-xs gap-1"
                            title="Preview"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Preview</span>
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFileForShare(file)}
                          className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 gap-1.5 text-xs h-8 px-2"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{t.dashboard.share}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          className="text-zinc-400 hover:text-white h-8 w-8 p-0"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFileForRename(file)}
                          className="text-zinc-400 hover:text-white h-8 w-8 p-0"
                          title="Rename"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFileForDelete(file)}
                          className="text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8 p-0"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Shares & Security Column (1 col) */}
          <div className="space-y-6">
            {/* Active Shares Section */}
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
                    const isCopied = copiedShareId === share.id;

                    return (
                      <div
                        key={share.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 hover:border-zinc-700 transition-colors shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                              {file?.filename?.split("/").pop() || t.dashboard.sharedFile}
                            </p>
                            <p className="font-mono text-[10px] text-sky-400 mt-0.5">/s/{share.token}</p>
                          </div>
                          <button
                            onClick={() => handleCopyShareLink(share)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isCopied
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : "border-zinc-700/60 bg-zinc-800 text-zinc-400 hover:text-white hover:border-sky-500/40"
                            }`}
                            title="Copy Link"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-zinc-500" />
                            {formatExpiresIn(share.expiresAt)}
                          </span>
                          <div className="flex items-center gap-2">
                            {share.passwordProtected && (
                              <span className="flex items-center gap-1 text-amber-400">
                                <Lock className="h-3 w-3" />
                                {t.dashboard.locked}
                              </span>
                            )}
                            <Badge variant="success" className="text-[10px]">
                              {share.downloadCount} downloads
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cloud Security & Health Card */}
            <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-zinc-900/70 via-zinc-900/30 to-zinc-950 p-5 space-y-3.5 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>NearDrop Security & Infrastructure</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-400">Encryption Standard</span>
                  <span className="font-mono text-zinc-200">AES-256-GCM</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-zinc-800/50">
                  <span className="text-zinc-400">Global Edge CDN</span>
                  <span className="text-emerald-400 font-medium">Active • 280+ Locations</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-zinc-400">Privacy Architecture</span>
                  <span className="text-zinc-200">Zero-Knowledge</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals & Preview */}
      <ShareModal
        file={selectedFileForShare}
        open={Boolean(selectedFileForShare)}
        onOpenChange={(open) => !open && setSelectedFileForShare(null)}
      />

      <FilePreviewModal
        file={selectedFileForPreview}
        open={Boolean(selectedFileForPreview)}
        onClose={() => setSelectedFileForPreview(null)}
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

