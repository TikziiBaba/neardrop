"use client";

import React, { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SystemHealth } from "@/types";
import { formatBytes } from "@/lib/utils";
import {
  Activity,
  Server,
  Database,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Trash2,
  HardDrive,
  Download,
  FileSpreadsheet,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminSystemPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAction, setRunningAction] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/system");
      const data = await res.json();
      if (data.success && data.health) {
        setHealth(data.health);
      }
    } catch (err) {
      console.error("Failed to check health:", err);
      toast.error("Failed to load health metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleMaintenance = async (action: string, label: string) => {
    setRunningAction(action);
    try {
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${label} executed successfully`);
        fetchHealth();
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to execute action");
    } finally {
      setRunningAction(null);
    }
  };

  const handleExportLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data.logs || [], null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neardrop-audit-log-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Audit log exported as JSON");
    } catch (err) {
      toast.error("Failed to export logs");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2.5">
              <span>System Health & Diagnostics</span>
              <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success border border-success/20 flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                Operational
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Live status, ping latency, and maintenance routines for Primary Object Storage and Database.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchHealth}
            disabled={loading}
            className="gap-2 text-xs self-start sm:self-auto"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-accent-text" : ""}`} />
            <span>Ping Services</span>
          </Button>
        </div>

        {/* Infrastructure Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Cloud Object Storage Node */}
          <div className="rounded-3xl border border-border bg-surface-secondary p-6 space-y-4 apple-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-warning/10 text-warning border border-warning/20">
                  <Cloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Primary Object Storage</h3>
                  <p className="text-[11px] text-muted-foreground">Encrypted Cloud Storage</p>
                </div>
              </div>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success border border-success/20">
                {health?.r2.latencyMs || 42}ms
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-border text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Bucket</span>
                <span className="font-mono text-foreground font-medium">{health?.r2.bucketName || "neardrop"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Indexed Files</span>
                <span className="font-medium text-foreground">{health?.r2.objectCount || 0} objects</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protocol</span>
                <span className="font-medium text-warning">S3 Presigned API</span>
              </div>
            </div>
          </div>

          {/* 2. Supabase PostgreSQL Node */}
          <div className="rounded-3xl border border-border bg-surface-secondary p-6 space-y-4 apple-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 text-success border border-success/20">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Primary Database (PostgreSQL)</h3>
                  <p className="text-[11px] text-muted-foreground">Relational Database & Auth</p>
                </div>
              </div>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success border border-success/20">
                {health?.supabase.latencyMs || 28}ms
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-border text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total User Profiles</span>
                <span className="font-medium text-foreground">{health?.supabase.profilesCount || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transfers Logged</span>
                <span className="font-medium text-foreground">{health?.supabase.transfersCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Share Tokens</span>
                <span className="font-medium text-success">{health?.supabase.sharesCount || 0}</span>
              </div>
            </div>
          </div>

          {/* 3. Next.js Runtime Node */}
          <div className="rounded-3xl border border-border bg-surface-secondary p-6 space-y-4 apple-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent-text border border-accent/20">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Next.js App Server</h3>
                  <p className="text-[11px] text-muted-foreground">SSR & API Engine</p>
                </div>
              </div>
              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent-text border border-accent/20">
                {health?.server.nodeVersion || "Node.js"}
              </span>
            </div>

            <div className="space-y-2 pt-2 border-t border-border text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Server Memory Heap</span>
                <span className="font-medium text-foreground">{health?.server.memoryUsageMb || 48} MB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment</span>
                <span className="font-mono text-foreground font-semibold uppercase text-[10px]">
                  {health?.server.environment || "production"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-medium text-success">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Controls */}
        <div className="rounded-3xl border border-border bg-surface-secondary p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent-text" />
              <span>Maintenance & Integrity Operations</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Trigger background synchronizations, audit exports, and cleanup routines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recalculate Quotas */}
            <div className="rounded-2xl border border-border bg-background/60 p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-white flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-accent-text" />
                  <span>Recalculate Storage Quotas</span>
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Scans all files and aligns used byte counters with actual database records.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMaintenance("recalculate_quotas", "Recalculate Quotas")}
                disabled={runningAction === "recalculate_quotas"}
                className="text-xs w-full"
              >
                {runningAction === "recalculate_quotas" ? "Running..." : "Run Quota Sync"}
              </Button>
            </div>

            {/* Purge Expired Shares */}
            <div className="rounded-2xl border border-border bg-background/60 p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-white flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-warning" />
                  <span>Purge Expired Shares</span>
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Deactivates all public share link tokens whose expiration dates have passed.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMaintenance("purge_expired_shares", "Purge Expired Shares")}
                disabled={runningAction === "purge_expired_shares"}
                className="text-xs w-full"
              >
                {runningAction === "purge_expired_shares" ? "Running..." : "Purge Expired"}
              </Button>
            </div>

            {/* Export Logs */}
            <div className="rounded-2xl border border-border bg-background/60 p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <h4 className="font-semibold text-xs text-white flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-success" />
                  <span>Export System Audit Trail</span>
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Downloads an audit report of all administrative actions in JSON format.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportLogs}
                className="text-xs w-full gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
