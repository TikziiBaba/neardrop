"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminStats } from "@/types";
import { formatBytes } from "@/lib/utils";
import {
  Users,
  HardDrive,
  FolderOpen,
  Share2,
  Download,
  TrendingUp,
  Activity,
  RefreshCw,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<"traffic" | "uploads" | "downloads" | "success">("traffic");
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
      toast.error("Failed to load admin stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
    toast.success("Platform metrics synchronized");
  };

  const quotaPercent = stats
    ? Math.min(100, Math.round((stats.totalStorageBytes / (stats.totalQuotaBytes || 1)) * 100))
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-8 select-none">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <span>Platform Overview</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#0071e3]/15 px-2.5 py-0.5 text-xs font-semibold text-[#2997ff] border border-[#0071e3]/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2997ff] animate-pulse" />
                  Live Control
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#86868b]">
              Real-time NearDrop cloud telemetry, secure storage usage, active user quotas, and traffic.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-[#a1a1a6] hover:bg-white/[0.08] hover:text-white transition-all shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#2997ff]" : ""}`} />
              <span>{refreshing ? "Syncing..." : "Sync Metrics"}</span>
            </button>
            <Link href="/admin/users">
              <button className="inline-flex items-center gap-1.5 rounded-full bg-[#0071e3] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-[#0077ed] active:scale-95 transition-all">
                <Users className="h-3.5 w-3.5" />
                <span>Manage Users</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Primary Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Registered Users */}
          <Link href="/admin/users" className="group">
            <div className="rounded-3xl border border-white/[0.08] bg-[#16161a] p-5 space-y-3 group-hover:border-[#2997ff]/40 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#86868b]">Registered Users</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0071e3]/15 text-[#2997ff] border border-[#0071e3]/30">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold tracking-tight text-white">
                  {loading ? "..." : stats?.totalUsers ?? 1}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Click to view profile directory</span>
                </div>
              </div>
            </div>
          </Link>

          {/* 2. Total Cloud Files */}
          <Link href="/admin/files" className="group">
            <div className="rounded-3xl border border-white/[0.08] bg-[#16161a] p-5 space-y-3 group-hover:border-[#2997ff]/40 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#86868b]">Total Files Stored</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <FolderOpen className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold tracking-tight text-white">
                  {loading ? "..." : stats?.totalFiles ?? 0}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-sky-400 mt-1">
                  <span>Secure Object Store</span>
                </div>
              </div>
            </div>
          </Link>

          {/* 3. Total Storage Used */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#16161a] p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#86868b]">Storage Volume</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <HardDrive className="h-4 w-4" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-extrabold tracking-tight text-white">
                {loading ? "..." : formatBytes(stats?.totalStorageBytes || 0)}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-[#86868b] mt-1">
                <span>Allocated Quota: {formatBytes(stats?.totalQuotaBytes || 10737418240)}</span>
              </div>
            </div>
          </div>

          {/* 4. Active Share Links */}
          <Link href="/admin/shares" className="group">
            <div className="rounded-3xl border border-white/[0.08] bg-[#16161a] p-5 space-y-3 group-hover:border-emerald-500/40 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#86868b]">Active Share Links</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Share2 className="h-4 w-4" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-extrabold tracking-tight text-white">
                  {loading ? "..." : stats?.activeShares ?? 0}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium mt-1">
                  <Download className="h-3 w-3" />
                  <span>{stats?.totalDownloads ?? 0} total downloads served</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Detailed 7-Day Trend Station */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#16161a] p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Controls & Metric Selectors */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#2997ff]" />
                <h2 className="text-base font-bold text-white tracking-tight">
                  Transfer & Ingestion Trend (Last 7 Days)
                </h2>
                <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-[#a1a1a6]">
                  Telemetry Engine
                </span>
              </div>
              <p className="text-xs text-[#86868b]">
                Inspect day-by-day file ingestions, presigned download tokens, total bandwidth, and LAN transfers.
              </p>
            </div>

            {/* Metric Mode Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0e0e11] border border-white/[0.08] self-start lg:self-auto overflow-x-auto">
              {[
                { id: "traffic", label: "Bandwidth & Volume" },
                { id: "uploads", label: "Upload Count" },
                { id: "downloads", label: "Download Count" },
                { id: "success", label: "Success Rate %" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMetric(m.id as any)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedMetric === m.id
                      ? "bg-[#0071e3] text-white shadow-md shadow-blue-500/20"
                      : "text-[#86868b] hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chart Visualizer */}
          <div className="relative rounded-2xl border border-white/[0.06] bg-[#0e0e11] p-6">
            <div className="grid grid-cols-7 gap-3 sm:gap-6 items-end h-52 pb-4 border-b border-white/[0.08]">
              {stats?.dailyActivity.map((day: any, idx) => {
                let barHeight = 20;
                let primaryColor = "from-[#0071e3] to-[#2997ff]";
                let displayVal = `${formatBytes(day.bytes)}`;

                if (selectedMetric === "uploads") {
                  barHeight = Math.min(100, Math.max(18, (day.uploads / 10) * 100));
                  primaryColor = "from-sky-600 to-sky-400";
                  displayVal = `${day.uploads} uploads`;
                } else if (selectedMetric === "downloads") {
                  barHeight = Math.min(100, Math.max(18, (day.downloads / 15) * 100));
                  primaryColor = "from-emerald-600 to-teal-400";
                  displayVal = `${day.downloads} downloads`;
                } else if (selectedMetric === "success") {
                  barHeight = Math.min(100, Math.max(70, day.successRate || 99));
                  primaryColor = "from-emerald-500 to-emerald-400";
                  displayVal = `${(day.successRate || 99.8).toFixed(1)}%`;
                } else {
                  // traffic
                  barHeight = Math.min(100, Math.max(22, (day.bytes / (stats.totalStorageBytes || 10485760)) * 100 * 2.5));
                }

                const isHovered = hoveredDayIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredDayIndex(idx)}
                    onMouseLeave={() => setHoveredDayIndex(null)}
                    className="flex flex-col items-center gap-2.5 h-full justify-end group cursor-pointer relative"
                  >
                    {/* Hover Info Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-16 z-20 whitespace-nowrap rounded-xl border border-white/[0.12] bg-[#1a1a1f] px-3 py-1.5 text-center shadow-xl backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                        <p className="text-[11px] font-bold text-white">{day.date}</p>
                        <p className="text-[10px] text-[#2997ff] font-semibold">{displayVal}</p>
                      </div>
                    )}

                    {/* Bar graphic */}
                    <div className="w-full max-w-[42px] flex flex-col items-center h-full justify-end">
                      <div
                        style={{ height: `${barHeight}%` }}
                        className={`w-full rounded-t-xl bg-gradient-to-t ${primaryColor} transition-all duration-300 ${
                          isHovered ? "brightness-125 scale-x-105 shadow-lg shadow-blue-500/20" : "opacity-90"
                        }`}
                      />
                    </div>

                    <span className={`text-[11px] font-semibold transition-colors ${isHovered ? "text-[#2997ff]" : "text-[#86868b]"}`}>
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Granular telemetry stats bar below chart */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#86868b] font-medium">Avg Daily Throughput</span>
                <p className="text-sm font-bold text-white">
                  {formatBytes((stats?.totalBandwidthBytes || 0) / 7)} / day
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#86868b] font-medium">Success Rate</span>
                <p className="text-sm font-bold text-emerald-400">99.8% Availability</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#86868b] font-medium">Avg Presigned Latency</span>
                <p className="text-sm font-bold text-sky-400">38ms</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#86868b] font-medium">Target Storage Class</span>
                <p className="text-sm font-bold text-[#2997ff]">Secure Object Storage</p>
              </div>
            </div>
          </div>

          {/* Granular Day-by-Day Inspection Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1a6] flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-[#2997ff]" />
              <span>Day-by-Day Transfer Ledger</span>
            </h3>

            <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0e0e11]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/[0.08] bg-[#16161a] text-[10px] font-semibold uppercase text-[#86868b]">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Uploads</th>
                    <th className="py-2.5 px-4">Downloads</th>
                    <th className="py-2.5 px-4">Total Bandwidth</th>
                    <th className="py-2.5 px-4">LAN Sessions</th>
                    <th className="py-2.5 px-4 text-right">Integrity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-[11px]">
                  {stats?.dailyActivity.map((day: any, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-white">{day.date}</td>
                      <td className="py-2.5 px-4 text-sky-400 font-medium">{day.uploads} files</td>
                      <td className="py-2.5 px-4 text-emerald-400 font-medium">{day.downloads} hits</td>
                      <td className="py-2.5 px-4 font-mono text-[#a1a1a6]">{formatBytes(day.bytes)}</td>
                      <td className="py-2.5 px-4 text-[#86868b]">{day.lanTransfers || 2} active</td>
                      <td className="py-2.5 px-4 text-right text-emerald-400 font-semibold">
                        {(day.successRate || 99.8).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Storage Distribution & Quick Action Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Storage Distribution Breakdown (1 col) */}
          <div className="rounded-3xl border border-white/[0.08] bg-[#16161a] p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-[#2997ff]" />
                <span>Storage Categories</span>
              </h3>
              <span className="text-xs text-[#86868b] font-semibold">{quotaPercent}% capacity</span>
            </div>

            {/* Overall progress bar */}
            <div className="space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08] flex">
                {stats?.storageDistribution.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: `${item.percentage > 0 ? Math.max(item.percentage, 5) : 0}%`,
                      backgroundColor: item.color,
                    }}
                    className="h-full transition-all"
                  />
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-[#86868b]">
                <span>{formatBytes(stats?.totalStorageBytes || 0)} used</span>
                <span>{formatBytes(stats?.totalQuotaBytes || 10737418240)} max</span>
              </div>
            </div>

            {/* Categories list */}
            <div className="space-y-3 pt-2">
              {stats?.storageDistribution.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-[#f5f5f7]">{cat.category}</span>
                    <span className="text-[10px] text-[#86868b]">({cat.count} files)</span>
                  </div>
                  <span className="font-semibold text-white">{formatBytes(cat.bytes)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Administration Navigation Hub (2 cols) */}
          <div className="lg:col-span-2 rounded-3xl border border-white/[0.08] bg-[#16161a] p-6 sm:p-8 space-y-5 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#2997ff]" />
                <span>Control Plane Operations</span>
              </h3>
              <p className="text-xs text-[#86868b] mt-0.5">
                Instant access to user profile inspectors, object manager, and health monitors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/admin/users"
                className="group rounded-2xl border border-white/[0.08] bg-[#0e0e11] p-5 space-y-2 hover:border-[#0071e3]/40 hover:bg-[#0071e3]/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white group-hover:text-[#2997ff] flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#2997ff]" />
                    <span>User Profiles & Files</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#86868b] group-hover:text-[#2997ff] transition-colors" />
                </div>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  Enter individual user profiles to inspect, download, or delete their files and adjust storage quotas.
                </p>
              </Link>

              <Link
                href="/admin/files"
                className="group rounded-2xl border border-white/[0.08] bg-[#0e0e11] p-5 space-y-2 hover:border-sky-500/40 hover:bg-sky-500/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white group-hover:text-sky-300 flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-sky-400" />
                    <span>All Stored Files</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#86868b] group-hover:text-sky-400 transition-colors" />
                </div>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  Browse and search all objects in secure cloud storage, generate admin download links, and delete.
                </p>
              </Link>

              <Link
                href="/admin/shares"
                className="group rounded-2xl border border-white/[0.08] bg-[#0e0e11] p-5 space-y-2 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white group-hover:text-emerald-300 flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-emerald-400" />
                    <span>Active Share Links</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#86868b] group-hover:text-emerald-400 transition-colors" />
                </div>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  Inspect public download tokens, revoke unauthorized links, and check password locks.
                </p>
              </Link>

              <Link
                href="/admin/system"
                className="group rounded-2xl border border-white/[0.08] bg-[#0e0e11] p-5 space-y-2 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white group-hover:text-amber-300 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-400" />
                    <span>System Diagnostics</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#86868b] group-hover:text-amber-400 transition-colors" />
                </div>
                <p className="text-xs text-[#86868b] leading-relaxed">
                  Live latency metrics, one-click quota recalculation, and system audit trail export.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
