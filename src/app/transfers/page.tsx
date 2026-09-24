"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DirectTransfer } from "@/components/transfer/DirectTransfer";
import { useStorage } from "@/lib/storage/store";
import { useAuth } from "@/lib/auth/context";
import { formatBytes, formatSpeed, formatEta } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { Footer } from "@/components/layout/Footer";
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
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function TransfersPage() {
  const { user, isLoading } = useAuth();
  const { transfers, cancelTransfer, retryTransfer, clearCompletedTransfers } = useStorage();
  const { locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<"direct" | "cloud">("direct");

  const uploading = transfers.filter((t) => t.status === "uploading" || t.status === "pending");
  const completed = transfers.filter((t) => t.status === "completed");
  const failed = transfers.filter((t) => t.status === "failed" || t.status === "cancelled");

  const content = (
    <div className="space-y-8 select-none">
        {/* Page Header with Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Transfer Center</span>
              <Badge variant="secondary" className="text-xs">
                {activeTab === "direct" ? "P2P / LAN" : `${transfers.length} items`}
              </Badge>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              {"Direct peer-to-peer file sharing or cloud upload monitor."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex items-center rounded-2xl border border-zinc-800 bg-zinc-900/80 p-1 backdrop-blur-xl">
            <button
              onClick={() => setActiveTab("direct")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "direct"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Zap className="h-3.5 w-3.5 text-sky-400" />
              <span>Direct P2P Transfer</span>
            </button>

            <button
              onClick={() => setActiveTab("cloud")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "cloud"
                  ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/60"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <UploadCloud className="h-3.5 w-3.5 text-sky-400" />
              <span>{`Cloud Queue (${uploading.length})`}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Direct P2P Transfer System */}
        {activeTab === "direct" && (
          <DirectTransfer />
        )}

        {/* Tab 2: Cloud Storage Queue & History */}
        {activeTab === "cloud" && !user && (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-[#0071e3] flex items-center justify-center mx-auto">
              <UploadCloud className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {locale === "tr" ? "Bulut Kuyruğu İçin Giriş Yapın" : "Sign In to Access Cloud Queue"}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              {locale === "tr"
                ? "Bulut yüklemelerini izlemek, kalıcı bağlantı geçmişini görmek ve dosyalarınızı depolamak için ücretsiz NearDrop hesabınıza giriş yapın."
                : "Sign in to your free account to track cloud uploads, manage links, and store files."}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/login?redirect=/transfers">
                <Button variant="primary" size="sm" className="rounded-full px-5 text-xs">
                  {locale === "tr" ? "Giriş Yap" : "Sign In"}
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="sm" className="rounded-full px-5 text-xs">
                  {locale === "tr" ? "Hesap Oluştur" : "Create Account"}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "cloud" && user && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-sky-400" />
                <span>{`Active Cloud Transfers (${uploading.length})`}</span>
              </h3>
              {completed.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompletedTransfers}
                  className="gap-1.5 text-xs"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{`Clear Completed (${completed.length})`}</span>
                </Button>
              )}
            </div>

            {/* 1. Active Uploading Queue */}
            {uploading.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 p-10 text-center space-y-2 text-xs text-zinc-500">
                <UploadCloud className="h-8 w-8 mx-auto text-zinc-600" />
                <p>No active cloud uploads running at the moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploading.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3 shadow-lg backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 text-sky-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                            {item.filename}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                            {formatBytes(item.transferredBytes)} / {formatBytes(item.size)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="rounded-md bg-sky-500/20 px-2 py-0.5 font-mono text-xs font-bold text-sky-400">
                          %{item.progress}
                        </span>
                        <span className="font-mono text-sky-400 font-semibold text-[11px]">{formatSpeed(item.speed)}</span>
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

                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 transition-all duration-200"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>%{item.progress} Completed</span>
                      <div className="flex items-center gap-2">
                        {item.eta !== undefined && (
                          <span>{formatEta(item.eta, locale)}</span>
                        )}
                        <span>•</span>
                        <span className="text-zinc-500">Secure Cloud Stream</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Completed Transfers */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 px-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{`Completed Uploads (${completed.length})`}</span>
              </h3>

              {completed.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 text-center text-xs text-zinc-500">
                  No completed transfers yet in this session.
                </div>
              ) : (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 divide-y divide-zinc-800/60 overflow-hidden">
                  {completed.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 text-xs hover:bg-zinc-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span className="font-semibold text-zinc-200 truncate">{item.filename}</span>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-400 flex-shrink-0">
                        <span className="font-mono">{formatBytes(item.size)}</span>
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
                  <span>{`Failed / Cancelled (${failed.length})`}</span>
                </h3>

                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 divide-y divide-zinc-800/60 overflow-hidden">
                  {failed.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 text-xs hover:bg-zinc-800/30 transition-colors"
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
        )}
      </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-7 w-7 animate-spin text-[#0071e3]" />
      </div>
    );
  }

  if (user) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Guest Banner */}
        <div className="mb-8 rounded-2xl border border-white/[0.08] bg-zinc-900/70 p-4 sm:p-5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-zinc-300 font-medium">
              {locale === "tr"
                ? "Eşler Arası (P2P) Modu: Hesap veya kurulum gerektirmeden tarayıcılar arasında doğrudan şifreli aktarım yapabilirsiniz."
                : "Peer-to-Peer Mode: Direct encrypted file streaming between devices without sign-up."}
            </span>
          </div>
          <Link
            href="/login?redirect=/transfers"
            className="text-[#0071e3] hover:text-[#0077ed] font-semibold flex items-center gap-1 shrink-0"
          >
            <span>{locale === "tr" ? "Bulut depolama için Giriş Yapın" : "Sign in for Cloud Storage"}</span>
            <span className="text-sm">›</span>
          </Link>
        </div>

        {content}
      </div>
      <Footer />
    </div>
  );
}
