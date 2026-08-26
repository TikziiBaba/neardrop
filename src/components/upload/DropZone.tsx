"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, FolderUp, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight, X } from "lucide-react";
import { useStorage } from "@/lib/storage/store";
import { useLanguage } from "@/lib/i18n/context";
import { extractFilesFromDataTransfer } from "@/lib/utils/folder-upload";
import { formatBytes, formatSpeed, formatEta } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
        toast.info(locale === "tr" ? `${extractedFiles.length} dosya hazırlanıyor...` : `Preparing upload for ${extractedFiles.length} file(s)...`);
        onUploadStarted?.();
        await uploadFiles(extractedFiles);
        toast.success(locale === "tr" ? "Dosyalar güvenli depolama yerimize başarıyla yüklendi!" : "Files successfully uploaded to secure storage!");
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Please check your storage settings.");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      toast.info(locale === "tr" ? `${filesArray.length} dosya hazırlanıyor...` : `Preparing upload for ${filesArray.length} file(s)...`);
      onUploadStarted?.();
      try {
        await uploadFiles(filesArray);
        toast.success(locale === "tr" ? "Dosyalar güvenli depolama yerimize başarıyla yüklendi!" : "Files successfully uploaded to secure storage!");
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
              {isDragging ? t.dropzone.dropHere : t.dropzone.dragDropHint}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t.dropzone.r2Description}
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
              <span>{t.dropzone.chooseFiles}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => folderInputRef.current?.click()}
              className="gap-2"
            >
              <FolderUp className="h-4 w-4 text-sky-400" />
              <span>{t.dropzone.uploadFolder}</span>
            </Button>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1">
            <span className="flex items-center gap-1">✓ {t.dropzone.encrypted}</span>
            <span className="flex items-center gap-1">✓ {t.dropzone.directStreaming}</span>
            <span className="flex items-center gap-1">✓ {t.dropzone.unlimitedSpeed}</span>
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
