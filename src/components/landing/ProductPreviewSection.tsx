"use client";

import React, { useState, useEffect } from "react";
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
  Check,
  Copy,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/i18n/context";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const ProductPreviewSection: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"dashboard" | "files" | "share" | "transfers">("dashboard");
  const [copied, setCopied] = useState(false);
  const [transferProgress, setTransferProgress] = useState(74);
  const [transferSpeed, setTransferSpeed] = useState(48.2);

  const tabs = [
    { id: "dashboard", label: t.productPreview.tabDashboard, icon: LayoutGridIcon },
    { id: "files", label: t.productPreview.tabFiles, icon: FolderOpen },
    { id: "share", label: t.productPreview.tabShare, icon: Share2 },
    { id: "transfers", label: t.productPreview.tabTransfers, icon: ArrowLeftRight },
  ] as const;

  // Live animated transfer simulation in preview
  useEffect(() => {
    if (activeTab !== "transfers") return;
    const interval = setInterval(() => {
      setTransferProgress((prev) => (prev >= 98 ? 32 : prev + 2));
      setTransferSpeed((prev) => +(46 + Math.random() * 8).toFixed(1));
    }, 800);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="product" className="py-24 md:py-36 border-t border-zinc-800/80 bg-zinc-950/60 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-sky-500/10 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          label={t.productPreview.sectionLabel}
          title={t.productPreview.title}
          subtitle={t.productPreview.subtitle}
        />

        {/* Apple macOS Segmented Control Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center justify-center rounded-2xl border border-zinc-800/90 bg-zinc-900/90 p-1.5 backdrop-blur-2xl shadow-2xl ring-1 ring-white/[0.05]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`relative flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs font-semibold transition-all duration-250 cursor-pointer ${
                    isActive
                      ? "text-white shadow-lg shadow-black/40"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-b from-zinc-700/90 to-zinc-800 border border-zinc-600/50 shadow-inner"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-sky-400" : "text-zinc-500"}`} />
                    <span>{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Realistic macOS Tahoe Window Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-zinc-800/90 bg-zinc-900/90 shadow-2xl overflow-hidden backdrop-blur-3xl max-w-5xl mx-auto ring-1 ring-white/[0.08]"
        >
          {/* macOS Titlebar */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-3.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 shadow-inner" />
              <div className="h-3 w-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 shadow-inner" />
              <div className="h-3 w-3 rounded-full bg-[#27c93f] border border-[#1aab29]/50 shadow-inner" />
            </div>
            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span className="text-sky-400">https://</span>
              <span>neardrop.app/{activeTab}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono">LIVE</span>
            </div>
          </div>

          {/* Tab Content with Fluid Spring Blur Transition */}
          <div className="p-6 sm:p-10 min-h-[420px] flex flex-col justify-center relative bg-gradient-to-b from-zinc-950/30 to-zinc-950/70">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="tab-dashboard"
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: t.productPreview.totalFiles, value: "124", change: "+12%", color: "text-white", icon: FolderOpen },
                      { label: t.productPreview.storageUsed, value: "2.4 GB", change: "24%", color: "text-sky-400 font-mono", icon: HardDrive },
                      { label: t.productPreview.activeShares, value: "18", change: "Live", color: "text-emerald-400", icon: Share2 },
                      { label: t.productPreview.totalDownloads, value: "426", change: "+84", color: "text-blue-400", icon: Download },
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 + 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 hover:bg-zinc-900/90 transition-all duration-200"
                        >
                          <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span>{stat.label}</span>
                            <Icon className="h-3.5 w-3.5 text-zinc-500" />
                          </div>
                          <div className="flex items-baseline justify-between">
                            <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                              {stat.change}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-200 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-sky-400" />
                        <span>{t.productPreview.recentActivity}</span>
                      </span>
                      <span className="text-[11px] text-sky-400 font-medium">{t.productPreview.newFilesToday}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs hover:border-zinc-700 hover:bg-zinc-950/90 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <FileArchive className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-white block">client-project-v2.zip</span>
                            <span className="text-[10px] text-zinc-500">Cloud Storage • Direct Link</span>
                          </div>
                        </div>
                        <span className="text-zinc-400 font-mono font-medium">1.82 GB</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs hover:border-zinc-700 hover:bg-zinc-950/90 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-white block">brand-guidelines.pdf</span>
                            <span className="text-[10px] text-zinc-500">Encrypted • 24h Expiry</span>
                          </div>
                        </div>
                        <span className="text-zinc-400 font-mono font-medium">14.8 MB</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "files" && (
                <motion.div
                  key="tab-files"
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{t.productPreview.myCloudFiles}</h4>
                      <span className="text-xs text-zinc-500 font-mono">• 3 items</span>
                    </div>
                    <Badge variant="sky">{t.productPreview.filesCount}</Badge>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { name: "design-assets-2026.zip", size: "1.82 GB", date: t.productPreview.today, shares: `1 ${t.productPreview.activeLabel}`, icon: FileArchive, color: "text-amber-400", bg: "bg-amber-500/10" },
                      { name: "product-demo-4k.mp4", size: "420 MB", date: t.productPreview.yesterday, shares: t.productPreview.noShares, icon: FileVideo, color: "text-purple-400", bg: "bg-purple-500/10" },
                      { name: "client-brand-guidelines.pdf", size: "14.8 MB", date: "Aug 15", shares: `1 ${t.productPreview.activeLabel}`, icon: FileText, color: "text-sky-400", bg: "bg-sky-500/10" },
                    ].map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <motion.div
                          key={f.name}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 + 0.05, duration: 0.35 }}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-xs hover:border-zinc-700 hover:bg-zinc-900/90 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-xl ${f.bg} flex items-center justify-center ${f.color} border border-white/5`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-white group-hover:text-sky-300 transition-colors block">{f.name}</span>
                              <span className="text-[10px] text-zinc-500">{f.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-zinc-400">
                            <span className="font-mono font-medium">{f.size}</span>
                            <Badge variant="secondary">{f.shares}</Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {activeTab === "share" && (
                <motion.div
                  key="tab-share"
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-md mx-auto p-7 rounded-3xl bg-zinc-900/80 border border-zinc-800/90 space-y-5 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
                      <div className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                        <Share2 className="h-4 w-4" />
                      </div>
                      <span>{t.productPreview.shareLabel} client-project-v2.zip</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-sky-400 flex items-center justify-between gap-2 shadow-inner">
                    <span className="truncate">https://neardrop.app/s/7fH9k2Lm90</span>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-sans font-semibold border border-sky-500/30 transition-all cursor-pointer"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{t.productPreview.expiresIn24h}</span>
                      </Badge>
                      <Badge variant="warning" className="gap-1">
                        <Lock className="h-3 w-3" />
                        <span>{t.productPreview.passwordProtected}</span>
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "transfers" && (
                <motion.div
                  key="tab-transfers"
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -16, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4 max-w-lg mx-auto w-full"
                >
                  <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/90 space-y-4 shadow-2xl backdrop-blur-2xl">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                          <FileVideo className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-white block">project-render-4k.mov</span>
                          <span className="text-[10px] text-zinc-500">Streaming to R2 Storage</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-lg">
                        <Zap className="h-3.5 w-3.5 text-sky-400 animate-bounce-slow" />
                        <span className="text-sky-400 font-bold font-mono text-xs">{transferSpeed} MB/s</span>
                      </div>
                    </div>

                    {/* Animated Live Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                        <motion.div
                          className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 shadow-lg shadow-sky-500/30"
                          animate={{ width: `${transferProgress}%` }}
                          transition={{ ease: "easeOut", duration: 0.4 }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                      <span>{((3.3 * transferProgress) / 100).toFixed(1)} GB / 3.3 GB</span>
                      <span className="text-emerald-400 font-semibold">{transferProgress}% • {Math.max(1, Math.round((100 - transferProgress) * 0.3))}s {t.productPreview.remaining}</span>
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

function LayoutGridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}
