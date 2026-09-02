"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FolderUp, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight, X } from "lucide-react";
import { useStorage } from "@/lib/storage/store";
import { useLanguage } from "@/lib/i18n/context";
import { extractFilesFromDataTransfer } from "@/lib/utils/folder-upload";
import { formatBytes, formatSpeed, formatEta } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SoundManager } from "@/lib/utils/sound-effects";
import { toast } from "sonner";

interface DropZoneProps {
  compact?: boolean;
  onUploadStarted?: () => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ compact = false, onUploadStarted }) => {
  const { uploadFiles, transfers, cancelTransfer } = useStorage();
  const { t, locale } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const activeTransfers = transfers.filter((t) => t.status === "uploading" || t.status === "pending");

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
        onUploadStarted?.();
        await uploadFiles(extractedFiles);
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Please check your storage settings.");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onUploadStarted?.();
      try {
        await uploadFiles(filesArray);
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
        className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 ${
          isDragging
            ? "border-sky-400/80 bg-sky-500/15 scale-[1.01] shadow-2xl shadow-sky-500/25 ring-2 ring-sky-400/30"
            : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700/80 hover:bg-zinc-900/60 backdrop-blur-xl shadow-xl"
        } ${compact ? "p-6" : "p-8 sm:p-12 text-center"}`}
      >
        {/* Ambient liquid glow background */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[28rem] rounded-full bg-gradient-to-b from-sky-500/15 via-blue-500/10 to-transparent blur-3xl group-hover:from-sky-500/25 transition-all duration-500" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-5">
          {/* Multi-layered Apple Squircle Icon Container */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-sky-500/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 text-sky-400 border border-zinc-700/70 shadow-2xl shadow-sky-500/10 transition-transform duration-300 group-hover:scale-105 group-hover:border-sky-500/40">
              <UploadCloud className="h-9 w-9 text-sky-400 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </div>
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
              {isDragging ? t.dropzone.dropHere : t.dropzone.dragDropHint}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t.dropzone.r2Description}
            </p>
          </div>

          {/* Premium Apple-Grade Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* Primary Choose Files Hero Button */}
            <button
              type="button"
              onClick={() => {
                SoundManager.play("click");
                fileInputRef.current?.click();
              }}
              className="group/btn relative inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold text-xs text-white bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-xl shadow-sky-500/30 hover:shadow-sky-500/40 ring-1 ring-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer select-none"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 text-white">
                <UploadCloud className="h-3.5 w-3.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </div>
              <span className="tracking-wide">{t.dropzone.chooseFiles}</span>
              <span className="text-[10px] opacity-70 font-mono font-normal pl-0.5 border-l border-white/25">⌘O</span>
            </button>

            {/* Secondary Upload Folder Frosted Glass Button */}
            <button
              type="button"
              onClick={() => {
                SoundManager.play("click");
                folderInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-xs text-zinc-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 backdrop-blur-md shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer select-none"
            >
              <FolderUp className="h-4 w-4 text-sky-400" />
              <span>{t.dropzone.uploadFolder}</span>
            </button>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-400 pt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>{t.dropzone.encrypted}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
              <span>{t.dropzone.directStreaming}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              <span>{t.dropzone.unlimitedSpeed}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Active Uploads Live Cards */}
      {activeTransfers.length > 0 && (
        <div className="space-y-2.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 px-1">
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
              <span>{t.dropzone.uploading} ({activeTransfers.length})</span>
            </span>
            <span className="text-zinc-400 text-[11px] font-normal">{t.dropzone.streamingToR2}</span>
          </div>

          <div className="space-y-2">
            {activeTransfers.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 shadow-md space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="h-4 w-4 text-sky-400 flex-shrink-0" />
                    <span className="font-semibold text-white truncate max-w-xs">{item.filename}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="rounded-md bg-sky-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-400">
                      %{item.progress}
                    </span>
                    <button
                      onClick={() => cancelTransfer(item.id)}
                      className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                      title={t.dropzone.cancel}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 transition-all duration-200"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>
                    {formatBytes(item.transferredBytes)} / {formatBytes(item.size)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sky-400 font-medium">{formatSpeed(item.speed)}</span>
                    {item.eta !== undefined && (
                      <>
                        <span>•</span>
                        <span>{formatEta(item.eta, locale)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
