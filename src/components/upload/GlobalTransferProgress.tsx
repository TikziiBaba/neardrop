"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Folder,
  ChevronRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TransferItem } from "@/types";

interface FolderGroupData {
  folderName: string;
  items: TransferItem[];
  totalBytes: number;
  transferredBytes: number;
  totalSpeed: number;
  completedCount: number;
  failedCount: number;
  activeCount: number;
  overallProgress: number;
  eta?: number;
}

export const GlobalTransferProgress: React.FC = () => {
  const { transfers, cancelTransfer, retryTransfer, retryAllFailed, clearCompletedTransfers } = useStorage();
  const { t, locale } = useLanguage();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

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

  // Group transfers by folderGroup
  const { folderGroups, standaloneTransfers } = useMemo(() => {
    const groupMap = new Map<string, TransferItem[]>();
    const standalone: TransferItem[] = [];

    for (const item of transfers) {
      if (item.folderGroup) {
        const existing = groupMap.get(item.folderGroup);
        if (existing) {
          existing.push(item);
        } else {
          groupMap.set(item.folderGroup, [item]);
        }
      } else {
        standalone.push(item);
      }
    }

    const folderGroups: FolderGroupData[] = Array.from(groupMap.entries()).map(
      ([folderName, items]) => {
        const totalBytes = items.reduce((acc, t) => acc + (t.size || 0), 0);
        const transferredBytes = items.reduce(
          (acc, t) => acc + (t.transferredBytes || 0),
          0
        );
        const totalSpeed = items.reduce(
          (acc, t) =>
            acc + (t.status === "uploading" ? t.speed || 0 : 0),
          0
        );
        const completedCount = items.filter((t) => t.status === "completed").length;
        const failedCount = items.filter(
          (t) => t.status === "failed" || t.status === "cancelled"
        ).length;
        const activeCount = items.filter(
          (t) => t.status === "uploading" || t.status === "pending"
        ).length;
        const overallProgress =
          totalBytes > 0
            ? Math.min(
                activeCount === 0 && completedCount === items.length ? 100 : 99,
                Math.round((transferredBytes / totalBytes) * 100)
              )
            : (activeCount === 0 && completedCount === items.length && items.length > 0 ? 100 : 0);
        const remainingBytes = Math.max(0, totalBytes - transferredBytes);
        const eta = totalSpeed > 0 ? Math.round(remainingBytes / totalSpeed) : undefined;

        return {
          folderName,
          items,
          totalBytes,
          transferredBytes,
          totalSpeed,
          completedCount,
          failedCount,
          activeCount,
          overallProgress,
          eta,
        };
      }
    );

    return { folderGroups, standaloneTransfers: standalone };
  }, [transfers]);

  const toggleFolderExpand = (folderName: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderName)) {
        next.delete(folderName);
      } else {
        next.add(folderName);
      }
      return next;
    });
  };

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

  /** Renders a single standalone transfer item row */
  const renderTransferItem = (item: TransferItem) => {
    const isUploading = item.status === "uploading" || item.status === "pending";
    const isCompleted = item.status === "completed";
    const isFailed = item.status === "failed" || item.status === "cancelled";
    const displayName = item.filename.split("/").pop() || item.filename;

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
              {displayName}
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
              <div className="flex items-center gap-1.5">
                {item.errorMessage && (
                  <span
                    className="text-[10px] text-rose-400/80 truncate max-w-[120px] sm:max-w-[180px]"
                    title={item.errorMessage}
                  >
                    {item.errorMessage}
                  </span>
                )}
                <button
                  onClick={() => retryTransfer(item.id)}
                  className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                  title={item.errorMessage ? `${item.errorMessage} — ${t.transferWidget.retry}` : t.transferWidget.retry}
                >
                  <RotateCw className="h-2.5 w-2.5" />
                  <span>{t.transferWidget.retry}</span>
                </button>
              </div>
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
  };

  /** Renders a folder group row with expandable accordion */
  const renderFolderGroup = (group: FolderGroupData) => {
    const isFolderExpanded = expandedFolders.has(group.folderName);
    const allCompleted = group.completedCount === group.items.length;
    const hasActive = group.activeCount > 0;
    const hasFailed = group.failedCount > 0;

    return (
      <div
        key={`folder-${group.folderName}`}
        className="rounded-2xl border border-zinc-800/70 bg-zinc-900/50 overflow-hidden hover:border-zinc-700 transition-colors"
      >
        {/* Folder Header — clickable to expand/collapse */}
        <button
          onClick={() => toggleFolderExpand(group.folderName)}
          className="w-full flex items-center justify-between gap-2 p-2.5 text-xs hover:bg-zinc-800/30 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/25 text-sky-400 flex-shrink-0">
              <Folder className="h-3.5 w-3.5" />
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white truncate max-w-[160px] sm:max-w-[200px]">
                  {group.folderName}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono flex-shrink-0">
                  {group.items.length} dosya
                </span>
              </div>
              {hasActive && (
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono mt-0.5">
                  <span>{formatBytes(group.transferredBytes)} / {formatBytes(group.totalBytes)}</span>
                  <span>•</span>
                  <span>{formatSpeed(group.totalSpeed)}</span>
                  {group.eta !== undefined && (
                    <>
                      <span>•</span>
                      <span>{formatEta(group.eta, locale)}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {allCompleted && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                ✓ {t.transferWidget.completed}
              </span>
            )}

            {hasActive && (
              <span className="font-mono font-bold text-[11px] text-sky-400">
                %{group.overallProgress}
              </span>
            )}

            {hasFailed && !hasActive && !allCompleted && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  retryAllFailed(group.folderName);
                }}
                className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                title="Bu klasördeki başarısız dosyaları yeniden dene"
              >
                <RotateCw className="h-2.5 w-2.5" />
                <span>{group.failedCount} başarısız • Yeniden Dene</span>
              </button>
            )}

            <ChevronRight
              className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 ${
                isFolderExpanded ? "rotate-90" : ""
              }`}
            />
          </div>
        </button>

        {/* Folder Progress Bar */}
        {hasActive && (
          <div className="px-2.5 pb-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500"
                animate={{ width: `${group.overallProgress}%` }}
                transition={{ ease: "easeOut", duration: 0.3 }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-1">
              <span>{group.completedCount}/{group.items.length} tamamlandı</span>
            </div>
          </div>
        )}

        {/* Expanded file list inside folder */}
        <AnimatePresence>
          {isFolderExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-zinc-800/60 px-2.5 py-2 space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {group.items.map((item) => {
                  const isUploading = item.status === "uploading" || item.status === "pending";
                  const isCompleted = item.status === "completed";
                  const isFailed = item.status === "failed" || item.status === "cancelled";
                  const displayName = item.filename.split("/").pop() || item.filename;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-800/30 transition-colors text-[11px]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(item.file?.type || "", item.filename)}
                        <span
                          className="text-zinc-300 truncate max-w-[140px] sm:max-w-[180px]"
                          title={item.filename}
                        >
                          {displayName}
                        </span>
                        <span className="text-zinc-600 font-mono flex-shrink-0">
                          {formatBytes(item.size)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isUploading && (
                          <>
                            <div className="w-16 h-1 rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                className="h-full bg-sky-400 transition-all duration-200"
                                style={{ width: `${item.progress}%` }}
                              />
                            </div>
                            <span className="font-mono text-[10px] text-sky-400 w-7 text-right">
                              %{item.progress}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelTransfer(item.id);
                              }}
                              className="p-0.5 text-zinc-500 hover:text-rose-400 transition-colors"
                              title={t.transferWidget.cancelUpload}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        )}

                        {isCompleted && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        )}

                        {isFailed && (
                          <div className="flex items-center gap-1.5">
                            {item.errorMessage && (
                              <span
                                className="text-[10px] text-rose-400/80 truncate max-w-[100px] sm:max-w-[140px]"
                                title={item.errorMessage}
                              >
                                {item.errorMessage}
                              </span>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                retryTransfer(item.id);
                              }}
                              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors p-1 hover:bg-amber-500/10 rounded"
                              title={item.errorMessage ? `${item.errorMessage} — Yeniden Dene` : "Yeniden Dene"}
                            >
                              <RotateCw className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
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
                {failedTransfers.length > 0 && !isCurrentlyUploading && (
                  <button
                    onClick={() => retryAllFailed()}
                    title="Tüm başarısız yüklemeleri yeniden dene"
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 transition-colors"
                  >
                    <RotateCw className="h-3 w-3" />
                    <span className="hidden sm:inline">Tümünü Yeniden Dene</span>
                    <span className="sm:hidden">Dene</span>
                  </button>
                )}
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

            {/* Transfer Items Scrollable List — Grouped by folder */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {/* Folder groups first */}
              {folderGroups.map((group) => renderFolderGroup(group))}

              {/* Then standalone files */}
              {standaloneTransfers.slice(0, 10).map((item) => renderTransferItem(item))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

