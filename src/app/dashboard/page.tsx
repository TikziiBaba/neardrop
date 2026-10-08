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
  const { t, locale } = useLanguage();

  // Modals state
  const [selectedFileForShare, setSelectedFileForShare] = useState<CloudFile | null>(null);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<CloudFile | null>(null);
  const [selectedFileForRename, setSelectedFileForRename] = useState<CloudFile | null>(null);
  const [selectedFileForDelete, setSelectedFileForDelete] = useState<CloudFile | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Dynamic Greeting based on current local hour and language
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (locale === "tr") {
      if (hour >= 5 && hour < 12) return "Günaydın";
      if (hour >= 12 && hour < 18) return "Tünaydın";
      if (hour >= 18 && hour < 22) return "İyi akşamlar";
      return "İyi geceler";
    }
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    if (hour >= 18 && hour < 22) return "Good evening";
    return "Good night";
  }, [locale]);

  // Category statistics breakdown
  const categoryStats = useMemo(() => {
    const counts = {
      image: { count: 0, bytes: 0, label: "Images", color: "bg-success", text: "text-success" },
      video: { count: 0, bytes: 0, label: "Videos", color: "bg-file-video", text: "text-file-video" },
      document: { count: 0, bytes: 0, label: "Documents", color: "bg-accent", text: "text-accent-text" },
      archive: { count: 0, bytes: 0, label: "Archives", color: "bg-warning", text: "text-warning" },
      code: { count: 0, bytes: 0, label: "Code & Other", color: "bg-subtle", text: "text-muted-foreground" },
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
        return <FileArchive className={`${sizeCls} text-warning`} />;
      case "image":
        return <FileImage className={`${sizeCls} text-success`} />;
      case "video":
        return <FileVideo className={`${sizeCls} text-file-video`} />;
      case "audio":
        return <FileAudio className={`${sizeCls} text-file-audio`} />;
      case "code":
        return <FileCode className={`${sizeCls} text-accent-text`} />;
      default:
        return <FileText className={`${sizeCls} text-accent-text`} />;
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
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
          {/* Ambient luminous glow circles */}
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[11px] font-mono border-white/[0.08] text-accent-text bg-accent/10 py-0.5 px-2.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping mr-1.5 inline-block" />
                  {locale === "tr" ? "Bulut Çevrimiçi • Güvenli Depolama" : "Cloud Online • Secure Storage"}
                </Badge>
                <span className="text-xs text-subtle font-mono">
                  {new Date().toLocaleDateString(locale === "tr" ? "tr-TR" : "en-US", { weekday: "long", day: "numeric", month: "long" })}
                </span>
              </div>

              <h1 className="page-title">
                <span>{greeting}, </span>
                <span className="bg-gradient-to-r from-accent via-success to-accent bg-clip-text text-transparent">
                  {user?.displayName || "NearDrop User"}
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                {locale === "tr"
                  ? "Varlıklarınızı güvenle saklayın, fotoğraf ve videoları doğrudan tarayıcınızda önizleyin ve şifreli bağlantılarla paylaşın."
                  : "Store your assets securely, preview photos and videos directly in your browser, and share with encrypted links."}
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/files">
                <Button
                  variant="primary"
                  size="default"
                  className="px-5 py-2.5 rounded-2xl bg-accent hover:bg-accent-hover shadow-md shadow-accent/20 gap-2 text-xs sm:text-sm font-semibold whitespace-nowrap text-white"
                >
                  <FolderOpen className="h-4 w-4 text-white" />
                  <span className="text-white">{locale === "tr" ? "Dosyalarım" : "My Files"}</span>
                </Button>
              </Link>
              <Link href="/shared">
                <Button
                  variant="outline"
                  size="default"
                  className="px-5 py-2.5 rounded-2xl border-white/[0.08] bg-surface/80 hover:bg-surface-secondary gap-2 text-xs sm:text-sm font-semibold whitespace-nowrap text-white"
                >
                  <Share2 className="h-4 w-4 text-success" />
                  <span className="text-white">{locale === "tr" ? "Paylaşılanlar" : "Shared"} ({shares.length})</span>
                </Button>
              </Link>
              <Link href="/transfers">
                <Button
                  variant="outline"
                  size="default"
                  className="px-5 py-2.5 rounded-2xl border-white/[0.08] bg-surface/80 hover:bg-surface-secondary gap-2 text-xs sm:text-sm font-semibold whitespace-nowrap text-white"
                >
                  <Activity className="h-4 w-4 text-accent-text" />
                  <span className="text-white">{locale === "tr" ? "Aktarımlar" : "Transfers"}</span>
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
          <div className="rounded-3xl border border-white/[0.08] bg-surface/80 backdrop-blur-2xl p-5 space-y-3 hover:border-white/[0.16] transition-all shadow-lg group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t.dashboard.filesStored}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent-text group-hover:scale-110 transition-transform">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stats.filesCount}</p>
              <span className="text-xs text-subtle font-mono">
                {locale === "tr" ? "dosya & klasör" : "files & folders"}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06] text-[11px] text-muted-foreground">
              <span className="text-success font-medium">📷 {categoryStats.counts.image.count} {locale === "tr" ? "Görsel" : "Images"}</span>
              <span>•</span>
              <span className="text-file-video font-medium">🎬 {categoryStats.counts.video.count} {locale === "tr" ? "Video" : "Videos"}</span>
            </div>
          </div>

          {/* Cloud Storage Used Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-surface/80 backdrop-blur-2xl p-5 space-y-3 hover:border-white/[0.16] transition-all shadow-lg group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t.dashboard.cloudStorage}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 border border-success/20 text-success group-hover:scale-110 transition-transform">
                <HardDrive className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-bold text-success tracking-tight">{formatBytes(stats.usedBytes)}</p>
              <span className="text-xs text-subtle font-mono">/ {formatBytes(stats.quotaBytes || 2147483648)}</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-surface-secondary/80 rounded-full h-1.5 overflow-hidden p-0.5 border border-white/[0.04]">
                <div
                  className="bg-gradient-to-r from-success to-accent h-full rounded-full transition-all duration-500 shadow-sm shadow-success/30"
                  style={{ width: `${Math.max(2, quotaPercent)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground text-right font-mono">
                {quotaPercent}% {locale === "tr" ? "Dolu" : "Used"}
              </p>
            </div>
          </div>

          {/* Active Shares Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-surface/80 backdrop-blur-2xl p-5 space-y-3 hover:border-white/[0.16] transition-all shadow-lg group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t.dashboard.activeShares}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 border border-success/20 text-success group-hover:scale-110 transition-transform">
                <Share2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-bold text-success tracking-tight">{stats.sharedCount}</p>
              <Badge variant="success" className="text-[10px] bg-success/15 text-success border-success/25">
                {locale === "tr" ? "Canlı Linkler" : "Live Links"}
              </Badge>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[11px] text-muted-foreground">
              <span>{locale === "tr" ? "Şifreli & Süreli" : "Encrypted & Ephemeral"}</span>
              <Link href="/shared" className="text-accent-text hover:underline flex items-center gap-0.5">
                {t.dashboard.manage || (locale === "tr" ? "Yönet" : "Manage")} <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Total Downloads Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-surface/80 backdrop-blur-2xl p-5 space-y-3 hover:border-white/[0.16] transition-all shadow-lg group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t.dashboard.totalDownloads}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 border border-accent/20 text-accent-text group-hover:scale-110 transition-transform">
                <Download className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl sm:text-3xl font-bold text-accent-text tracking-tight">{stats.totalDownloads}</p>
              <span className="text-xs text-subtle font-mono">
                {locale === "tr" ? "başarılı indirme" : "successful hits"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 text-success font-medium">
                <Zap className="h-3 w-3" /> {locale === "tr" ? "Doğrudan Edge Akışı" : "Direct Edge Stream"}
              </span>
              <span className="text-subtle font-mono">{locale === "tr" ? "Sıfır Bekleme" : "Zero Waiting"}</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. STORAGE DISTRIBUTION BREAKDOWN BAR                     */}
        {/* ========================================================= */}
        <div className="rounded-2xl border border-border/80 bg-surface/40 p-4 sm:p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent-text" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                {locale === "tr" ? "Depolama Dağılımı" : "Storage Distribution"}
              </h3>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {locale === "tr"
                ? `Toplam ${formatBytes(stats.usedBytes)} (${files.length} dosya)`
                : `Total ${formatBytes(stats.usedBytes)} across ${files.length} files`}
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full bg-surface-secondary/80 h-3 rounded-xl overflow-hidden flex shadow-inner">
            {categoryStats.percentages.image > 0 && (
              <div
                style={{ width: `${categoryStats.percentages.image}%` }}
                className="bg-success hover:opacity-90 transition-all"
                title={`${locale === "tr" ? "Fotoğraflar" : "Photos"}: ${formatBytes(categoryStats.counts.image.bytes)} (${categoryStats.percentages.image}%)`}
              />
            )}
            {categoryStats.percentages.video > 0 && (
              <div
                style={{ width: `${categoryStats.percentages.video}%` }}
                className="bg-file-video hover:opacity-90 transition-all"
                title={`${locale === "tr" ? "Videolar" : "Videos"}: ${formatBytes(categoryStats.counts.video.bytes)} (${categoryStats.percentages.video}%)`}
              />
            )}
            {categoryStats.percentages.document > 0 && (
              <div
                style={{ width: `${categoryStats.percentages.document}%` }}
                className="bg-accent hover:opacity-90 transition-all"
                title={`${locale === "tr" ? "Belgeler" : "Documents"}: ${formatBytes(categoryStats.counts.document.bytes)} (${categoryStats.percentages.document}%)`}
              />
            )}
            {categoryStats.percentages.archive > 0 && (
              <div
                style={{ width: `${categoryStats.percentages.archive}%` }}
                className="bg-warning hover:opacity-90 transition-all"
                title={`${locale === "tr" ? "Arşivler" : "Archives"}: ${formatBytes(categoryStats.counts.archive.bytes)} (${categoryStats.percentages.archive}%)`}
              />
            )}
            {categoryStats.percentages.code > 0 && (
              <div
                style={{ width: `${categoryStats.percentages.code}%` }}
                className="bg-subtle hover:opacity-90 transition-all"
                title={`${locale === "tr" ? "Kod Dosyaları" : "Code"}: ${formatBytes(categoryStats.counts.code.bytes)} (${categoryStats.percentages.code}%)`}
              />
            )}
          </div>

          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-success" />
              <span>{locale === "tr" ? "Görseller" : "Images"} ({formatBytes(categoryStats.counts.image.bytes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-file-video" />
              <span>{locale === "tr" ? "Videolar" : "Videos"} ({formatBytes(categoryStats.counts.video.bytes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span>{locale === "tr" ? "Belgeler" : "Documents"} ({formatBytes(categoryStats.counts.document.bytes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-warning" />
              <span>{locale === "tr" ? "Arşivler" : "Archives"} ({formatBytes(categoryStats.counts.archive.bytes)})</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. HERO DROPZONE UPLOAD AREA                              */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-text" />
              <span>{t.dashboard.instantCloudUpload}</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success inline" />
              <span>{t.dashboard.encryptedR2Storage}</span>
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
                <Play className="h-4 w-4 text-file-video" />
                <h3 className="text-sm font-bold text-white">
                  {locale === "tr" ? "Son Medyalar (Fotoğraf & Video)" : "Recent Media (Photos & Videos)"}
                </h3>
                <Badge variant="secondary" className="text-[10px]">
                  {recentMediaFiles.length} {locale === "tr" ? "medya" : "media"}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {locale === "tr"
                  ? "Önizlemek veya tam ekranda oynatmak için tıklayın"
                  : "Click to preview or play in full screen"}
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
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface/70 p-3 hover:border-accent/50 hover:bg-surface/90 transition-all cursor-pointer shadow-md hover:shadow-accent/5"
                  >
                    {/* Media Preview Box */}
                    <div className="relative aspect-square w-full rounded-xl bg-background/80 border border-border/80 flex items-center justify-center overflow-hidden group-hover:border-accent/30 transition-colors">
                      {isVid ? (
                        <div className="flex flex-col items-center justify-center gap-1 text-file-video">
                          <FileVideo className="h-8 w-8" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-file-video text-white shadow-lg">
                              <Play className="h-5 w-5 ml-0.5 fill-white" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-1 text-success">
                          <FileImage className="h-8 w-8" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success text-white shadow-lg">
                              <Eye className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-2 left-2">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm ${
                          isVid ? "bg-file-video/80 text-white" : "bg-success/80 text-white"
                        }`}>
                          {ext}
                        </span>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="mt-2.5 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate group-hover:text-accent-text transition-colors">
                        {file.filename.split("/").pop() || file.filename}
                      </p>
                      <p className="text-[10px] text-subtle font-mono mt-0.5">
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
                  {files.length} {locale === "tr" ? "dosya" : "files"}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {/* Search Bar in Recent Files */}
                <div className="relative w-full sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-subtle" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={locale === "tr" ? "Dosyalarda ara..." : "Search files..."}
                    className="w-full bg-surface border border-border rounded-2xl pl-8 pr-2.5 py-1 text-xs text-foreground placeholder-subtle focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <Link
                  href="/files"
                  className="text-xs font-semibold text-accent-text hover:text-accent-text flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  <span>{t.dashboard.browseAll}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {filteredRecentFiles.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface/40 p-8 text-center space-y-2">
                <FolderOpen className="h-8 w-8 text-subtle/80 mx-auto" />
                <h4 className="text-sm font-semibold text-foreground/80">
                  {searchQuery
                    ? (locale === "tr" ? "Eşleşen dosya bulunamadı" : "No matching files found")
                    : t.dashboard.noFilesTitle}
                </h4>
                <p className="text-xs text-subtle max-w-sm mx-auto">
                  {searchQuery
                    ? (locale === "tr" ? `"${searchQuery}" için sonuç bulunamadı.` : `No results found for "${searchQuery}".`)
                    : t.dashboard.noFilesDesc}
                </p>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/[0.08] bg-surface/80 overflow-hidden divide-y divide-white/[0.06] shadow-xl backdrop-blur-xl">
                {filteredRecentFiles.map((file) => {
                  const cat = getFileCategory(file.mimeType, file.filename);

                  return (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 sm:p-4 hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      onClick={() => setSelectedFileForPreview(file)}
                    >
                      {/* Left: Icon & Info */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-white/[0.08] flex-shrink-0 group-hover:border-accent/40 transition-colors shadow-sm">
                          {renderFileIcon(file)}
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-accent-text transition-colors">
                            {file.filename.split("/").pop() || file.filename}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 font-mono">
                            <span>{formatBytes(file.size)}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(file.createdAt)}</span>
                            <Badge variant="outline" className="text-[9px] py-0 px-1.5 text-muted-foreground border-white/[0.08]">
                              {cat.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div
                        className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFileForPreview(file)}
                          className="text-muted-foreground hover:text-accent-text hover:bg-accent/10 h-8 px-2 text-xs gap-1"
                          title={locale === "tr" ? "Önizle" : "Preview"}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{locale === "tr" ? "Önizle" : "Preview"}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFileForShare(file)}
                          className="text-muted-foreground hover:text-success hover:bg-success/10 gap-1.5 text-xs h-8 px-2"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">{t.dashboard.share}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          className="text-muted-foreground hover:text-white h-8 w-8 p-0"
                          title={locale === "tr" ? "İndir" : "Download"}
                        >
                          <Download className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFileForRename(file)}
                          className="text-muted-foreground hover:text-white h-8 w-8 p-0"
                          title={locale === "tr" ? "Yeniden Adlandır" : "Rename"}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFileForDelete(file)}
                          className="text-muted-foreground hover:text-danger hover:bg-danger/10 h-8 w-8 p-0"
                          title={locale === "tr" ? "Sil" : "Delete"}
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
                  className="text-xs font-semibold text-accent-text hover:text-accent-text flex items-center gap-1 transition-colors"
                >
                  <span>{t.dashboard.manage}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {recentShares.length === 0 ? (
                <div className="rounded-2xl border border-border bg-surface/40 p-6 text-center space-y-2">
                  <Share2 className="h-6 w-6 text-subtle/80 mx-auto" />
                  <p className="text-xs text-muted-foreground font-medium">{t.dashboard.noActiveShares}</p>
                  <p className="text-[11px] text-subtle">
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
                        className="rounded-2xl border border-border bg-surface/60 p-4 space-y-3 hover:border-border-strong transition-colors shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                              {file?.filename?.split("/").pop() || t.dashboard.sharedFile}
                            </p>
                            <p className="font-mono text-[10px] text-accent-text mt-0.5">/s/{share.token}</p>
                          </div>
                          <button
                            onClick={() => handleCopyShareLink(share)}
                            className={`p-1.5 rounded-2xl border transition-all ${
                              isCopied
                                ? "border-success/40 bg-success/10 text-success"
                                : "border-border-strong/60 bg-surface-secondary text-muted-foreground hover:text-white hover:border-accent/40"
                            }`}
                            title="Copy Link"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-subtle" />
                            {formatExpiresIn(share.expiresAt)}
                          </span>
                          <div className="flex items-center gap-2">
                            {share.passwordProtected && (
                              <span className="flex items-center gap-1 text-warning">
                                <Lock className="h-3 w-3" />
                                {t.dashboard.locked}
                              </span>
                            )}
                            <Badge variant="success" className="text-[10px]">
                              {share.downloadCount} {locale === "tr" ? "indirme" : "downloads"}
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
            <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-surface/70 via-surface/30 to-background p-5 space-y-3.5 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span>
                  {locale === "tr" ? "NearDrop Güvenlik & Altyapı" : "NearDrop Security & Infrastructure"}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">
                    {locale === "tr" ? "Şifreleme Standardı" : "Encryption Standard"}
                  </span>
                  <span className="font-mono text-foreground">AES-256-GCM</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">
                    {locale === "tr" ? "Küresel Edge CDN" : "Global Edge CDN"}
                  </span>
                  <span className="text-success font-medium">
                    {locale === "tr" ? "Aktif • 280+ Konum" : "Active • 280+ Locations"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground">
                    {locale === "tr" ? "Gizlilik Mimarisi" : "Privacy Architecture"}
                  </span>
                  <span className="text-foreground">
                    {locale === "tr" ? "Sıfır-Bilgi (Zero-Knowledge)" : "Zero-Knowledge"}
                  </span>
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

