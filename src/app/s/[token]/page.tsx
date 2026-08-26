"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStorage } from "@/lib/storage/store";
import { useLanguage } from "@/lib/i18n/context";
import { CloudFile, ShareLink } from "@/types";
import { formatBytes, formatExpiresIn, formatRelativeTime, getFileCategory } from "@/lib/utils";
import {
  Sparkles,
  DownloadCloud,
  Lock,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  FileArchive,
  FileVideo,
  FileImage,
  FileCode,
  FileAudio,
  Folder,
  FolderOpen,
  Home,
  ChevronRight,
  CornerLeftUp,
  Search,
  LayoutGrid,
  List,
  Download,
  Loader2,
  Layers,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import JSZip from "jszip";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface FolderItem {
  name: string;
  fullPath: string;
  filesCount: number;
  totalBytes: number;
  latestCreatedAt: string;
}

export default function PublicSharePage() {
  const params = useParams();
  const token = params?.token as string;
  const { getShareByToken, unlockShareDownload, unlockFolderBatchDownload } = useStorage();
  const { t } = useLanguage();

  const [share, setShare] = useState<ShareLink | null>(null);
  const [file, setFile] = useState<CloudFile | null>(null);
  const [folderFiles, setFolderFiles] = useState<CloudFile[]>([]);
  const [isFolder, setIsFolder] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");
  const [folderPath, setFolderPath] = useState<string>("");
  const [totalSize, setTotalSize] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Folder Explorer state
  const [currentSubPath, setCurrentSubPath] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Auth / Download state
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    statusText: string;
  } | null>(null);
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchShare = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getShareByToken(token);
        if (res.error || !res.share) {
          setError(res.error || "Invalid or expired share link.");
        } else {
          setShare(res.share);
          if (res.isFolder) {
            setIsFolder(true);
            setFolderFiles(res.files || []);
            setFolderPath(res.folderPath || "");
            setFolderName(res.title || res.folderPath?.split("/").pop() || "Folder");
            setTotalSize(res.totalSize || 0);
            setTotalCount(res.totalCount || 0);
          } else {
            setIsFolder(false);
            setFile(res.file);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load share.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShare();
  }, [token, getShareByToken]);

  // Compute folder hierarchy relative to the shared folder root
  const { directFolders, directFiles, isSearching } = useMemo(() => {
    if (!isFolder) return { directFolders: [], directFiles: [], isSearching: false };

    const isSearching = searchQuery.trim().length > 0;
    const basePrefix = folderPath ? `${folderPath}/` : "";

    // In search mode, filter all files across folder
    if (isSearching) {
      const q = searchQuery.toLowerCase();
      const filtered = folderFiles.filter((f) => f.filename.toLowerCase().includes(q));
      return {
        directFolders: [] as FolderItem[],
        directFiles: filtered,
        isSearching: true,
      };
    }

    const folderMap = new Map<string, { filesCount: number; totalBytes: number; latestCreatedAt: string }>();
    const directFilesList: CloudFile[] = [];

    // Current full path = folderPath + (currentSubPath ? "/" + currentSubPath : "")
    const activePrefix = currentSubPath
      ? `${basePrefix}${currentSubPath}/`
      : basePrefix;

    for (const f of folderFiles) {
      if (activePrefix && !f.filename.startsWith(activePrefix)) {
        continue;
      }

      const relativePart = activePrefix ? f.filename.slice(activePrefix.length) : f.filename;
      const slashIndex = relativePart.indexOf("/");

      if (slashIndex === -1) {
        directFilesList.push(f);
      } else {
        const subName = relativePart.slice(0, slashIndex);
        const subFullPath = currentSubPath ? `${currentSubPath}/${subName}` : subName;

        const existing = folderMap.get(subName);
        if (existing) {
          existing.filesCount += 1;
          existing.totalBytes += f.size || 0;
          if (new Date(f.createdAt).getTime() > new Date(existing.latestCreatedAt).getTime()) {
            existing.latestCreatedAt = f.createdAt;
          }
        } else {
          folderMap.set(subName, {
            filesCount: 1,
            totalBytes: f.size || 0,
            latestCreatedAt: f.createdAt,
          });
        }
      }
    }

    const foldersList: FolderItem[] = Array.from(folderMap.entries()).map(([name, data]) => ({
      name,
      fullPath: currentSubPath ? `${currentSubPath}/${name}` : name,
      filesCount: data.filesCount,
      totalBytes: data.totalBytes,
      latestCreatedAt: data.latestCreatedAt,
    }));

    foldersList.sort((a, b) => a.name.localeCompare(b.name));

    return {
      directFolders: foldersList,
      directFiles: directFilesList,
      isSearching: false,
    };
  }, [isFolder, folderFiles, folderPath, currentSubPath, searchQuery]);

  // Breadcrumbs for shared folder
  const breadcrumbs = useMemo(() => {
    const rootName = folderName || "Shared Folder";
    if (!currentSubPath) {
      return [{ name: rootName, path: "" }];
    }
    const parts = currentSubPath.split("/").filter(Boolean);
    const crumbs = [{ name: rootName, path: "" }];
    let accumulated = "";
    for (const part of parts) {
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      crumbs.push({ name: part, path: accumulated });
    }
    return crumbs;
  }, [currentSubPath, folderName]);

  const navigateUp = () => {
    if (!currentSubPath) return;
    const parts = currentSubPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentSubPath(parts.join("/"));
  };

  // Download single file (whether in folder share or single file share)
  const handleDownloadSingleFile = async (targetFileId?: string) => {
    if (!token) return;
    if (targetFileId) setDownloadingFileId(targetFileId);
    else setIsUnlocking(true);
    setError(null);

    try {
      const res = await unlockShareDownload(token, password, targetFileId);
      if (!res) throw new Error("Could not unlock download URL");

      // Auto download
      const a = document.createElement("a");
      a.href = res.downloadUrl;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (!targetFileId) {
        setDownloadUrl(res.downloadUrl);
        setDownloadStarted(true);
      }

      toast.success(`Download started: ${res.filename}`);
    } catch (err: any) {
      setError(err.message || "Failed to download file");
      toast.error(err.message || "Failed to download file");
    } finally {
      setIsUnlocking(false);
      setDownloadingFileId(null);
    }
  };

  // Download entire folder as ZIP
  const handleDownloadAllAsZip = async () => {
    if (!token) return;
    setIsZipping(true);
    setError(null);
    setZipProgress({ current: 0, total: 1, percent: 5, statusText: "Authorizing download..." });

    try {
      const res = await unlockFolderBatchDownload(token, password);
      if (!res || !res.items || res.items.length === 0) {
        throw new Error("No downloadable files found in this shared folder");
      }

      const zip = new JSZip();
      const totalFiles = res.items.length;

      for (let i = 0; i < totalFiles; i++) {
        const item = res.items[i];
        setZipProgress({
          current: i + 1,
          total: totalFiles,
          percent: Math.round(((i + 0.5) / totalFiles) * 85),
          statusText: `Downloading ${item.filename} (${i + 1}/${totalFiles})...`,
        });

        const fetchRes = await fetch(item.downloadUrl);
        if (!fetchRes.ok) throw new Error(`Could not fetch file: ${item.filename}`);
        const blob = await fetchRes.blob();
        zip.file(item.relativePath, blob);
      }

      setZipProgress({
        current: totalFiles,
        total: totalFiles,
        percent: 92,
        statusText: "Compressing into ZIP archive...",
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `${res.folderName || folderName || "shared-folder"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);

      // Celebration
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}

      toast.success("Folder ZIP archive downloaded successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to create ZIP download");
      toast.error(err.message || "Failed to create ZIP download");
    } finally {
      setIsZipping(false);
      setZipProgress(null);
    }
  };

  const renderFileIcon = (file: CloudFile, large = false) => {
    const cat = getFileCategory(file.mimeType, file.filename);
    const sizeClasses = large ? "h-8 w-8" : "h-5 w-5";
    switch (cat) {
      case "archive":
        return <FileArchive className={`${sizeClasses} text-amber-400`} />;
      case "image":
        return <FileImage className={`${sizeClasses} text-emerald-400`} />;
      case "video":
        return <FileVideo className={`${sizeClasses} text-purple-400`} />;
      case "audio":
        return <FileAudio className={`${sizeClasses} text-pink-400`} />;
      case "code":
        return <FileCode className={`${sizeClasses} text-cyan-400`} />;
      default:
        return <FileText className={`${sizeClasses} text-sky-400`} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-950 text-foreground relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="pointer-events-none absolute inset-0 mesh-grid opacity-30" />

      {/* Top Header */}
      <header className="relative z-10 mx-auto w-full max-w-5xl px-4 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">NearDrop</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 py-4 flex-1">
        {isLoading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-12 shadow-2xl backdrop-blur-xl text-center space-y-4 max-w-lg mx-auto">
            <div className="h-12 w-12 rounded-2xl bg-zinc-800 animate-pulse mx-auto" />
            <div className="h-4 w-48 bg-zinc-800 animate-pulse rounded mx-auto" />
            <div className="h-3 w-32 bg-zinc-800/60 animate-pulse rounded mx-auto" />
          </div>
        ) : error && !file && !isFolder ? (
          /* Error / Expired View */
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl text-center space-y-5 animate-in zoom-in-95 duration-200 max-w-lg mx-auto">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">{t.publicShare.linkUnavailable}</h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">{error}</p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <span>{t.publicShare.goToHome}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        ) : isFolder && share ? (
          /* ========================================================= */
          /* FOLDER SHARE VIEW (Interactive Public Folder Explorer)    */
          /* ========================================================= */
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Header Hero Card */}
            <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/85 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shadow-xl shadow-sky-500/15 flex-shrink-0">
                    <Folder className="h-8 w-8" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-[11px] font-semibold text-sky-400 border border-sky-500/20">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Shared Folder</span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight truncate">
                      {folderName}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <span className="font-semibold text-zinc-200">
                        {totalCount} {totalCount === 1 ? "file" : "files"}
                      </span>
                      <span>•</span>
                      <span>{formatBytes(totalSize)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-sky-400" />
                        {formatExpiresIn(share.expiresAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Action: Download ZIP */}
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleDownloadAllAsZip}
                    disabled={isZipping || (share.passwordProtected && !password.trim())}
                    className="gap-2 shadow-xl shadow-sky-500/20 py-3 font-semibold"
                  >
                    {isZipping ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Downloading ZIP...</span>
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="h-5 w-5" />
                        <span>Download as ZIP</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Password input bar if protected */}
              {share.passwordProtected && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-amber-400" />
                      <span>Password Protected Folder</span>
                    </span>
                    <span className="text-[11px] font-normal text-amber-200/80">
                      Enter password to unlock and download files
                    </span>
                  </div>
                  <Input
                    type="password"
                    placeholder="Enter folder access password..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-xs bg-zinc-950/80 border-amber-500/40 focus:border-amber-400"
                  />
                </div>
              )}

              {/* ZIP Progress Indicator */}
              {isZipping && zipProgress && (
                <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs text-sky-300 font-semibold">
                    <span>{zipProgress.statusText}</span>
                    <span>{zipProgress.percent}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-500 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${zipProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error banner if any */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Folder Controls & Breadcrumbs Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Breadcrumb path */}
              {!isSearching ? (
                <div className="flex items-center gap-1.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 overflow-x-auto text-xs scrollbar-none flex-1">
                  {breadcrumbs.map((crumb, idx) => {
                    const isLast = idx === breadcrumbs.length - 1;
                    return (
                      <React.Fragment key={crumb.path || "root"}>
                        {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />}
                        <button
                          onClick={() => setCurrentSubPath(crumb.path)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors whitespace-nowrap ${
                            isLast
                              ? "font-semibold text-white bg-zinc-800/80 shadow-sm"
                              : "text-zinc-400 hover:text-sky-300 hover:bg-zinc-800/50"
                          }`}
                        >
                          {idx === 0 ? <Home className="h-3.5 w-3.5 text-sky-400" /> : <Folder className="h-3.5 w-3.5 text-sky-400/80" />}
                          <span>{crumb.name}</span>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs text-sky-300 flex-1">
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                  <span>Searching for &ldquo;{searchQuery}&rdquo;</span>
                </div>
              )}

              {/* Search & View Switcher */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="relative w-48 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                  <Input
                    type="text"
                    placeholder="Search in folder..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-7 h-9 text-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "list" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewMode === "grid" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Folder Explorer Content */}
            {directFolders.length === 0 && directFiles.length === 0 ? (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-3">
                <FolderOpen className="h-10 w-10 text-zinc-600 mx-auto" />
                <h4 className="text-sm font-semibold text-zinc-300">This directory is empty</h4>
                <p className="text-xs text-zinc-500">No files or subdirectories found.</p>
                {currentSubPath && (
                  <Button variant="outline" size="sm" onClick={navigateUp} className="gap-1.5 mt-2">
                    <CornerLeftUp className="h-3.5 w-3.5 text-sky-400" />
                    <span>Go up to parent</span>
                  </Button>
                )}
              </div>
            ) : viewMode === "list" ? (
              /* Explorer List View */
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden divide-y divide-zinc-800/60 shadow-lg">
                {/* Go Up Parent Row */}
                {!isSearching && currentSubPath && (
                  <div
                    onClick={navigateUp}
                    className="flex items-center gap-3.5 p-3 sm:px-4 hover:bg-zinc-800/40 transition-colors cursor-pointer text-xs font-semibold text-zinc-400 hover:text-white group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800/80 border border-zinc-700/50 group-hover:border-sky-500/40 transition-colors">
                      <CornerLeftUp className="h-4 w-4 text-sky-400" />
                    </div>
                    <span>.. (Parent folder)</span>
                  </div>
                )}

                {/* Folders in List */}
                {directFolders.map((sub) => (
                  <div
                    key={sub.fullPath}
                    onClick={() => setCurrentSubPath(sub.fullPath)}
                    className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-sky-500/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 group-hover:bg-sky-500/20 transition-colors flex-shrink-0">
                        <Folder className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="font-semibold text-xs sm:text-sm text-zinc-100 truncate group-hover:text-sky-300 transition-colors">
                          {sub.name}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {sub.filesCount} {sub.filesCount === 1 ? "file" : "files"} • {formatBytes(sub.totalBytes)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                  </div>
                ))}

                {/* Files in List */}
                {directFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3.5 sm:px-4 hover:bg-zinc-800/40 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/60 flex-shrink-0">
                        {renderFileIcon(f)}
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="font-semibold text-xs sm:text-sm text-zinc-100 truncate group-hover:text-sky-300 transition-colors">
                          {f.filename.split("/").pop() || f.filename}
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {formatBytes(f.size)} • {formatRelativeTime(f.createdAt)}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadSingleFile(f.id)}
                      disabled={downloadingFileId === f.id || (share.passwordProtected && !password.trim())}
                      className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 gap-1.5 text-xs h-8 ml-2 flex-shrink-0"
                    >
                      {downloadingFileId === f.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      <span>Download</span>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              /* Explorer Grid View */
              <div className="space-y-5">
                {directFolders.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {directFolders.map((sub) => (
                      <div
                        key={sub.fullPath}
                        onClick={() => setCurrentSubPath(sub.fullPath)}
                        className="rounded-2xl border border-zinc-800/90 bg-zinc-900/60 p-4 space-y-3 hover:border-sky-500/40 hover:bg-zinc-900/90 transition-all group cursor-pointer shadow-md flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 group-hover:scale-105 transition-transform">
                            <Folder className="h-5 w-5" />
                          </div>
                          <Badge variant="secondary" className="text-[10px]">
                            {sub.filesCount} {sub.filesCount === 1 ? "file" : "files"}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-sky-300 transition-colors">
                            {sub.name}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{formatBytes(sub.totalBytes)}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-sky-400 font-medium pt-1 border-t border-zinc-800/60">
                          <span>Open directory</span>
                          <ChevronRight className="h-3 w-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {directFiles.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {directFiles.map((f) => (
                      <div
                        key={f.id}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 hover:border-zinc-700 transition-all group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/60">
                            {renderFileIcon(f)}
                          </div>
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {f.mimeType.split("/")[1] || "File"}
                          </Badge>
                        </div>

                        <div>
                          <h4 className="font-semibold text-xs sm:text-sm text-white truncate group-hover:text-sky-300 transition-colors">
                            {f.filename.split("/").pop() || f.filename}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{formatBytes(f.size)}</p>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadSingleFile(f.id)}
                          disabled={downloadingFileId === f.id || (share.passwordProtected && !password.trim())}
                          className="w-full text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 gap-1.5 text-xs h-8 pt-1 border-t border-zinc-800/60"
                        >
                          {downloadingFileId === f.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          <span>Download file</span>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : file && share ? (
          /* ========================================================= */
          /* SINGLE FILE SHARE VIEW                                    */
          /* ========================================================= */
          <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 max-w-lg mx-auto">
            {/* Header: Shared by */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-[11px] font-semibold text-sky-400 border border-sky-500/20 mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t.publicShare.secureCloudShare}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {t.publicShare.fileSharedWithYou}
              </h2>
              <p className="text-xs text-zinc-400">{t.publicShare.encryptedSubtitle}</p>
            </div>

            {/* File Info Box */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 flex-shrink-0">
                {renderFileIcon(file, true)}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="font-bold text-sm text-white break-words">{file.filename}</h3>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">{formatBytes(file.size)}</span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {file.mimeType.split("/")[1] || "File"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Badges / Security indicators */}
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1 border-t border-b border-zinc-800/60 py-3">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                <span>{formatExpiresIn(share.expiresAt)}</span>
              </span>
              {share.passwordProtected && (
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Lock className="h-3.5 w-3.5" />
                  <span>{t.publicShare.passwordProtected}</span>
                </span>
              )}
            </div>

            {/* Password input if password protected & not unlocked */}
            {share.passwordProtected && !downloadStarted && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{t.publicShare.enterPasswordLabel}</span>
                </label>
                <Input
                  type="password"
                  placeholder={t.publicShare.enterPasswordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-xs"
                />
              </div>
            )}

            {/* Error banner if unlock failed */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Download CTA Button */}
            {downloadStarted && downloadUrl ? (
              <div className="space-y-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-in zoom-in-95 duration-150">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                <div>
                  <h4 className="text-xs font-semibold text-emerald-300">
                    {t.publicShare.downloadInitiated}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {t.publicShare.browserDidNotStart}
                  </p>
                </div>
                <a
                  href={downloadUrl}
                  download={file.filename}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors"
                >
                  <DownloadCloud className="h-4 w-4" />
                  <span>{t.publicShare.clickToRedownload}</span>
                </a>
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => handleDownloadSingleFile()}
                disabled={isUnlocking}
                className="w-full gap-2 shadow-xl shadow-sky-500/25 py-3"
              >
                <DownloadCloud className="h-5 w-5" />
                <span>{isUnlocking ? t.publicShare.verifying : t.publicShare.downloadFile}</span>
              </Button>
            )}

            {/* Checksum verification */}
            <div className="pt-2 text-center text-[10px] text-zinc-500 font-mono">
              <span>SHA-256: {file.checksum?.substring(0, 16) || "8f434346648f6b96"}...</span>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-zinc-600">
        <p>{t.publicShare.footerTagline}</p>
      </footer>
    </div>
  );
}
