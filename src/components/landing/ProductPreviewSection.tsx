"use client";

import React, { useState } from "react";
import {
  FolderOpen,
  Share2,
  HardDrive,
  ArrowLeftRight,
  Download,
  Lock,
  Clock,
  Sparkles,
  FileArchive,
  FileText,
  FileVideo,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/i18n/context";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const ProductPreviewSection: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"dashboard" | "files" | "share" | "transfers">("dashboard");

  const tabs = [
    { id: "dashboard", label: t.productPreview.tabDashboard },
    { id: "files", label: t.productPreview.tabFiles },
    { id: "share", label: t.productPreview.tabShare },
    { id: "transfers", label: t.productPreview.tabTransfers },
  ] as const;

  return (
    <section id="product" className="py-20 md:py-32 border-t border-zinc-800/80 bg-zinc-950/40 relative overflow-hidden select-none">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={t.productPreview.sectionLabel}
          title={t.productPreview.title}
          subtitle={t.productPreview.subtitle}
        />

        {/* Apple macOS Segmented Control Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center justify-center rounded-2xl border border-zinc-800/90 bg-zinc-900/80 p-1 backdrop-blur-xl shadow-inner">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`relative px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-zinc-800 text-white shadow-sm shadow-black/20 border border-zinc-700/60"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent"
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Realistic macOS Tahoe App Window Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-zinc-800/90 bg-zinc-900/80 shadow-2xl overflow-hidden backdrop-blur-2xl max-w-5xl mx-auto ring-1 ring-white/[0.06]"
        >
          {/* macOS Titlebar */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 shadow-inner" />
              <div className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 shadow-inner" />
              <div className="h-3 w-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 shadow-inner" />
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span>https://neardrop.bekirr.dev/{activeTab}</span>
            </div>
            <div className="w-12" />
          </div>

          {/* Tab Content Rendering */}
          <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-center relative bg-zinc-950/40">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="tab-dashboard"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: t.productPreview.totalFiles, value: "124", color: "text-white" },
                      { label: t.productPreview.storageUsed, value: "2.4 GB", color: "text-sky-400 font-mono" },
                      { label: t.productPreview.activeShares, value: "18", color: "text-emerald-400" },
                      { label: t.productPreview.totalDownloads, value: "426", color: "text-blue-400" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1 hover:border-zinc-700 transition-colors"
                      >
                        <span className="text-[11px] text-zinc-400">{stat.label}</span>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200">{t.productPreview.recentActivity}</span>
                      <span className="text-[11px] text-sky-400 font-medium">{t.productPreview.newFilesToday}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70 text-xs hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileArchive className="h-4 w-4 text-amber-400" />
                          <span className="font-medium text-white">client-project-v2.zip</span>
                        </div>
                        <span className="text-zinc-400 font-mono">1.82 GB</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/70 text-xs hover:border-zinc-700 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-sky-400" />
                          <span className="font-medium text-white">brand-guidelines.pdf</span>
                        </div>
                        <span className="text-zinc-400 font-mono">14.8 MB</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "files" && (
                <motion.div
                  key="tab-files"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white">{t.productPreview.myCloudFiles}</h4>
                    <Badge variant="sky">{t.productPreview.filesCount}</Badge>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "design-assets-2026.zip", size: "1.82 GB", date: t.productPreview.today, shares: `1 ${t.productPreview.activeLabel}`, icon: FileArchive, color: "text-amber-400" },
                      { name: "product-demo-4k.mp4", size: "420 MB", date: t.productPreview.yesterday, shares: t.productPreview.noShares, icon: FileVideo, color: "text-purple-400" },
                      { name: "client-brand-guidelines.pdf", size: "14.8 MB", date: "Aug 15", shares: `1 ${t.productPreview.activeLabel}`, icon: FileText, color: "text-sky-400" },
                    ].map((f) => {
                      const Icon = f.icon;
                      return (
                        <div
                          key={f.name}
                          className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-xs hover:border-zinc-700 hover:bg-zinc-900/90 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${f.color}`} />
                            <span className="font-semibold text-white">{f.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-zinc-400">
                            <span className="font-mono">{f.size}</span>
                            <span className="text-[11px] text-zinc-500">{f.date}</span>
                            <Badge variant="secondary">{f.shares}</Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === "share" && (
                <motion.div
                  key="tab-share"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-md mx-auto p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 space-y-4 shadow-xl backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Share2 className="h-4 w-4 text-sky-400" />
                    <span>{t.productPreview.shareLabel} client-project-v2.zip</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-sky-400 flex items-center justify-between">
                    <span>https://neardrop.bekirr.dev/s/7fH9k2Lm90</span>
                    <Badge variant="sky">{t.productPreview.copied}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Badge variant="secondary">{t.productPreview.expiresIn24h}</Badge>
                    <Badge variant="warning">{t.productPreview.passwordProtected}</Badge>
                  </div>
                </motion.div>
              )}

              {activeTab === "transfers" && (
                <motion.div
                  key="tab-transfers"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 max-w-lg mx-auto w-full"
                >
                  <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3 shadow-lg backdrop-blur-xl">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">project-render-4k.mov</span>
                      <span className="text-sky-400 font-semibold font-mono">48.2 MB/s</span>
                    </div>
                    <Progress value={74} max={100} />
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>2.4 GB / 3.3 GB</span>
                      <span className="text-emerald-400 font-medium">74% • 18 {t.productPreview.remaining}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
