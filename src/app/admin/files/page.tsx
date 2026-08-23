"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CloudFile } from "@/types";
import { formatBytes, formatRelativeTime, getFileCategory } from "@/lib/utils";
import {
  FolderOpen,
  Search,
  Download,
  Trash2,
  ExternalLink,
  FileText,
  FileArchive,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  RefreshCw,
  Copy,
  Check,
  HardDrive,
  User,
  Share2,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminFilesPage() {
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFileForDelete, setSelectedFileForDelete] = useState<CloudFile | null>(null);
  const [downloadLinkModal, setDownloadLinkModal] = useState<{ url: string; filename: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/files");
      const data = await res.json();
      if (data.success && data.files) {
        setFiles(data.files);
      } else {
        toast.error(data.error || "Could not load files");
      }
    } catch (err) {
      console.error("Failed to load files:", err);
      toast.error("Failed to fetch files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const renderFileIcon = (file: CloudFile) => {
    const cat = getFileCategory(file.mimeType, file.filename);
    switch (cat) {
      case "archive":
        return <FileArchive className="h-4 w-4 text-amber-400" />;
      case "image":
        return <FileImage className="h-4 w-4 text-emerald-400" />;
      case "video":
        return <FileVideo className="h-4 w-4 text-purple-400" />;
      case "audio":
        return <FileAudio className="h-4 w-4 text-pink-400" />;
      case "code":
        return <FileCode className="h-4 w-4 text-cyan-400" />;
      default:
        return <FileText className="h-4 w-4 text-sky-400" />;
    }
  };

  const handleGenerateDownload = async (file: CloudFile) => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ r2ObjectKey: file.r2ObjectKey, filename: file.filename }),
      });
      const data = await res.json();
      if (data.success && data.downloadUrl) {
        setDownloadLinkModal({ url: data.downloadUrl, filename: file.filename });
      } else {
        toast.error(data.error || "Failed to generate link");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate download link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFileForDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/files?fileId=${selectedFileForDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`File ${selectedFileForDelete.filename} purged from R2`);
        setFiles((prev) => prev.filter((f) => f.id !== selectedFileForDelete.id));
        setSelectedFileForDelete(null);
      } else {
        toast.error(data.error || "Failed to delete file");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete file");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = () => {
    if (!downloadLinkModal) return;
    navigator.clipboard.writeText(downloadLinkModal.url);
    setCopied(true);
    toast.success("Download URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles = files.filter((f) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      f.filename.toLowerCase().includes(q) ||
      (f.userEmail && f.userEmail.toLowerCase().includes(q)) ||
      f.r2ObjectKey.toLowerCase().includes(q);
    const cat = getFileCategory(f.mimeType, f.filename);
    const matchCategory = selectedCategory === "all" || cat === selectedCategory;
    return matchQuery && matchCategory;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>All Stored Files</span>
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-400 border border-purple-500/20">
                {files.length} R2 Objects
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Global catalog of objects across all user accounts in Cloudflare R2 bucket.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchFiles}
            disabled={loading}
            className="gap-2 text-xs self-start sm:self-auto rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-purple-400" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by filename, owner email, or R2 key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs bg-zinc-900/60 border-zinc-800 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["all", "image", "video", "document", "archive", "code"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Files Table */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Filename</th>
                  <th className="py-3.5 px-4">Owner Profile</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">MIME Type</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4">Shares / Downloads</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-400 mb-2" />
                      Loading global files...
                    </td>
                  </tr>
                ) : filteredFiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No files stored yet.
                    </td>
                  </tr>
                ) : (
                  filteredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-zinc-800/40 transition-colors group">
                      {/* Filename & R2 Key */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/60 flex-shrink-0">
                            {renderFileIcon(file)}
                          </div>
                          <div className="min-w-0 max-w-[200px] sm:max-w-[260px]">
                            <p className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                              {file.filename}
                            </p>
                            <p className="font-mono text-[10px] text-zinc-500 truncate">
                              {file.r2ObjectKey}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Owner with link to user profile */}
                      <td className="py-4 px-4">
                        <Link
                          href={`/admin/users/${file.userId}`}
                          className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-purple-300 transition-colors group/user"
                          title="Inspect user profile"
                        >
                          <User className="h-3.5 w-3.5 text-zinc-500 group-hover/user:text-purple-400" />
                          <span className="truncate max-w-[140px] text-xs font-semibold">
                            {file.userEmail || "User Profile"}
                          </span>
                        </Link>
                      </td>

                      {/* Size */}
                      <td className="py-4 px-4 text-zinc-200 font-semibold whitespace-nowrap">
                        {formatBytes(file.size)}
                      </td>

                      {/* MIME */}
                      <td className="py-4 px-4">
                        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                          {file.mimeType}
                        </span>
                      </td>

                      {/* Uploaded */}
                      <td className="py-4 px-4 text-[11px] text-zinc-400 whitespace-nowrap">
                        {formatRelativeTime(file.createdAt)}
                      </td>

                      {/* Shares / Downloads */}
                      <td className="py-4 px-4 text-zinc-300">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-emerald-400 font-medium">
                            {file.activeSharesCount || 0} active
                          </span>
                          <span>•</span>
                          <span>{file.downloadsCount || 0} hits</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGenerateDownload(file)}
                            title="Generate Direct Admin Download Link"
                            className="h-8 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 text-xs gap-1 rounded-lg"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Download</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFileForDelete(file)}
                            title="Delete File from R2"
                            className="h-8 w-8 p-0 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Download Presigned URL Modal */}
      <Dialog
        open={Boolean(downloadLinkModal)}
        onOpenChange={(open) => !open && setDownloadLinkModal(null)}
      >
        <DialogContent className="max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Download className="h-4 w-4 text-sky-400" />
              <span>Admin Presigned Download Link</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <p className="text-xs text-zinc-400">
              Generated direct R2 signed URL for <strong className="text-white">{downloadLinkModal?.filename}</strong> (Valid for 60 minutes).
            </p>

            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={downloadLinkModal?.url || ""}
                className="bg-zinc-900 font-mono text-[11px] text-zinc-300 rounded-xl"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-1.5 h-10 flex-shrink-0 rounded-xl"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setDownloadLinkModal(null)}>
              Close
            </Button>
            <a
              href={downloadLinkModal?.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open & Download</span>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(selectedFileForDelete)}
        onOpenChange={(open) => !open && setSelectedFileForDelete(null)}
      >
        <DialogContent className="max-w-md rounded-3xl border border-rose-500/30 bg-zinc-950 p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Confirm Delete Object</span>
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-zinc-300">
            Are you sure you want to permanently delete <strong className="text-white">{selectedFileForDelete?.filename}</strong>? This will purge the object from Cloudflare R2 bucket and invalidate all associated share links.
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setSelectedFileForDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteFile}
              disabled={isDeleting}
              className="text-xs rounded-xl"
            >
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
