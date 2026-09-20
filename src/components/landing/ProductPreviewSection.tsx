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
  FileArchive,
  FileText,
  FileVideo,
  Check,
  Copy,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/i18n/context";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

const spring = { type: "spring" as const, bounce: 0.15, duration: 0.65 };

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

  useEffect(() => {
    if (activeTab !== "transfers") return;
    const interval = setInterval(() => {
      setTransferProgress((prev) => (prev >= 98 ? 32 : prev + 2));
      setTransferSpeed(() => +(46 + Math.random() * 8).toFixed(1));
    }, 800);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="product" className="landing-divider py-20 md:py-28 relative overflow-hidden select-none">
      <div className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          title={t.productPreview.title}
          subtitle={t.productPreview.subtitle}
        />

        {/* Apple Segmented Control */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center justify-center rounded-full border border-[#d4d4d8] bg-white/90 p-1 shadow-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`relative flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-[12px] font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-white"
                      : "text-[#27272a] hover:text-[#09090b] hover:bg-zinc-100/80"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 rounded-full bg-[#0071e3] shadow-md shadow-blue-500/25"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* macOS Tahoe Light Window Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ ...spring }}
          className="rounded-3xl border border-black/10 bg-white/95 shadow-2xl shadow-blue-500/10 hover:border-[#0071e3]/40 transition-all duration-300 overflow-hidden max-w-5xl mx-auto"
        >
          {/* macOS Titlebar — Light */}
          <div className="flex items-center justify-between border-b border-[#e4e4e7] bg-[#f8fafd] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>
            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-white border border-[#e4e4e7] text-[12px] text-[#27272a] font-mono shadow-sm">
              <span className="text-[#0071e3] font-bold">https://</span>
              <span>neardrop.bekirr.dev/{activeTab}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <div className="h-2 w-2 rounded-full bg-[#16a34a] animate-gentle-pulse" />
              <span className="text-[#16a34a] font-bold">LIVE</span>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-10 min-h-[420px] flex flex-col justify-center relative bg-transparent">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="tab-dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: t.productPreview.totalFiles, value: "124", change: "+12%", color: "text-[#09090b]", icon: FolderOpen },
                      { label: t.productPreview.storageUsed, value: "2.4 GB", change: "24%", color: "text-[#0071e3] font-mono", icon: HardDrive },
                      { label: t.productPreview.activeShares, value: "18", change: "Live", color: "text-[#16a34a]", icon: Share2 },
                      { label: t.productPreview.totalDownloads, value: "426", change: "+84", color: "text-[#5856d6]", icon: Download },
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 + 0.05, duration: 0.3 }}
                          className="p-4 rounded-2xl bg-white border border-[#e4e4e7] space-y-2 hover:border-[#0071e3]/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
                        >
                          <div className="flex items-center justify-between text-xs text-[#27272a] font-medium">
                            <span>{stat.label}</span>
                            <Icon className="h-3.5 w-3.5 text-[#0071e3]" />
                          </div>
                          <div className="flex items-baseline justify-between">
                            <p className={`text-2xl sm:text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
                            <span className="text-[10px] font-bold text-[#16a34a] bg-[#16a34a]/10 px-2 py-0.5 rounded-md">
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
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="p-5 rounded-2xl bg-white border border-[#e4e4e7] space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#09090b] flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#0071e3]" />
                        <span>{t.productPreview.recentActivity}</span>
                      </span>
                      <span className="text-[11px] text-[#0071e3] font-semibold">{t.productPreview.newFilesToday}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50/80 border border-[#e4e4e7] text-xs hover:border-[#0071e3]/50 hover:bg-white hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#ff9500]/10 flex items-center justify-center text-[#ea580c]">
                            <FileArchive className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-[#09090b] block">client-project-v2.zip</span>
                            <span className="text-[11px] text-[#27272a]">Cloud Storage • Direct Link</span>
                          </div>
                        </div>
                        <span className="text-[#09090b] font-mono font-bold">1.82 GB</span>
                      </div>
                      <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50/80 border border-[#e4e4e7] text-xs hover:border-[#0071e3]/50 hover:bg-white hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl bg-[#0071e3]/10 flex items-center justify-center text-[#0071e3]">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-[#09090b] block">brand-guidelines.pdf</span>
                            <span className="text-[11px] text-[#27272a]">Encrypted • 24h Expiry</span>
                          </div>
                        </div>
                        <span className="text-[#09090b] font-mono font-bold">14.8 MB</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "files" && (
                <motion.div
                  key="tab-files"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#1d1d1f]">{t.productPreview.myCloudFiles}</h4>
                      <span className="text-xs text-[#86868b]">• 3 items</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#0071e3]/8 text-[10px] font-medium text-[#0071e3]">
                      {t.productPreview.filesCount}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { name: "design-assets-2026.zip", size: "1.82 GB", date: t.productPreview.today, shares: `1 ${t.productPreview.activeLabel}`, icon: FileArchive, color: "text-[#ff9500]", bg: "bg-[#ff9500]/8" },
                      { name: "product-demo-4k.mp4", size: "420 MB", date: t.productPreview.yesterday, shares: t.productPreview.noShares, icon: FileVideo, color: "text-[#5856d6]", bg: "bg-[#5856d6]/8" },
                      { name: "client-brand-guidelines.pdf", size: "14.8 MB", date: "Aug 15", shares: `1 ${t.productPreview.activeLabel}`, icon: FileText, color: "text-[#0071e3]", bg: "bg-[#0071e3]/8" },
                    ].map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <motion.div
                          key={f.name}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 + 0.05, duration: 0.3 }}
                          className="flex items-center justify-between p-3.5 rounded-2xl bg-[#f5f5f7] border border-[#e8e8ed] text-xs hover:border-[#d2d2d7] transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-xl ${f.bg} flex items-center justify-center ${f.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors block">{f.name}</span>
                              <span className="text-[10px] text-[#86868b]">{f.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-[#6e6e73]">
                            <span className="font-mono font-medium">{f.size}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white border border-[#e8e8ed] text-[10px] text-[#86868b]">
                              {f.shares}
                            </span>
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-md mx-auto p-7 rounded-3xl bg-[#f5f5f7] border border-[#e8e8ed] space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-[#1d1d1f]">
                      <div className="h-7 w-7 rounded-lg bg-[#0071e3]/8 flex items-center justify-center text-[#0071e3]">
                        <Share2 className="h-4 w-4" />
                      </div>
                      <span>{t.productPreview.shareLabel} client-project-v2.zip</span>
                    </div>
                    <span className="text-[10px] font-medium text-[#34c759] bg-[#34c759]/8 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-[#e8e8ed] text-xs font-mono text-[#0071e3] flex items-center justify-between gap-2 shadow-sm">
                    <span className="truncate">https://neardrop.bekirr.dev/s/7fH9k2Lm90</span>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0071e3]/8 hover:bg-[#0071e3]/14 text-[#0071e3] text-xs font-sans font-medium transition-all cursor-pointer"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-[#34c759]" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#86868b]">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-[#e8e8ed] text-[10px]">
                      <Clock className="h-3 w-3" />
                      <span>{t.productPreview.expiresIn24h}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-[#e8e8ed] text-[10px]">
                      <Lock className="h-3 w-3" />
                      <span>{t.productPreview.passwordProtected}</span>
                    </span>
                  </div>
                </motion.div>
              )}

              {activeTab === "transfers" && (
                <motion.div
                  key="tab-transfers"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4 max-w-lg mx-auto w-full"
                >
                  <div className="p-6 rounded-3xl bg-[#f5f5f7] border border-[#e8e8ed] space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-[#5856d6]/8 flex items-center justify-center text-[#5856d6]">
                          <FileVideo className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-[#1d1d1f] block">project-render-4k.mov</span>
                          <span className="text-[10px] text-[#86868b]">{t.dropzone.streamingToR2}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[#0071e3]/8 px-2.5 py-1 rounded-lg">
                        <Zap className="h-3.5 w-3.5 text-[#0071e3]" />
                        <span className="text-[#0071e3] font-bold font-mono text-xs">{transferSpeed} MB/s</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#d2d2d7]/40">
                        <motion.div
                          className="h-full bg-[#0071e3] rounded-full"
                          animate={{ width: `${transferProgress}%` }}
                          transition={{ ease: "easeOut", duration: 0.4 }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#86868b] font-mono">
                      <span>{((3.3 * transferProgress) / 100).toFixed(1)} GB / 3.3 GB</span>
                      <span className="text-[#34c759] font-semibold">{transferProgress}% • {Math.max(1, Math.round((100 - transferProgress) * 0.3))}s {t.productPreview.remaining}</span>
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
