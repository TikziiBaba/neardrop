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

export const ProductPreviewSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "files" | "share" | "transfers">("dashboard");

  return (
    <section className="py-20 md:py-28 border-t border-zinc-800/80 bg-zinc-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
            Product Preview
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Designed for Simplicity & Focus
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Take a look inside the NearDrop workspace. Clean layouts, instant feedback, and zero clutter.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl border border-zinc-800 bg-zinc-900/80 p-1 backdrop-blur-md">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "files", label: "File Manager" },
              { id: "share", label: "Share Creator" },
              { id: "transfers", label: "Live Transfers" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-zinc-800 text-white font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Realistic Dashboard Mockup Window */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-2xl overflow-hidden backdrop-blur-xl max-w-5xl mx-auto">
          {/* Mock Window Titlebar */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <span>https://neardrop.dev/{activeTab}</span>
            </div>
            <div className="w-12" />
          </div>

          {/* Tab Content Rendering */}
          <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-center">
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <span className="text-[11px] text-zinc-400">Total Files</span>
                    <p className="text-2xl font-bold text-white">124</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <span className="text-[11px] text-zinc-400">Storage Used</span>
                    <p className="text-2xl font-bold text-sky-400">2.4 GB</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <span className="text-[11px] text-zinc-400">Active Shares</span>
                    <p className="text-2xl font-bold text-emerald-400">18</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
                    <span className="text-[11px] text-zinc-400">Total Downloads</span>
                    <p className="text-2xl font-bold text-indigo-400">426</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200">Recent File Activity</span>
                    <span className="text-[11px] text-sky-400">3 new files today</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
                      <div className="flex items-center gap-3">
                        <FileArchive className="h-4 w-4 text-amber-400" />
                        <span className="font-medium text-white">client-project-v2.zip</span>
                      </div>
                      <span className="text-zinc-400">1.82 GB</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-sky-400" />
                        <span className="font-medium text-white">brand-guidelines.pdf</span>
                      </div>
                      <span className="text-zinc-400">14.8 MB</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "files" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">My Cloud Files</h4>
                  <Badge variant="sky">5 files</Badge>
                </div>
                <div className="space-y-2">
                  {[
                    { name: "design-assets-2026.zip", size: "1.82 GB", date: "Today", shares: "1 active" },
                    { name: "product-demo-4k.mp4", size: "420 MB", date: "Yesterday", shares: "No shares" },
                    { name: "client-brand-guidelines.pdf", size: "14.8 MB", date: "Aug 15", shares: "1 active" },
                  ].map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileArchive className="h-4 w-4 text-sky-400" />
                        <span className="font-semibold text-white">{f.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-zinc-400">
                        <span>{f.size}</span>
                        <span className="text-[11px] text-zinc-500">{f.date}</span>
                        <Badge variant="secondary">{f.shares}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "share" && (
              <div className="max-w-md mx-auto p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Share2 className="h-4 w-4 text-sky-400" />
                  <span>Share: client-project-v2.zip</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-sky-400 flex items-center justify-between">
                  <span>https://neardrop.dev/s/7fH9k2Lm90</span>
                  <Badge variant="sky">Copied</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Badge variant="secondary">Expires in 24h</Badge>
                  <Badge variant="warning">Password Protected</Badge>
                </div>
              </div>
            )}

            {activeTab === "transfers" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">project-render-4k.mov</span>
                    <span className="text-sky-400 font-medium">48.2 MB/s</span>
                  </div>
                  <Progress value={74} max={100} />
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>2.4 GB / 3.3 GB</span>
                    <span>74% • 18 seconds remaining</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
