"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useStorage } from "@/lib/storage/store";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import {
  BarChart3,
  Download,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ArrowLeft,
  Clock,
  HardDrive,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  Activity,
  Calendar,
  Lock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AnalyticsData {
  totalDownloads: number;
  totalBandwidth: number;
  dailyDownloads: { date: string; count: number }[];
  byCountry: { name: string; count: number }[];
  byBrowser: { name: string; count: number }[];
  byOS: { name: string; count: number }[];
  byDevice: { name: string; count: number }[];
  byReferrer: { name: string; count: number }[];
  recentEvents: {
    id: string;
    country: string;
    city: string;
    browser: string;
    os: string;
    deviceType: string;
    referrer: string;
    createdAt: string;
  }[];
}

export default function ShareAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params?.id as string;
  const { shares, files } = useStorage();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const share = shares.find((s) => s.id === shareId);
  const file = share?.cloudFileId ? files.find((f) => f.id === share.cloudFileId) : null;
  const isFolder = Boolean(share?.folderPath || share?.isFolder);
  const displayName = isFolder
    ? share?.title || share?.folderPath?.split("/").pop() || "Shared Folder"
    : file?.filename || "Shared Object";

  useEffect(() => {
    async function loadAnalytics() {
      if (!shareId) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/analytics?shareId=${shareId}&days=30`);
        if (!res.ok) {
          throw new Error("Failed to load analytics data");
        }
        const data = await res.json();
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, [shareId]);

  const maxDaily = Math.max(
    ...(analytics?.dailyDownloads.map((d) => d.count) || [1]),
    1
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Back navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/shared">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-white">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="page-title-sm truncate max-w-md">
                  {displayName}
                </h1>
                {share && (
                  <Badge variant={share.isActive ? "success" : "secondary"} className="text-[10px]">
                    {share.isActive ? "Active" : "Revoked"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Detailed access insights, geo-distribution, and client device breakdown.
              </p>
            </div>
          </div>

          {share && (
            <div className="flex items-center gap-2">
              <a
                href={`/s/${share.token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-surface border border-border text-accent-text hover:text-accent-text transition-colors"
              >
                <span>Open Public Page</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="h-8 w-8 text-accent-text animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground">Loading download analytics...</p>
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="p-6 rounded-2xl border border-danger/30 bg-danger/10 text-center space-y-2">
            <p className="text-sm font-semibold text-danger">{error}</p>
            <Button variant="outline" size="sm" onClick={() => router.refresh()}>
              Retry
            </Button>
          </div>
        )}

        {/* Analytics Content */}
        {!isLoading && analytics && (
          <div className="space-y-6">
            {/* Top 3 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="liquid-glass-elevated rounded-2xl p-5 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Downloads</span>
                  <Download className="h-4 w-4 text-accent-text" />
                </div>
                <p className="text-3xl font-extrabold text-white">
                  {analytics.totalDownloads}
                </p>
                <p className="text-[10px] text-subtle">
                  {share?.maxDownloads ? `Limit: ${share.maxDownloads} downloads` : "Unlimited limit"}
                </p>
              </div>

              <div className="liquid-glass-elevated rounded-2xl p-5 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Bandwidth Delivered</span>
                  <HardDrive className="h-4 w-4 text-success" />
                </div>
                <p className="text-3xl font-extrabold text-white">
                  {formatBytes(analytics.totalBandwidth)}
                </p>
                <p className="text-[10px] text-subtle">
                  Direct encrypted cloud egress
                </p>
              </div>

              <div className="liquid-glass-elevated rounded-2xl p-5 space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Unique Countries</span>
                  <Globe className="h-4 w-4 text-accent-text" />
                </div>
                <p className="text-3xl font-extrabold text-white">
                  {analytics.byCountry.length}
                </p>
                <p className="text-[10px] text-subtle">
                  Global CDN points of access
                </p>
              </div>
            </div>

            {/* Daily Download Activity Timeline */}
            <div className="liquid-glass-elevated rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="h-4 w-4 text-accent-text" />
                    <span>Daily Downloads (Last 30 Days)</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Volume distribution of access requests</p>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  30 Days
                </Badge>
              </div>

              {analytics.dailyDownloads.length === 0 ? (
                <div className="py-12 text-center text-xs text-subtle">
                  No download events recorded in the last 30 days.
                </div>
              ) : (
                <div className="flex items-end gap-1.5 h-36 pt-6 px-2">
                  {analytics.dailyDownloads.map((d) => {
                    const heightPct = Math.max(10, Math.round((d.count / maxDaily) * 100));
                    return (
                      <div
                        key={d.date}
                        className="flex-1 flex flex-col items-center gap-1 group h-full justify-end"
                      >
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full rounded-t-xl bg-gradient-to-t from-accent to-accent-text group-hover:from-accent group-hover:to-accent-text transition-all cursor-pointer relative"
                          title={`${d.date}: ${d.count} downloads`}
                        />
                        <span className="text-[8px] text-subtle font-mono rotate-45 sm:rotate-0 mt-1">
                          {d.date.slice(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Geo & Platform Breakdown Bento */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Country breakdown */}
              <div className="liquid-glass-elevated rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="h-4 w-4 text-success" />
                  <span>Top Countries</span>
                </h3>
                {analytics.byCountry.length === 0 ? (
                  <p className="text-xs text-subtle">No geo data yet</p>
                ) : (
                  <div className="space-y-2.5">
                    {analytics.byCountry.slice(0, 6).map((c) => {
                      const pct = Math.round((c.count / analytics.totalDownloads) * 100);
                      return (
                        <div key={c.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground/80 font-medium">{c.name}</span>
                            <span className="text-muted-foreground font-mono">{c.count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-surface-secondary rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full bg-success rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Browser breakdown */}
              <div className="liquid-glass-elevated rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-accent-text" />
                  <span>Browsers</span>
                </h3>
                {analytics.byBrowser.length === 0 ? (
                  <p className="text-xs text-subtle">No browser data yet</p>
                ) : (
                  <div className="space-y-2.5">
                    {analytics.byBrowser.slice(0, 6).map((b) => {
                      const pct = Math.round((b.count / analytics.totalDownloads) * 100);
                      return (
                        <div key={b.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground/80 font-medium">{b.name}</span>
                            <span className="text-muted-foreground font-mono">{b.count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-surface-secondary rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full bg-accent rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Device breakdown */}
              <div className="liquid-glass-elevated rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-accent-text" />
                  <span>Device Types</span>
                </h3>
                {analytics.byDevice.length === 0 ? (
                  <p className="text-xs text-subtle">No device data yet</p>
                ) : (
                  <div className="space-y-2.5">
                    {analytics.byDevice.map((d) => {
                      const pct = Math.round((d.count / analytics.totalDownloads) * 100);
                      return (
                        <div key={d.name} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-foreground/80 font-medium capitalize">{d.name}</span>
                            <span className="text-muted-foreground font-mono">{d.count} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-surface-secondary rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full bg-accent rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Download Events Table */}
            <div className="liquid-glass-elevated rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warning" />
                  <span>Recent Download Log</span>
                </h3>
                <span className="text-xs text-subtle font-mono">
                  Showing latest {analytics.recentEvents.length} events
                </span>
              </div>

              {analytics.recentEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-subtle">
                  No downloads recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border text-subtle font-semibold">
                        <th className="pb-3 pl-2">Time</th>
                        <th className="pb-3">Location</th>
                        <th className="pb-3">Browser / OS</th>
                        <th className="pb-3">Device</th>
                        <th className="pb-3 pr-2">Referrer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-mono">
                      {analytics.recentEvents.map((evt) => (
                        <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 pl-2 text-muted-foreground">
                            {formatRelativeTime(evt.createdAt)}
                          </td>
                          <td className="py-3 text-foreground/80">
                            {evt.city ? `${evt.city}, ` : ""}{evt.country || "Unknown"}
                          </td>
                          <td className="py-3 text-foreground/80">
                            {evt.browser || "Unknown"} on {evt.os || "Unknown"}
                          </td>
                          <td className="py-3">
                            <span className="capitalize text-muted-foreground bg-surface-secondary/80 px-2 py-0.5 rounded-full text-[10px]">
                              {evt.deviceType || "desktop"}
                            </span>
                          </td>
                          <td className="py-3 pr-2 text-subtle truncate max-w-xs">
                            {evt.referrer || "Direct"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
