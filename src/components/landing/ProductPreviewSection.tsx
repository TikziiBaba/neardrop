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
import { useLanguage } from "@/lib/i18n/context";
import { motion, AnimatePresence } from "framer-motion";
import { SectionHeader } from "@/components/ui/SectionHeader";

const spring = { type: "spring" as const, bounce: 0.12, duration: 0.6 };

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
        <SectionHeader title={t.productPreview.title} subtitle={t.productPreview.subtitle} />

        {/* Segmented Control */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center justify-center rounded-full border border-[var(--apple-separator)] bg-[var(--apple-bg)] p-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                  className={`relative flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full text-[12px] font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "text-white"
                      : "text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 rounded-full bg-[var(--apple-blue)] shadow-sm"
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

        {/* macOS Window */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={spring}
          className="rounded-2xl border border-[var(--apple-separator)] bg-white shadow-lg shadow-black/[0.06] overflow-hidden max-w-5xl mx-auto"
        >
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-[var(--apple-separator-light)] bg-[#fafafa] px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <div className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-white border border-[var(--apple-separator-light)] text-[11px] text-[var(--apple-text-tertiary)] font-mono">
              <span className="text-[var(--apple-blue)] font-medium">https://</span>
              <span>neardrop.bekirr.dev/{activeTab}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--apple-green)] animate-gentle-pulse" />
              <span className="text-[var(--apple-green)] font-semibold">LIVE</span>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-10 min-h-[420px] flex flex-col justify-center relative bg-white">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="tab-dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: t.productPreview.totalFiles, value: "124", change: "+12%", icon: FolderOpen },
                      { label: t.productPreview.storageUsed, value: "2.4 GB", change: "24%", icon: HardDrive },
                      { label: t.productPreview.activeShares, value: "18", change: "Live", icon: Share2 },
                      { label: t.productPreview.totalDownloads, value: "426", change: "+84", icon: Download },
                    ].map((stat, idx) => {
                      const Icon = stat.icon;
                      return (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 + 0.04, duration: 0.25 }}
                          className="p-4 rounded-xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] space-y-2 hover:border-[var(--apple-separator)] transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs text-[var(--apple-text-secondary)] font-medium">
                            <span>{stat.label}</span>
                            <Icon className="h-3.5 w-3.5 text-[var(--apple-blue)]" />
                          </div>
                          <div className="flex items-baseline justify-between">
                            <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--apple-text-primary)]">
                              {stat.value}
                            </p>
                            <span className="text-[10px] font-semibold text-[var(--apple-green)] bg-[rgba(52,199,89,0.08)] px-2 py-0.5 rounded-md">
                              {stat.change}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.16, duration: 0.25 }}
                    className="p-5 rounded-xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--apple-text-primary)] flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[var(--apple-blue)]" />
                        <span>{t.productPreview.recentActivity}</span>
                      </span>
                      <span className="text-[11px] text-[var(--apple-blue)] font-medium">
                        {t.productPreview.newFilesToday}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { name: "client-project-v2.zip", meta: "Cloud Storage • Direct Link", size: "1.82 GB", icon: FileArchive, iconBg: "bg-[rgba(255,149,0,0.08)]", iconColor: "text-[var(--apple-orange)]" },
                        { name: "brand-guidelines.pdf", meta: "Encrypted • 24h Expiry", size: "14.8 MB", icon: FileText, iconBg: "bg-[var(--apple-blue-light)]", iconColor: "text-[var(--apple-blue)]" },
                      ].map((file) => {
                        const FileIcon = file.icon;
                        return (
                          <div
                            key={file.name}
                            className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[var(--apple-separator-light)] text-xs hover:border-[var(--apple-separator)] transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-xl ${file.iconBg} flex items-center justify-center ${file.iconColor}`}>
                                <FileIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="font-medium text-[var(--apple-text-primary)] block">{file.name}</span>
                                <span className="text-[11px] text-[var(--apple-text-tertiary)]">{file.meta}</span>
                              </div>
                            </div>
                            <span className="text-[var(--apple-text-primary)] font-mono font-medium">{file.size}</span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {activeTab === "files" && (
                <motion.div
                  key="tab-files"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium text-[var(--apple-text-primary)]">
                        {t.productPreview.myCloudFiles}
                      </h4>
                      <span className="text-xs text-[var(--apple-text-quaternary)]">• 3 items</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[var(--apple-blue-light)] text-[10px] font-medium text-[var(--apple-blue)]">
                      {t.productPreview.filesCount}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "design-assets-2026.zip", size: "1.82 GB", date: t.productPreview.today, shares: `1 ${t.productPreview.activeLabel}`, icon: FileArchive, color: "text-[var(--apple-orange)]", bg: "bg-[rgba(255,149,0,0.08)]" },
                      { name: "product-demo-4k.mp4", size: "420 MB", date: t.productPreview.yesterday, shares: t.productPreview.noShares, icon: FileVideo, color: "text-[var(--apple-indigo)]", bg: "bg-[rgba(88,86,214,0.08)]" },
                      { name: "client-brand-guidelines.pdf", size: "14.8 MB", date: "Aug 15", shares: `1 ${t.productPreview.activeLabel}`, icon: FileText, color: "text-[var(--apple-blue)]", bg: "bg-[var(--apple-blue-light)]" },
                    ].map((f, i) => {
                      const Icon = f.icon;
                      return (
                        <motion.div
                          key={f.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 + 0.04, duration: 0.25 }}
                          className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] text-xs hover:border-[var(--apple-separator)] transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-9 w-9 rounded-xl ${f.bg} flex items-center justify-center ${f.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="font-medium text-[var(--apple-text-primary)] group-hover:text-[var(--apple-blue)] transition-colors block">
                                {f.name}
                              </span>
                              <span className="text-[10px] text-[var(--apple-text-quaternary)]">{f.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-[var(--apple-text-tertiary)]">
                            <span className="font-mono font-medium">{f.size}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white border border-[var(--apple-separator-light)] text-[10px] text-[var(--apple-text-quaternary)]">
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-md mx-auto p-7 rounded-2xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs font-medium text-[var(--apple-text-primary)]">
                      <div className="h-7 w-7 rounded-lg bg-[var(--apple-blue-light)] flex items-center justify-center text-[var(--apple-blue)]">
                        <Share2 className="h-4 w-4" />
                      </div>
                      <span>{t.productPreview.shareLabel} client-project-v2.zip</span>
                    </div>
                    <span className="text-[10px] font-medium text-[var(--apple-green)] bg-[rgba(52,199,89,0.08)] px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[var(--apple-separator-light)] text-xs font-mono text-[var(--apple-blue)] flex items-center justify-between gap-2">
                    <span className="truncate">https://neardrop.bekirr.dev/s/7fH9k2Lm90</span>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--apple-blue-light)] hover:bg-[rgba(0,113,227,0.12)] text-[var(--apple-blue)] text-xs font-sans font-medium transition-all cursor-pointer"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-[var(--apple-green)]" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copied ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[var(--apple-text-quaternary)]">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-[var(--apple-separator-light)] text-[10px]">
                      <Clock className="h-3 w-3" />
                      <span>{t.productPreview.expiresIn24h}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-[var(--apple-separator-light)] text-[10px]">
                      <Lock className="h-3 w-3" />
                      <span>{t.productPreview.passwordProtected}</span>
                    </span>
                  </div>
                </motion.div>
              )}

              {activeTab === "transfers" && (
                <motion.div
                  key="tab-transfers"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-4 max-w-lg mx-auto w-full"
                >
                  <div className="p-6 rounded-2xl bg-[var(--apple-bg)] border border-[var(--apple-separator-light)] space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-[rgba(88,86,214,0.08)] flex items-center justify-center text-[var(--apple-indigo)]">
                          <FileVideo className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-medium text-[var(--apple-text-primary)] block">project-render-4k.mov</span>
                          <span className="text-[10px] text-[var(--apple-text-quaternary)]">{t.dropzone.streamingToR2}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 bg-[var(--apple-blue-light)] px-2.5 py-1 rounded-lg">
                        <Zap className="h-3.5 w-3.5 text-[var(--apple-blue)]" />
                        <span className="text-[var(--apple-blue)] font-semibold font-mono text-xs">{transferSpeed} MB/s</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--apple-separator-light)]">
                        <motion.div
                          className="h-full bg-[var(--apple-blue)] rounded-full"
                          animate={{ width: `${transferProgress}%` }}
                          transition={{ ease: "easeOut", duration: 0.4 }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--apple-text-quaternary)] font-mono">
                      <span>{((3.3 * transferProgress) / 100).toFixed(1)} GB / 3.3 GB</span>
                      <span className="text-[var(--apple-green)] font-medium">
                        {transferProgress}% • {Math.max(1, Math.round((100 - transferProgress) * 0.3))}s {t.productPreview.remaining}
                      </span>
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
