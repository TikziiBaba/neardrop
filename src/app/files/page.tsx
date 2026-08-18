"use client";

import React, { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ShareModal } from "@/components/sharing/ShareModal";
import { FileDetailsDrawer } from "@/components/files/FileDetailsDrawer";
import { RenameModal } from "@/components/files/RenameModal";
import { DeleteConfirmModal } from "@/components/files/DeleteConfirmModal";
import { useStorage } from "@/lib/storage/store";
import { CloudFile } from "@/types";
import { formatBytes, formatRelativeTime, getFileCategory } from "@/lib/utils";
import {
  FolderOpen,
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
  MoreVertical,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function FilesPage() {
  const { files, uploadFiles } = useStorage();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"date" | "size" | "name">("date");

  // Modals state
  const [selectedFileForShare, setSelectedFileForShare] = useState<CloudFile | null>(null);
  const [selectedFileForDetails, setSelectedFileForDetails] = useState<CloudFile | null>(null);
  const [selectedFileForRename, setSelectedFileForRename] = useState<CloudFile | null>(null);
  const [selectedFileForDelete, setSelectedFileForDelete] = useState<CloudFile | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const categories = [
    { id: "all", label: "All Files" },
    { id: "archive", label: "Archives" },
    { id: "document", label: "Documents" },
    { id: "image", label: "Images" },
    { id: "video", label: "Videos" },
    { id: "code", label: "Code" },
  ];

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

  const renderFileIcon = (file: CloudFile, large = false) => {
    const cat = getFileCategory(file.mimeType, file.filename);
    const sizeClasses = large ? "h-10 w-10" : "h-5 w-5";

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

  const handleDownloadFile = (file: CloudFile) => {
    const blob = new Blob([`NearDrop Download - ${file.filename}`], { type: file.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          multiple
          className="hidden"
        />

        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>My Files</span>
              <Badge variant="secondary" className="text-xs">
                {filteredFiles.length} file{filteredFiles.length === 1 ? "" : "s"}
              </Badge>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Browse, search, rename, download, and create share links for all stored files.
            </p>
          </div>

          <Button
            variant="primary"
            size="default"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 self-start sm:self-auto shadow-lg shadow-sky-500/20"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Files</span>
          </Button>
        </div>

        {/* Search, Filter & View Mode Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search files by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-xs"
            />
          </div>

          {/* Controls Right */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="date">Sort by Date</option>
              <option value="size">Sort by Size</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* List / Grid Switcher */}
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

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                selectedCategory === cat.id
                  ? "border-sky-500/30 bg-sky-500/15 text-sky-400 font-semibold"
                  : "border-zinc-800/80 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Files Content */}
        {filteredFiles.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/30 p-12 text-center space-y-3">
            <FolderOpen className="h-10 w-10 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-zinc-300">No files found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery ? "No files match your search query." : "Upload your first file to get started."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2"
            >
              Upload File
            </Button>
          </div>
        ) : viewMode === "list" ? (
          /* List View */
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden divide-y divide-zinc-800/60">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-zinc-800/40 transition-colors group"
              >
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
                      {(file.activeSharesCount || 0) > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">{file.activeSharesCount} share</span>
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
                    className="text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 gap-1.5 text-xs h-8"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadFile(file)}
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
            ))}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 hover:border-zinc-700 transition-all group flex flex-col justify-between"
              >
                <div
                  className="space-y-3 cursor-pointer"
                  onClick={() => setSelectedFileForDetails(file)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700/60">
                      {renderFileIcon(file, true)}
                    </div>
                    {(file.activeSharesCount || 0) > 0 && (
                      <Badge variant="success" className="text-[10px]">
                        Shared
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-white truncate group-hover:text-sky-300 transition-colors">
                      {file.filename}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {formatBytes(file.size)} • {formatRelativeTime(file.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFileForShare(file)}
                    className="text-sky-400 hover:text-sky-300 text-xs h-8 px-2 gap-1"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share</span>
                  </Button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDownloadFile(file)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setSelectedFileForDelete(file)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
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
