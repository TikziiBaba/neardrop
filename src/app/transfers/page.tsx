"use client";

import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useStorage } from "@/lib/storage/store";
import { formatBytes, formatSpeed } from "@/lib/utils";
import {
  ArrowLeftRight,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  RotateCcw,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function TransfersPage() {
  const { transfers, cancelTransfer, retryTransfer, clearCompletedTransfers } = useStorage();

  const uploading = transfers.filter((t) => t.status === "uploading" || t.status === "pending");
  const completed = transfers.filter((t) => t.status === "completed");
  const failed = transfers.filter((t) => t.status === "failed" || t.status === "cancelled");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Transfer Monitor</span>
              <Badge variant="secondary" className="text-xs">
                {transfers.length} total
              </Badge>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live streaming queue, transfer speeds, and upload history.
            </p>
          </div>

          {completed.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompletedTransfers}
              className="gap-1.5 self-start sm:self-auto text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Completed ({completed.length})</span>
            </Button>
          )}
        </div>

        {/* 1. Active Uploading Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-sky-400" />
              <span>Active Transfers ({uploading.length})</span>
            </h3>
            {uploading.length > 0 && (
              <span className="text-xs text-sky-400 font-mono animate-pulse">Streaming live</span>
            )}
          </div>

          {uploading.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 text-center space-y-1 text-xs text-zinc-500">
              <p>No active transfers running at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploading.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 shadow-lg"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-sky-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                          {item.filename}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {formatBytes(item.transferredBytes)} of {formatBytes(item.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="font-mono text-sky-400 font-semibold">{formatSpeed(item.speed)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelTransfer(item.id)}
                        className="text-xs text-zinc-400 hover:text-rose-400 h-7 px-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>

                  <Progress value={item.progress} max={100} />

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>{item.progress}% Completed</span>
                    <span>Direct R2 stream</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Completed Transfers */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 px-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Completed Transfers ({completed.length})</span>
          </h3>

          {completed.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 text-center text-xs text-zinc-500">
              No completed transfers yet in this session.
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 divide-y divide-zinc-800/60 overflow-hidden">
              {completed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 text-xs hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold text-zinc-200 truncate">{item.filename}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400 flex-shrink-0">
                    <span>{formatBytes(item.size)}</span>
                    <Badge variant="success" className="text-[10px]">
                      Success
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Failed or Cancelled */}
        {failed.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 px-1">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <span>Failed / Cancelled ({failed.length})</span>
            </h3>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 divide-y divide-zinc-800/60 overflow-hidden">
              {failed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 text-xs hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                    <span className="font-medium text-zinc-300 truncate">{item.filename}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => retryTransfer(item.id)}
                      className="gap-1.5 text-xs h-7"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Retry</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
