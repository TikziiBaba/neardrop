"use client";

import React, { useState, useMemo, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShareModal } from "@/components/sharing/ShareModal";
import { FilePreviewModal } from "@/components/files/FilePreviewModal";
import { RenameModal } from "@/components/files/RenameModal";
import { DeleteConfirmModal } from "@/components/files/DeleteConfirmModal";
import { useStorage } from "@/lib/storage/store";
import { useLanguage } from "@/lib/i18n/context";
import { CloudFile } from "@/types";
import { formatBytes, formatRelativeTime, formatDate, getFileCategory } from "@/lib/utils";
import { extractFilesFromDataTransfer } from "@/lib/utils/folder-upload";
import {
  FolderOpen,
  FolderUp,
  Search,
  LayoutGrid,
  List,
  UploadCloud,
  Share2,
  Download,
  Trash2,
  Edit2,
  Eye,
  FileText,
  FileArchive,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  Folder,
  Home,
  ChevronRight,
  CornerLeftUp,
  X,
  Sparkles,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { BatchActionBar } from "@/components/files/BatchActionBar";
import { SoundManager } from "@/lib/utils/sound-effects";
import JSZip from "jszip";
import { toast } from "sonner";

interface FolderItem {
  name: string;
  fullPath: string;
  filesCount: number;
  totalBytes: number;
  latestCreatedAt: string;
}

export default function FilesPage() {
  const { files, uploadFiles, downloadFile, deleteFile, downloadFolder, previewFile } = useStorage();
  const { t } = useLanguage();

  const [currentFolderPath, setCurrentFolderPath] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"date" | "size" | "name">("name");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Modals state
  const [selectedFileForShare, setSelectedFileForShare] = useState<CloudFile | null>(null);
  const [selectedFolderForShare, setSelectedFolderForShare] = useState<FolderItem | null>(null);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<CloudFile | null>(null);
  const [selectedFileForRename, setSelectedFileForRename] = useState<CloudFile | null>(null);
  const [selectedFileForDelete, setSelectedFileForDelete] = useState<CloudFile | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<FolderItem | null>(null);
  const [downloadingFolder, setDownloadingFolder] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const toggleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const selectedFilesList = useMemo(() => {
    return files.filter((f) => selectedFileIds.has(f.id));
  }, [files, selectedFileIds]);

  const selectedTotalBytes = useMemo(() => {
    return selectedFilesList.reduce((acc, f) => acc + (f.size || 0), 0);
  }, [selectedFilesList]);

  const handleBatchDownloadZip = async () => {
    if (selectedFilesList.length === 0) return;
    setIsBatchProcessing(true);
    const toastId = toast.loading(`Preparing ZIP archive for ${selectedFilesList.length} files...`);

    try {
      const zip = new JSZip();
      for (const file of selectedFilesList) {
        const preview = await previewFile(file.id);
        if (preview?.previewUrl) {
          const res = await fetch(preview.previewUrl);
          const blob = await res.blob();
          const cleanName = file.filename.split("/").pop() || file.filename;
          zip.file(cleanName, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NearDrop_Batch_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      SoundManager.play("chime");
      toast.success("ZIP archive downloaded successfully!", { id: toastId });
      setSelectedFileIds(new Set());
    } catch (err: any) {
      toast.error(err.message || "Failed to create ZIP", { id: toastId });
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFilesList.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedFilesList.length} selected files?`)) return;

    setIsBatchProcessing(true);
    try {
      for (const file of selectedFilesList) {
        await deleteFile(file.id);
      }
      toast.success(`${selectedFilesList.length} files deleted.`);
      setSelectedFileIds(new Set());
    } catch (err: any) {
      toast.error(err.message || "Failed to delete files");
    } finally {
      setIsBatchProcessing(false);
    }
  };

  const categories = [
    { id: "all", label: "All Files" },
    { id: "archive", label: "Archives" },
    { id: "document", label: "Documents" },
    { id: "image", label: "Images" },
    { id: "video", label: "Videos" },
    { id: "code", label: "Code" },
  ];

  // Filter files by category and global search
  const filteredFiles = useMemo(() => {
    return files
      .filter((file) => {
        const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat =
          selectedCategory === "all" || getFileCategory(file.mimeType, file.filename) === selectedCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === "date") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "size") {
          return b.size - a.size;
        }
        return a.filename.localeCompare(b.filename);
      });
  }, [files, searchQuery, selectedCategory, sortBy]);

  // Compute hierarchical folder items and direct files at the current folder level
  const { directFolders, directFiles, isSearching } = useMemo(() => {
    const isSearching = searchQuery.trim().length > 0;

    // In search mode, display flat list of all matches
    if (isSearching) {
      return {
        directFolders: [] as FolderItem[],
        directFiles: filteredFiles,
        isSearching: true,
      };
    }

    const folderMap = new Map<string, { filesCount: number; totalBytes: number; latestCreatedAt: string }>();
    const directFilesList: CloudFile[] = [];

    const prefix = currentFolderPath ? `${currentFolderPath}/` : "";

    for (const file of filteredFiles) {
      if (prefix && !file.filename.startsWith(prefix)) {
        continue;
      }

      const relativePart = prefix ? file.filename.slice(prefix.length) : file.filename;
      const slashIndex = relativePart.indexOf("/");

      if (slashIndex === -1) {
        // Direct file in current folder
        directFilesList.push(file);
      } else {
        // Direct subfolder in current folder
        const subfolderName = relativePart.slice(0, slashIndex);
        const existing = folderMap.get(subfolderName);

        if (existing) {
          existing.filesCount += 1;
          existing.totalBytes += file.size || 0;
          if (new Date(file.createdAt).getTime() > new Date(existing.latestCreatedAt).getTime()) {
            existing.latestCreatedAt = file.createdAt;
          }
        } else {
          folderMap.set(subfolderName, {
            filesCount: 1,
            totalBytes: file.size || 0,
            latestCreatedAt: file.createdAt,
          });
        }
      }
    }

    const foldersList: FolderItem[] = Array.from(folderMap.entries()).map(([name, data]) => ({
      name,
      fullPath: prefix ? `${prefix}${name}` : name,
      filesCount: data.filesCount,
      totalBytes: data.totalBytes,
      latestCreatedAt: data.latestCreatedAt,
    }));

    // Sort folders
    if (sortBy === "date") {
      foldersList.sort((a, b) => new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime());
    } else if (sortBy === "size") {
      foldersList.sort((a, b) => b.totalBytes - a.totalBytes);
    } else {
      foldersList.sort((a, b) => a.name.localeCompare(b.name));
    }

    return {
      directFolders: foldersList,
      directFiles: directFilesList,
      isSearching: false,
    };
  }, [filteredFiles, currentFolderPath, searchQuery, sortBy]);

  // Breadcrumbs array
  const breadcrumbs = useMemo(() => {
    if (!currentFolderPath) {
      return [{ name: t.filesPage.allFilesRoot, path: "" }];
    }
    const parts = currentFolderPath.split("/").filter(Boolean);
    const crumbs = [{ name: t.filesPage.allFilesRoot, path: "" }];
    let accumulated = "";
    for (const part of parts) {
      accumulated = accumulated ? `${accumulated}/${part}` : part;
      crumbs.push({ name: part, path: accumulated });
    }
    return crumbs;
  }, [currentFolderPath, t.filesPage.allFilesRoot]);

  const navigateUp = () => {
    if (!currentFolderPath) return;
    const parts = currentFolderPath.split("/").filter(Boolean);
    parts.pop();
    setCurrentFolderPath(parts.join("/"));
  };

  const renderFileIcon = (file: CloudFile, large = false) => {
    const cat = getFileCategory(file.mimeType, file.filename);
    const sizeClasses = large ? "h-9 w-9" : "h-5 w-5";

    switch (cat) {
      case "archive":
        return <FileArchive className={`${sizeClasses} text-warning`} />;
      case "image":
        return <FileImage className={`${sizeClasses} text-success`} />;
      case "video":
        return <FileVideo className={`${sizeClasses} text-file-video`} />;
      case "audio":
        return <FileAudio className={`${sizeClasses} text-file-audio`} />;
      case "code":
        return <FileCode className={`${sizeClasses} text-accent-text`} />;
      default:
        return <FileText className={`${sizeClasses} text-accent-text`} />;
    }
  };

  const handleDownloadFile = async (file: CloudFile) => {
    try {
      await downloadFile(file.id);
      toast.success("Download started!");
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    }
  };

  const handleDownloadFolder = async (folder: FolderItem) => {
    if (downloadingFolder) return;
    setDownloadingFolder(folder.fullPath);
    toast.info(`Creating ZIP for "${folder.name}"... This may take a moment.`);
    try {
      await downloadFolder(folder.fullPath);
      toast.success(`"${folder.name}.zip" download started!`);
    } catch (err: any) {
      toast.error(err.message || "Folder download failed");
    } finally {
      setDownloadingFolder(null);
    }
  };

  const handleDeleteFolderConfirm = async () => {
    if (!folderToDelete) return;
    const prefix = `${folderToDelete.fullPath}/`;
    const filesInFolder = files.filter(
      (f) => f.filename === folderToDelete.fullPath || f.filename.startsWith(prefix)
    );

    if (filesInFolder.length === 0) {
      setFolderToDelete(null);
      return;
    }

    toast.info(`Deleting ${filesInFolder.length} file(s) from "${folderToDelete.name}"...`);
    try {
      for (const f of filesInFolder) {
        await deleteFile(f.id);
      }
      toast.success(`Folder "${folderToDelete.name}" deleted successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete folder");
    } finally {
      setFolderToDelete(null);
    }
  };

  // Prepend current folder path if uploading directly inside a folder
  const processFilesForCurrentFolder = (inputFiles: File[]) => {
    if (!currentFolderPath) return inputFiles;
    return inputFiles.map((file) => {
      const existingRel = (file as any).relativePath || file.webkitRelativePath;
      if (existingRel) {
        const combined = `${currentFolderPath}/${existingRel}`;
        Object.defineProperty(file, "relativePath", { value: combined, writable: true });
      } else {
        const combined = `${currentFolderPath}/${file.name}`;
        Object.defineProperty(file, "relativePath", { value: combined, writable: true });
      }
      return file;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    try {
      const extractedFiles = await extractFilesFromDataTransfer(e.dataTransfer);
      if (extractedFiles.length > 0) {
        const prepared = processFilesForCurrentFolder(extractedFiles);
        await uploadFiles(prepared);
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Please check your storage settings.");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const prepared = processFilesForCurrentFolder(filesArray);
      try {
        await uploadFiles(prepared);
      } catch (err: any) {
        toast.error(err.message || "Upload failed. Please check your storage settings.");
      } finally {
        e.target.value = "";
      }
    }
  };

  // Helper to split folder path and base filename for search view
  const formatFilenameDisplay = (fullPath: string) => {
    const parts = fullPath.split("/");
    if (parts.length <= 1) {
      return { dir: null, name: fullPath };
    }
    const name = parts.pop() || fullPath;
    const dir = parts.join("/");
    return { dir, name };
  };

  const totalCurrentItems = directFolders.length + directFiles.length;

  return (
    <DashboardLayout>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative space-y-6 min-h-[80vh]"
      >
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-40 rounded-3xl border-2 border-dashed border-accent-text bg-accent/10 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-200">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/20 text-accent-text border border-accent/40 mb-4 shadow-xl shadow-accent/20">
              <UploadCloud className="h-10 w-10 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{t.filesPage.dropHere}</h3>
            <p className="text-xs text-accent-text mt-1 max-w-sm">
              {currentFolderPath
                ? `Uploading directly into "${currentFolderPath}"`
                : t.filesPage.dropDesc}
            </p>
          </div>
        )}

        {/* Hidden Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple
          className="hidden"
        />
        <input
          type="file"
          ref={folderInputRef}
          onChange={handleFileSelect}
          // @ts-ignore
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
        />

        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2.5">
              <span>{t.filesPage.title}</span>
              <Badge variant="secondary" className="text-xs">
                {files.length} {t.filesPage.files}
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t.filesPage.subtitle}</p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                SoundManager.play("click");
                folderInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-xs text-foreground hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 backdrop-blur-md shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer select-none"
            >
              <FolderUp className="h-4 w-4 text-accent-text" />
              <span>{t.filesPage.uploadFolder}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                SoundManager.play("click");
                fileInputRef.current?.click();
              }}
              className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-xs text-white bg-gradient-to-r from-accent via-accent-text to-accent hover:from-accent-text hover:to-accent shadow-lg shadow-accent/25 ring-1 ring-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer select-none"
            >
              <UploadCloud className="h-4 w-4 group-hover/btn:-translate-y-0.5 transition-transform" />
              <span>{t.filesPage.uploadFiles}</span>
            </button>
          </div>
        </div>

        {/* Search, Filter & View Mode Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-subtle" />
            <Input
              type="text"
              placeholder={t.filesPage.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 rounded-xl border border-border bg-surface/80 px-3 text-xs text-foreground/80 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
              <option value="size">Sort by Size</option>
            </select>

            {/* List / Grid Switcher */}
            <div className="flex items-center rounded-xl border border-border bg-surface/80 p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-2xl transition-colors ${
                  viewMode === "list" ? "bg-surface-secondary text-white" : "text-subtle hover:text-foreground/80"
                }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-2xl transition-colors ${
                  viewMode === "grid" ? "bg-surface-secondary text-white" : "text-subtle hover:text-foreground/80"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                selectedCategory === cat.id
                  ? "border-accent/30 bg-accent/15 text-accent-text font-semibold"
                  : "border-border/80 bg-surface/50 text-muted-foreground hover:border-border-strong hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* GitHub / Finder-Style Breadcrumb Navigation Bar */}
        {!isSearching && (
          <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-surface/60 px-4 py-2.5 backdrop-blur-md">
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none py-0.5">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.path || "root"}>
                    {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-subtle/80 flex-shrink-0" />}
                    <button
                      onClick={() => setCurrentFolderPath(crumb.path)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-2xl transition-colors whitespace-nowrap ${
                        isLast
                          ? "font-semibold text-white bg-surface-secondary/80 shadow-sm"
                          : "text-muted-foreground hover:text-accent-text hover:bg-surface-secondary/50"
                      }`}
                    >
                      {idx === 0 ? <Home className="h-3.5 w-3.5 text-accent-text" /> : <Folder className="h-3.5 w-3.5 text-accent-text/80" />}
                      <span>{crumb.name}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {currentFolderPath && (
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentFiles = files.filter(
                      (f) => f.filename === currentFolderPath || f.filename.startsWith(currentFolderPath + "/")
                    );
                    setSelectedFolderForShare({
                      name: currentFolderPath.split("/").pop() || currentFolderPath,
                      fullPath: currentFolderPath,
                      filesCount: currentFiles.length,
                      totalBytes: currentFiles.reduce((acc, f) => acc + (f.size || 0), 0),
                      latestCreatedAt: currentFiles[0]?.createdAt || new Date().toISOString(),
                    });
                  }}
                  className="text-xs text-accent-text hover:text-accent-text hover:bg-accent-hover/10 border-accent/30 h-7 px-2 gap-1"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Share Folder</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={navigateUp}
                  className="text-xs text-muted-foreground hover:text-white h-7 px-2 gap-1"
                >
                  <CornerLeftUp className="h-3.5 w-3.5 text-accent-text" />
                  <span className="hidden sm:inline">{t.filesPage.goUp}</span>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Search Mode Active Banner */}
        {isSearching && (
          <div className="flex items-center justify-between rounded-2xl border border-accent/20 bg-accent/10 px-4 py-2.5 text-xs text-accent-text">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-text" />
              <span>
                {t.filesPage.searchingInAllFolders}: <strong className="text-white">&ldquo;{searchQuery}&rdquo;</strong> ({filteredFiles.length} results)
              </span>
            </div>
            <button
              onClick={() => setSearchQuery("")}
              className="text-[11px] underline hover:text-white"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Empty State */}
        {totalCurrentItems === 0 ? (
          <div className="rounded-3xl border border-border bg-surface/30 p-12 text-center space-y-4">
            <FolderOpen className="h-12 w-12 text-subtle/80 mx-auto" />
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-sm font-semibold text-foreground/80">
                {currentFolderPath ? t.filesPage.emptyFolder : t.filesPage.noFilesFound}
              </h3>
              <p className="text-xs text-subtle">
                {isSearching
                  ? t.filesPage.noFilesMatchSearch
                  : t.filesPage.noFilesFoundDesc}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  SoundManager.play("click");
                  fileInputRef.current?.click();
                }}
                className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-xs text-white bg-gradient-to-r from-accent via-accent-text to-accent hover:from-accent-text hover:to-accent shadow-lg shadow-accent/25 ring-1 ring-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer select-none"
              >
                <UploadCloud className="h-4 w-4 group-hover/btn:-translate-y-0.5 transition-transform" />
                <span>{t.filesPage.uploadFiles}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  SoundManager.play("click");
                  folderInputRef.current?.click();
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-xs text-foreground hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 backdrop-blur-md shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer select-none"
              >
                <FolderUp className="h-4 w-4 text-accent-text" />
                <span>{t.filesPage.uploadFolder}</span>
              </button>
            </div>
          </div>
        ) : viewMode === "list" ? (
          /* ========================================================= */
          /* LIST VIEW (GitHub Style)                                  */
          /* ========================================================= */
          <div className="rounded-2xl border border-border bg-surface/60 overflow-hidden divide-y divide-border/60">
            {/* Go Up Parent Row if nested */}
            {!isSearching && currentFolderPath && (
              <div
                onClick={navigateUp}
                className="flex items-center gap-3.5 p-3 sm:px-4 hover:bg-surface-secondary/40 transition-colors cursor-pointer text-xs font-semibold text-muted-foreground hover:text-white group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-secondary/80 border border-border-strong/50 group-hover:border-accent/40 transition-colors">
                  <CornerLeftUp className="h-4 w-4 text-accent-text" />
                </div>
                <div className="flex items-center gap-2">
                  <span>..</span>
                  <span className="text-[11px] font-normal text-subtle group-hover:text-muted-foreground">({t.filesPage.goUp})</span>
                </div>
              </div>
            )}

            {/* 1. Folders in List */}
            {directFolders.map((folder) => (
              <div
                key={folder.fullPath}
                className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-accent-hover/5 transition-colors group cursor-pointer"
                onClick={() => setCurrentFolderPath(folder.fullPath)}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 border border-accent/25 text-accent-text shadow-sm group-hover:scale-105 group-hover:bg-accent-hover/20 transition-all flex-shrink-0">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="font-semibold text-xs sm:text-sm text-foreground truncate group-hover:text-accent-text transition-colors">
                      {folder.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                      <span>
                        {folder.filesCount} {folder.filesCount === 1 ? t.filesPage.item : t.filesPage.items}
                      </span>
                      <span>•</span>
                      <span>{formatBytes(folder.totalBytes)}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(folder.latestCreatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadFolder(folder);
                    }}
                    className={`p-1.5 rounded-2xl transition-colors ${
                      downloadingFolder === folder.fullPath
                        ? "text-accent-text animate-pulse"
                        : "text-muted-foreground hover:text-success hover:bg-success/10"
                    }`}
                    title="Download as ZIP"
                    disabled={downloadingFolder === folder.fullPath}
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFolderForShare(folder);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-accent-text rounded-2xl hover:bg-accent-hover/10 transition-colors"
                    title="Share Folder"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFolderToDelete(folder);
                    }}
                    className="p-1.5 text-subtle hover:text-danger rounded-2xl hover:bg-danger/10 transition-colors"
                    title="Delete Folder"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <ChevronRight className="h-4 w-4 text-subtle/80 group-hover:text-accent-text group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}

            {/* 2. Files in List */}
            {directFiles.map((file) => {
              const { dir, name } = formatFilenameDisplay(file.filename);
              const cat = getFileCategory(file.mimeType, file.filename);
              const isMedia = cat === "image" || cat === "video";
              const isSelected = selectedFileIds.has(file.id);
              return (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-3.5 sm:p-4 transition-colors group ${
                    isSelected ? "bg-accent/10 border-l-2 border-accent-text" : "hover:bg-surface-secondary/40"
                  }`}
                >
                  <div className="flex items-center gap-3 mr-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectFile(file.id)}
                      ariaLabel={`Select ${file.filename}`}
                    />
                  </div>

                  <div
                    className={`flex items-center gap-3.5 min-w-0 flex-1 ${isMedia ? "cursor-pointer" : "cursor-default"}`}
                    onClick={() => {
                      if (isMedia) {
                        setSelectedFileForPreview(file);
                      }
                    }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-secondary border border-border-strong/60 flex-shrink-0">
                      {renderFileIcon(file)}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        {isSearching && dir && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchQuery("");
                              setCurrentFolderPath(dir);
                            }}
                            className="flex items-center gap-1 text-[11px] font-mono text-accent-text bg-accent/10 hover:bg-accent-hover/20 px-1.5 py-0.5 rounded flex-shrink-0 transition-colors"
                          >
                            <Folder className="h-3 w-3" />
                            {dir}/
                          </span>
                        )}
                        <p className={`font-semibold text-xs sm:text-sm text-foreground truncate transition-colors ${isMedia ? "group-hover:text-accent-text" : ""}`}>
                          {isSearching ? name : file.filename.split("/").pop() || file.filename}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(file.createdAt)}</span>
                        {(file.activeSharesCount || 0) > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-success font-medium">{file.activeSharesCount} share</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFileForShare(file)}
                      className="text-accent-text hover:text-accent-text hover:bg-accent-hover/10 gap-1.5 text-xs h-8"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Share</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadFile(file)}
                      className="text-muted-foreground hover:text-white h-8 w-8 p-0"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFileForRename(file)}
                      className="text-muted-foreground hover:text-white h-8 w-8 p-0"
                      title="Rename"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFileForDelete(file)}
                      className="text-muted-foreground hover:text-danger hover:bg-danger/10 h-8 w-8 p-0"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ========================================================= */
          /* GRID VIEW (Finder Style Cards)                            */
          /* ========================================================= */
          <div className="space-y-6">
            {/* 1. Folders Grid Section */}
            {directFolders.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  {t.filesPage.folders} ({directFolders.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {directFolders.map((folder) => (
                    <div
                      key={folder.fullPath}
                      onClick={() => setCurrentFolderPath(folder.fullPath)}
                      className="rounded-2xl border border-border/90 bg-surface/60 p-4 space-y-3 hover:border-accent/40 hover:bg-surface/90 transition-all group cursor-pointer shadow-md flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 border border-accent/25 text-accent-text group-hover:scale-105 transition-transform">
                          <Folder className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="text-[10px]">
                          {folder.filesCount} {folder.filesCount === 1 ? t.filesPage.item : t.filesPage.items}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm text-white truncate group-hover:text-accent-text transition-colors">
                          {folder.name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {formatBytes(folder.totalBytes)} • {formatRelativeTime(folder.latestCreatedAt)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs text-accent-text font-medium">
                        <span className="flex items-center gap-1 group-hover:underline">
                          Open folder <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFolder(folder);
                            }}
                            className={`p-1 rounded transition-colors ${
                              downloadingFolder === folder.fullPath
                                ? "text-accent-text animate-pulse"
                                : "text-muted-foreground hover:text-success"
                            }`}
                            title="Download as ZIP"
                            disabled={downloadingFolder === folder.fullPath}
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFolderForShare(folder);
                            }}
                            className="p-1 text-muted-foreground hover:text-accent-text rounded transition-colors"
                            title="Share Folder"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setFolderToDelete(folder);
                            }}
                            className="p-1 text-subtle hover:text-danger rounded transition-colors"
                            title="Delete Folder"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Files Grid Section */}
            {directFiles.length > 0 && (
              <div className="space-y-3">
                {directFolders.length > 0 && (
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                    {t.filesPage.files} ({directFiles.length})
                  </h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {directFiles.map((file) => {
                    const { dir, name } = formatFilenameDisplay(file.filename);
                    const cat = getFileCategory(file.mimeType, file.filename);
                    const isMedia = cat === "image" || cat === "video";
                    return (
                      <div
                        key={file.id}
                        className="rounded-2xl border border-border bg-surface/60 p-4 space-y-3 hover:border-border-strong transition-all group flex flex-col justify-between"
                      >
                        <div
                          className={`space-y-3 ${isMedia ? "cursor-pointer" : "cursor-default"}`}
                          onClick={() => {
                            if (isMedia) {
                              setSelectedFileForPreview(file);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <Checkbox
                                checked={selectedFileIds.has(file.id)}
                                onCheckedChange={() => toggleSelectFile(file.id)}
                                size="sm"
                                ariaLabel={`Select ${file.filename}`}
                              />
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-secondary border border-border-strong/60">
                                {renderFileIcon(file, true)}
                              </div>
                            </div>
                            {(file.activeSharesCount || 0) > 0 && (
                              <Badge variant="success" className="text-[10px]">
                                Shared
                              </Badge>
                            )}
                          </div>
                          <div>
                            {isSearching && dir && (
                              <div className="flex items-center gap-1 text-[10px] font-mono text-accent-text truncate mb-1">
                                <Folder className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{dir}</span>
                              </div>
                            )}
                            <h4 className={`font-semibold text-xs text-white truncate transition-colors ${isMedia ? "group-hover:text-accent-text" : ""}`}>
                              {isSearching ? name : file.filename.split("/").pop() || file.filename}
                            </h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {formatBytes(file.size)} • {formatRelativeTime(file.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/60">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFileForShare(file)}
                            className="text-accent-text hover:text-accent-text text-xs h-8 px-2 gap-1"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Share</span>
                          </Button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="p-1.5 text-muted-foreground hover:text-white rounded-2xl hover:bg-surface-secondary transition-colors"
                              title="Download"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setSelectedFileForDelete(file)}
                              className="p-1.5 text-muted-foreground hover:text-danger rounded-2xl hover:bg-danger/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Folder Confirm Modal */}
      {folderToDelete && (
        <Dialog
          open={Boolean(folderToDelete)}
          onOpenChange={(open) => !open && setFolderToDelete(null)}
          title="Delete Folder"
          description={`Are you sure you want to delete folder "${folderToDelete.name}" and all ${folderToDelete.filesCount} files inside it? This action cannot be undone.`}
        >
          <div className="space-y-4 pt-2">
            <div className="rounded-xl border border-danger/20 bg-danger/10 p-3 text-xs text-danger flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-danger flex-shrink-0" />
              <span>All files inside this folder path will be permanently deleted from secure cloud storage and database.</span>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFolderToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteFolderConfirm}>
                Delete Entire Folder
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Modals */}
      <ShareModal
        file={selectedFileForShare}
        folder={selectedFolderForShare}
        open={Boolean(selectedFileForShare || selectedFolderForShare)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedFileForShare(null);
            setSelectedFolderForShare(null);
          }
        }}
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

      {/* Floating Batch Action Toolbar */}
      <BatchActionBar
        selectedCount={selectedFilesList.length}
        totalBytes={selectedTotalBytes}
        onDownloadZip={handleBatchDownloadZip}
        onDelete={handleBatchDelete}
        onShare={() => {
          if (selectedFilesList.length > 0) {
            setSelectedFileForShare(selectedFilesList[0]);
          }
        }}
        onClearSelection={() => setSelectedFileIds(new Set())}
        isProcessing={isBatchProcessing}
      />
    </DashboardLayout>
  );
}
