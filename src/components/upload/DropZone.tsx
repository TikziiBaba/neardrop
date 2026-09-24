"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { UploadCloud, FolderUp, FileText, CheckCircle2, AlertCircle, Loader2, Sparkles, ArrowRight, X, ShieldCheck, Zap } from "lucide-react";
import { useStorage } from "@/lib/storage/store";
import { useAuth } from "@/lib/auth/context";
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
  const { user } = useAuth();
  const { uploadFiles, transfers, cancelTransfer } = useStorage();
  const { t, locale } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [showGuestChoice, setShowGuestChoice] = useState(false);
  const [guestFilesCount, setGuestFilesCount] = useState(0);
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
        if (!user) {
          SoundManager.play("pop");
          setGuestFilesCount(extractedFiles.length);
          setShowGuestChoice(true);
          return;
        }
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
      if (!user) {
        SoundManager.play("pop");
        setGuestFilesCount(filesArray.length);
        setShowGuestChoice(true);
        e.target.value = "";
        return;
      }
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
            ? "border-[#0071e3] bg-blue-50/80 scale-[1.01] shadow-2xl shadow-blue-500/20 ring-2 ring-[#0071e3]/40"
            : "border-[#d4d4d8] bg-white/90 hover:border-[#0071e3]/60 hover:bg-white backdrop-blur-xl shadow-lg shadow-black/[0.03] dark:border-zinc-800/80 dark:bg-zinc-900/40"
        } ${compact ? "p-6" : "p-8 sm:p-12 text-center"}`}
      >
        {/* Ambient liquid glow background */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[28rem] rounded-full bg-gradient-to-b from-blue-500/10 via-sky-500/5 to-transparent blur-3xl group-hover:from-blue-500/20 transition-all duration-500" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-5">
          {/* Multi-layered Apple Squircle Icon Container */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl group-hover:blur-2xl transition-all duration-300" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-b from-[#0071e3] to-[#005bb5] text-white shadow-xl shadow-blue-500/25 border border-white/20 transition-transform duration-300 group-hover:scale-105">
              <UploadCloud className="h-9 w-9 text-white group-hover:-translate-y-0.5 transition-transform duration-300" />
            </div>
          </div>

          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#09090b] dark:text-white">
              {isDragging ? t.dropzone.dropHere : t.dropzone.dragDropHint}
            </h3>
            <p className="text-xs text-[#27272a] dark:text-zinc-400 font-normal leading-relaxed">
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
              className="group/btn relative inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold text-xs text-white bg-gradient-to-r from-[#0071e3] to-[#0077ed] hover:from-[#0077ed] hover:to-[#005bb5] shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer select-none"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20 text-white">
                <UploadCloud className="h-3.5 w-3.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </div>
              <span className="tracking-wide">{t.dropzone.chooseFiles}</span>
              <span className="text-[10px] opacity-70 font-mono font-normal pl-0.5 border-l border-white/25">⌘O</span>
            </button>

            {/* Secondary Upload Folder Button */}
            <button
              type="button"
              onClick={() => {
                SoundManager.play("click");
                folderInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-xs text-[#09090b] dark:text-zinc-200 bg-white hover:bg-blue-50/60 border border-[#d4d4d8] hover:border-[#0071e3] hover:text-[#0071e3] shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer select-none"
            >
              <FolderUp className="h-4 w-4 text-[#0071e3]" />
              <span>{t.dropzone.uploadFolder}</span>
            </button>
          </div>

          {/* Security & All Formats Supported Banner */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-800 dark:text-emerald-400 text-[11px] font-semibold shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{t.dropzone.allFormatsSupported}</span>
            <span className="opacity-40">•</span>
            <span className="text-emerald-700 dark:text-emerald-300">{t.dropzone.securityScanActive}</span>
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#27272a] dark:text-zinc-400 pt-1 font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{t.dropzone.encrypted}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0071e3]" />
              <span>{t.dropzone.directStreaming}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              <span>{t.dropzone.unlimitedSpeed}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Active Uploads Live Cards — Grouped by Folder */}
      {activeTransfers.length > 0 && (() => {
        // Group active transfers by folder
        const folderMap = new Map<string, typeof activeTransfers>();
        const standaloneActive: typeof activeTransfers = [];
        
        for (const item of activeTransfers) {
          if (item.folderGroup) {
            const existing = folderMap.get(item.folderGroup);
            if (existing) {
              existing.push(item);
            } else {
              folderMap.set(item.folderGroup, [item]);
            }
          } else {
            standaloneActive.push(item);
          }
        }

        // Also count total items per folder (including completed) from all transfers
        const folderTotalMap = new Map<string, { total: number; completed: number; totalBytes: number; transferredBytes: number }>();
        for (const item of transfers) {
          if (item.folderGroup) {
            const existing = folderTotalMap.get(item.folderGroup);
            if (existing) {
              existing.total += 1;
              if (item.status === "completed") existing.completed += 1;
              existing.totalBytes += item.size || 0;
              existing.transferredBytes += item.transferredBytes || 0;
            } else {
              folderTotalMap.set(item.folderGroup, {
                total: 1,
                completed: item.status === "completed" ? 1 : 0,
                totalBytes: item.size || 0,
                transferredBytes: item.transferredBytes || 0,
              });
            }
          }
        }

        return (
          <div className="space-y-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 px-1">
              <span className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-400" />
                <span>{t.dropzone.uploading} ({activeTransfers.length})</span>
              </span>
              <span className="text-zinc-400 text-[11px] font-normal">{t.dropzone.streamingToR2}</span>
            </div>

            <div className="space-y-2">
              {/* Folder groups */}
              {Array.from(folderMap.entries()).map(([folderName, items]) => {
                const totals = folderTotalMap.get(folderName);
                const totalFiles = totals?.total || items.length;
                const completedFiles = totals?.completed || 0;
                const totalBytes = totals?.totalBytes || 0;
                const transferredBytes = totals?.transferredBytes || 0;
                const folderProgress = totalBytes > 0 ? Math.min(99, Math.round((transferredBytes / totalBytes) * 100)) : (completedFiles === totalFiles && totalFiles > 0 ? 100 : 0);
                const folderSpeed = items.reduce((acc, t) => acc + (t.status === "uploading" ? t.speed || 0 : 0), 0);

                return (
                  <div
                    key={`folder-${folderName}`}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3.5 shadow-md space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 flex-shrink-0">
                          <FolderUp className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-white truncate block max-w-xs">{folderName}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {completedFiles}/{totalFiles} dosya tamamlandı
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="rounded-md bg-sky-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-400">
                          %{folderProgress}
                        </span>
                      </div>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 transition-all duration-200"
                        style={{ width: `${folderProgress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>
                        {formatBytes(transferredBytes)} / {formatBytes(totalBytes)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sky-400 font-medium">{formatSpeed(folderSpeed)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Standalone files */}
              {standaloneActive.map((item) => (
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
        );
      })()}

      {/* Guest Transfer Choice Modal */}
      {showGuestChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-[32px] border border-white/[0.12] bg-[#161617] p-6 sm:p-8 shadow-2xl space-y-6 text-left">
            <button
              onClick={() => setShowGuestChoice(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/[0.08] transition-colors"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0071e3]">
                {locale === "tr" ? "NearDrop Transfer Seçenekleri" : "NearDrop Transfer Modes"}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {locale === "tr"
                  ? `${guestFilesCount} dosya hazır. Nasıl göndermek istersiniz?`
                  : `${guestFilesCount} file(s) ready. How would you like to share?`}
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* Option 1: Direct P2P (No Account) */}
              <Link
                href="/transfers"
                onClick={() => setShowGuestChoice(false)}
                className="block p-4 sm:p-5 rounded-2xl border border-[#0071e3]/30 bg-[#0071e3]/10 hover:bg-[#0071e3]/20 hover:border-[#0071e3]/50 transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#0071e3] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        {locale === "tr" ? "Eşler Arası (P2P) Aktar" : "Direct P2P Streaming"}
                      </span>
                      <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {locale === "tr" ? "Hesapsız · Sınırsız Hız" : "No Account · Unlimited"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                      {locale === "tr"
                        ? "Dosyalar sunucuya yüklenmez. Cihazınızdan doğrudan alıcının tarayıcısına akar."
                        : "Files never touch our servers. Stream directly from your browser to recipient."}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Option 2: Cloud Link (Sign In) */}
              <Link
                href="/register?redirect=/dashboard"
                onClick={() => setShowGuestChoice(false)}
                className="block p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-zinc-900/80 hover:bg-zinc-800/80 hover:border-white/[0.16] transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 text-zinc-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <UploadCloud className="h-5 w-5 text-sky-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">
                        {locale === "tr" ? "Buluta Yükle & Link Al" : "Upload to Cloud & Get Link"}
                      </span>
                      <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                        {locale === "tr" ? "Ücretsiz Hesap" : "Free Account"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      {locale === "tr"
                        ? "Süreli ve şifreli indirme bağlantısı oluşturun. 10 saniyede ücretsiz kaydolun."
                        : "Create an expiring, password-protected link with a free 10-second sign-up."}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
