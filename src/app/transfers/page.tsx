"use client";

import React, { useState, Suspense } from "react";
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
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function TransfersPage() {
  const { user, isLoading } = useAuth();
  const { transfers, cancelTransfer, retryTransfer, clearCompletedTransfers } = useStorage();
  const { locale } = useLanguage();
  const isTr = locale === "tr";
  const [activeTab, setActiveTab] = useState<"direct" | "cloud">("direct");

  const uploading = transfers.filter((t) => t.status === "uploading" || t.status === "pending");
  const completed = transfers.filter((t) => t.status === "completed");
  const failed = transfers.filter((t) => t.status === "failed" || t.status === "cancelled");

  const content = (
    <div className="space-y-8 select-none">
      {/* Page Header with Apple Segmented Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>{isTr ? "Transfer Merkezi" : "Transfer Center"}</span>
            <Badge variant="secondary" className="text-xs font-mono bg-white/[0.08] text-zinc-300 border-white/[0.08]">
              {activeTab === "direct" ? "P2P / AirDrop" : `${transfers.length} ${isTr ? "öğe" : "items"}`}
            </Badge>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isTr
              ? "Doğrudan tarayıcıdan tarayıcıya eşler arası (P2P) aktarım veya bulut yükleme kuyruğu."
              : "Direct browser-to-browser peer-to-peer file sharing or cloud upload monitor."}
          </p>
        </div>

        {/* Apple Segmented Control */}
        <div className="inline-flex items-center rounded-2xl border border-white/[0.08] bg-[#121216]/90 p-1 backdrop-blur-xl shadow-lg">
          <button
            onClick={() => setActiveTab("direct")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "direct"
                ? "bg-[#0071e3] text-white shadow-md shadow-blue-500/25"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Zap className="h-3.5 w-3.5 text-white" />
            <span>{isTr ? "Canlı P2P Aktarım" : "Direct P2P Transfer"}</span>
          </button>

          <button
            onClick={() => setActiveTab("cloud")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "cloud"
                ? "bg-[#0071e3] text-white shadow-md shadow-blue-500/25"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5 text-white" />
            <span>{isTr ? `Bulut Kuyruğu (${uploading.length})` : `Cloud Queue (${uploading.length})`}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Direct P2P Transfer System */}
      {activeTab === "direct" && (
        <Suspense
          fallback={
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-[32px] border border-white/[0.08] bg-[#101014]/60">
              <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
              <span className="text-xs text-zinc-400 font-mono">Loading P2P Radar...</span>
            </div>
          }
        >
          <DirectTransfer />
        </Suspense>
      )}

      {/* Tab 2: Cloud Storage Queue & History (Unauthenticated) */}
      {activeTab === "cloud" && !user && (
        <div className="rounded-[32px] border border-white/[0.08] bg-[#101014]/80 p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto backdrop-blur-2xl shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#0071e3]/15 text-[#0071e3] border border-blue-500/20 flex items-center justify-center mx-auto shadow-inner">
            <UploadCloud className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {isTr ? "Bulut Kuyruğu İçin Giriş Yapın" : "Sign In to Access Cloud Queue"}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {isTr
              ? "Bulut yüklemelerini izlemek, kalıcı bağlantı geçmişini görmek ve dosyalarınızı güvenle depolamak için NearDrop hesabınıza giriş yapın."
              : "Sign in to your free account to track cloud uploads, manage links, and store files safely."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-3">
            <Link href="/login?redirect=/transfers">
              <Button variant="primary" size="sm" className="rounded-full px-6 text-xs bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-md shadow-blue-500/20">
                {isTr ? "Giriş Yap" : "Sign In"}
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="sm" className="rounded-full px-6 text-xs border-white/[0.1] text-zinc-200 hover:bg-white/[0.06]">
                {isTr ? "Hesap Oluştur" : "Create Account"}
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Tab 2: Cloud Storage Queue & History (Authenticated) */}
      {activeTab === "cloud" && user && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-[#0071e3]" />
              <span>{isTr ? `Aktif Bulut Yüklemeleri (${uploading.length})` : `Active Cloud Transfers (${uploading.length})`}</span>
            </h3>
            {completed.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompletedTransfers}
                className="gap-1.5 text-xs rounded-xl border-white/[0.08] text-zinc-300 hover:text-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{isTr ? `Tamamlananları Temizle (${completed.length})` : `Clear Completed (${completed.length})`}</span>
              </Button>
            )}
          </div>

          {/* 1. Active Uploading Queue */}
          {uploading.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/[0.08] bg-[#101014]/40 p-12 text-center space-y-2 text-xs text-zinc-400">
              <UploadCloud className="h-8 w-8 mx-auto text-zinc-600" />
              <p>{isTr ? "Şu anda devam eden aktif bulut yüklemesi bulunmuyor." : "No active cloud uploads running at the moment."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploading.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[24px] border border-white/[0.08] bg-[#101014]/90 p-5 space-y-3 shadow-xl backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-[#0071e3] flex-shrink-0" />
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
                      <span className="rounded-lg bg-[#0071e3]/20 px-2 py-0.5 font-mono text-xs font-bold text-blue-400 border border-blue-500/20">
                        %{item.progress}
                      </span>
                      <span className="font-mono text-blue-400 font-semibold text-[11px]">{formatSpeed(item.speed)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelTransfer(item.id)}
                        className="text-xs text-zinc-400 hover:text-rose-400 h-7 px-2"
                      >
                        {isTr ? "İptal" : "Cancel"}
                      </Button>
                    </div>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800/80 p-0.5 border border-white/[0.04]">
                    <div
                      className="h-full bg-gradient-to-r from-[#0071e3] to-[#34c759] rounded-full transition-all duration-200 shadow-sm shadow-blue-500/25"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                    <span>%{item.progress} {isTr ? "Tamamlandı" : "Completed"}</span>
                    <div className="flex items-center gap-2">
                      {item.eta !== undefined && (
                        <span>{formatEta(item.eta, locale)}</span>
                      )}
                      <span>•</span>
                      <span className="text-zinc-500">{isTr ? "Güvenli Bulut Aktarımı" : "Secure Cloud Stream"}</span>
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
              <span>{isTr ? `Tamamlanan Yüklemeler (${completed.length})` : `Completed Uploads (${completed.length})`}</span>
            </h3>

            {completed.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-[#101014]/40 p-6 text-center text-xs text-zinc-500">
                {isTr ? "Bu oturumda henüz tamamlanmış aktarım yok." : "No completed transfers yet in this session."}
              </div>
            ) : (
              <div className="rounded-[28px] border border-white/[0.08] bg-[#101014]/80 divide-y divide-white/[0.06] overflow-hidden backdrop-blur-xl">
                {completed.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 text-xs hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span className="font-semibold text-zinc-200 truncate">{item.filename}</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400 flex-shrink-0">
                      <span className="font-mono">{formatBytes(item.size)}</span>
                      <Badge variant="success" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
                        {isTr ? "Başarılı" : "Success"}
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
                <span>{isTr ? `Başarısız / İptal Edilenler (${failed.length})` : `Failed / Cancelled (${failed.length})`}</span>
              </h3>

              <div className="rounded-[28px] border border-white/[0.08] bg-[#101014]/80 divide-y divide-white/[0.06] overflow-hidden backdrop-blur-xl">
                {failed.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 text-xs hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <XCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                      <span className="font-semibold text-zinc-300 truncate">{item.filename}</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => retryTransfer(item.id)}
                        className="text-xs text-sky-400 hover:text-sky-300 h-7 px-2"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        <span>{isTr ? "Tekrar Dene" : "Retry"}</span>
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

  // Authenticated user wrapper
  if (user) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  // Public / Guest user wrapper
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <main className="mx-auto w-full max-w-[1040px] px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {content}
      </main>
      <Footer />
    </div>
  );
}
