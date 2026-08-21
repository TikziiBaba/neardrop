"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FolderUp, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { useStorage } from "@/lib/storage/store";
import { formatBytes, formatSpeed } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface DropZoneProps {
  compact?: boolean;
  onUploadStarted?: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ compact = false, onUploadStarted }) => {
  const { uploadFiles, transfers, cancelTransfer } = useStorage();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const activeTransfers = transfers.filter((t) => t.status === "uploading");

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      toast.info(`Preparing upload for ${e.dataTransfer.files.length} file(s)...`);
      onUploadStarted?.();
      try {
        await uploadFiles(e.dataTransfer.files);
        toast.success("Files successfully uploaded to cloud storage!");
      } catch (err: any) {
        toast.error(err.message || "Upload failed. Please check your storage settings.");
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast.info(`Preparing upload for ${e.target.files.length} file(s)...`);
      onUploadStarted?.();
      try {
        await uploadFiles(e.target.files);
        toast.success("Files successfully uploaded to cloud storage!");
      } catch (err: any) {
        toast.error(err.message || "Upload failed. Please check your storage settings.");
      } finally {
        e.target.value = "";
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
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

      {/* Main Interactive Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? "border-sky-400 bg-sky-500/10 scale-[1.01] shadow-2xl shadow-sky-500/20"
            : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60"
        } ${compact ? "p-6" : "p-8 sm:p-12 text-center"}`}
      >
        {/* Glow ambient decoration */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          {/* Animated Icon Circle */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800/80 text-sky-400 border border-zinc-700/60 shadow-lg shadow-sky-500/5 transition-transform duration-300 group-hover:scale-110">
            <UploadCloud className="h-8 w-8 animate-bounce-slow" />
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-white">
              {isDragging ? "Drop your files here" : "Drag & drop files or folders"}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Files are securely encrypted and stored with Cloudflare R2 presigned URLs. Up to available quota.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Button
              type="button"
              variant="primary"
              size="default"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 shadow-lg shadow-sky-500/25"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Choose Files</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => folderInputRef.current?.click()}
              className="gap-2"
            >
              <FolderUp className="h-4 w-4 text-sky-400" />
              <span>Upload Folder</span>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1">
            <span className="flex items-center gap-1">✓ End-to-end encrypted</span>
            <span className="flex items-center gap-1">✓ Direct streaming</span>
            <span className="flex items-center gap-1">✓ Unlimited speed</span>
          </div>
        </div>
      </div>

      {/* Active Uploads Live Cards */}
      {activeTransfers.length > 0 && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 px-1">
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
              <span>Uploading ({activeTransfers.length})</span>
            </span>
            <span className="text-zinc-500 font-normal">Streaming to R2</span>
          </div>

          <div className="space-y-2">
            {activeTransfers.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 shadow-md space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-sky-400 flex-shrink-0" />
                    <span className="font-semibold text-white truncate max-w-xs">{item.filename}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] text-sky-400 font-medium">{formatSpeed(item.speed)}</span>
                    <button
                      onClick={() => cancelTransfer(item.id)}
                      className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <Progress value={item.progress} max={100} />

                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                  <span>
                    {formatBytes(item.transferredBytes)} / {formatBytes(item.size)}
                  </span>
                  <span>{item.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
