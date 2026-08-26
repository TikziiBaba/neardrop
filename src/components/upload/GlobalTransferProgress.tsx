"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStorage } from "@/lib/storage/store";
import { useLanguage } from "@/lib/i18n/context";
import { formatBytes, formatSpeed, formatEta, getFileCategory } from "@/lib/utils";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  RotateCw,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  Loader2,
  Trash2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const GlobalTransferProgress: React.FC = () => {
  const { transfers, cancelTransfer, retryTransfer, clearCompletedTransfers } = useStorage();
  const { t, locale } = useLanguage();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const activeTransfers = transfers.filter(
    (t) => t.status === "uploading" || t.status === "pending"
  );
  const completedTransfers = transfers.filter((t) => t.status === "completed");
  const failedTransfers = transfers.filter(
    (t) => t.status === "failed" || t.status === "cancelled"
  );

  const hasTransfers = transfers.length > 0;
  const isCurrentlyUploading = activeTransfers.length > 0;

  // Automatically show widget when a new transfer starts
  useEffect(() => {
    if (hasTransfers) {
      setIsVisible(true);
    }
  }, [hasTransfers, activeTransfers.length]);

  if (!isVisible || !hasTransfers) {
    return null;
  }

  // Calculate aggregated stats across active transfers
  const totalActiveBytes = activeTransfers.reduce((acc, t) => acc + (t.size || 0), 0);
  const totalTransferredBytes = activeTransfers.reduce(
    (acc, t) => acc + (t.transferredBytes || 0),
    0
  );
  const overallProgress =
    totalActiveBytes > 0
      ? Math.min(99, Math.round((totalTransferredBytes / totalActiveBytes) * 100))
      : 0;

  const totalSpeed = activeTransfers.reduce((acc, t) => acc + (t.speed || 0), 0);
  const remainingBytes = Math.max(0, totalActiveBytes - totalTransferredBytes);
  const aggregatedEta =
    totalSpeed > 0 ? Math.round(remainingBytes / totalSpeed) : undefined;

  const getFileIcon = (mimeType: string, filename: string) => {
    const category = getFileCategory(mimeType || "", filename);
    switch (category) {
      case "image":
        return <FileImage className="h-4 w-4 text-emerald-400 flex-shrink-0" />;
      case "video":
        return <FileVideo className="h-4 w-4 text-purple-400 flex-shrink-0" />;
      case "audio":
        return <FileAudio className="h-4 w-4 text-amber-400 flex-shrink-0" />;
      case "code":
        return <FileCode className="h-4 w-4 text-sky-400 flex-shrink-0" />;
      case "archive":
        return <FileArchive className="h-4 w-4 text-orange-400 flex-shrink-0" />;
      default:
        return <FileText className="h-4 w-4 text-zinc-400 flex-shrink-0" />;
    }
  };

  return (
    <aside aria-label="Transfer Progress" className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-2rem)] sm:max-w-md w-full pointer-events-none select-none">
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* Minimized Floating Pill */
          <motion.div
            key="minimized-pill"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto ml-auto w-fit"
          >
            <button
              onClick={() => setIsExpanded(true)}
              className="flex items-center gap-3 rounded-full border border-zinc-700/80 bg-zinc-950/90 px-4 py-2.5 shadow-2xl backdrop-blur-xl hover:border-zinc-600 hover:bg-zinc-900 transition-all group"
            >
              {isCurrentlyUploading ? (
                <div className="relative flex h-6 w-6 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400/30" />
                  <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                </div>
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              )}

              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {isCurrentlyUploading
                      ? `${activeTransfers.length} ${t.transferWidget.uploadingCount}`
                      : t.transferWidget.allUploadsCompleted}
                  </span>
                  {isCurrentlyUploading && (
                    <span className="rounded-md bg-sky-500/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-sky-300">
                      %{overallProgress}
                    </span>
                  )}
                </div>

                {isCurrentlyUploading && (
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                    <span>{formatSpeed(totalSpeed)}</span>
                    <span>•</span>
                    <span>{formatEta(aggregatedEta, locale)}</span>
                  </div>
                )}
              </div>

              <div className="pl-1 text-zinc-400 group-hover:text-white transition-colors">
                <ChevronUp className="h-4 w-4" />
              </div>
            </button>
          </motion.div>
        ) : (
          /* Expanded Full Transfer Card */
          <motion.div
            key="expanded-card"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-auto rounded-3xl border border-zinc-800/90 bg-zinc-950/95 p-4 shadow-2xl shadow-black/80 backdrop-blur-2xl space-y-3.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {isCurrentlyUploading ? (
                    <UploadCloud className="h-4 w-4 animate-bounce-slow" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{t.transferWidget.uploadProgress}</span>
                    {isCurrentlyUploading && (
                      <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                        {activeTransfers.length}
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    {isCurrentlyUploading
                      ? `${formatBytes(totalTransferredBytes)} / ${formatBytes(totalActiveBytes)}`
                      : `${completedTransfers.length} ${t.transferWidget.completed}`}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                {completedTransfers.length > 0 && !isCurrentlyUploading && (
                  <button
                    onClick={clearCompletedTransfers}
                    title={t.transferWidget.clearCompleted}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsExpanded(false)}
                  title={t.transferWidget.minimize}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsVisible(false)}
                  title={t.dropzone.cancel}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Aggregated Overall Progress Bar */}
            {isCurrentlyUploading && (
              <div className="space-y-1.5 rounded-2xl bg-zinc-900/60 p-2.5 border border-zinc-800/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                    <span>{t.transferWidget.totalTransferred}</span>
                  </span>
                  <span className="font-mono font-bold text-sky-400">
                    %{overallProgress}
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallProgress}%` }}
                    transition={{ ease: "easeOut", duration: 0.3 }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono pt-0.5">
                  <span>{formatSpeed(totalSpeed)}</span>
                  <span>{formatEta(aggregatedEta, locale)}</span>
                </div>
              </div>
            )}

            {/* Transfer Items Scrollable List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {transfers.slice(0, 10).map((item) => {
                const isUploading = item.status === "uploading" || item.status === "pending";
                const isCompleted = item.status === "completed";
                const isFailed = item.status === "failed" || item.status === "cancelled";

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 p-2.5 space-y-1.5 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(item.file?.type || "", item.filename)}
                        <span
                          className="font-medium text-white truncate max-w-[180px] sm:max-w-[220px]"
                          title={item.filename}
                        >
                          {item.filename}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isUploading && (
                          <span className="font-mono font-bold text-[11px] text-sky-400">
                            %{item.progress}
                          </span>
                        )}

                        {isCompleted && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                            ✓ {t.transferWidget.completed}
                          </span>
                        )}

                        {isFailed && (
                          <button
                            onClick={() => retryTransfer(item.id)}
                            className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                          >
                            <RotateCw className="h-2.5 w-2.5" />
                            <span>{t.transferWidget.retry}</span>
                          </button>
                        )}

                        {isUploading && (
                          <button
                            onClick={() => cancelTransfer(item.id)}
                            title={t.transferWidget.cancelUpload}
                            className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar for Active Upload */}
                    {isUploading && (
                      <div className="space-y-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                          <motion.div
                            className="h-full bg-sky-400"
                            animate={{ width: `${item.progress}%` }}
                            transition={{ ease: "easeOut", duration: 0.2 }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                          <span>
                            {formatBytes(item.transferredBytes)} / {formatBytes(item.size)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span>{formatSpeed(item.speed)}</span>
                            {item.eta !== undefined && (
                              <>
                                <span>•</span>
                                <span>{formatEta(item.eta, locale)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
