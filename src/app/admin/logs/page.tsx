"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminAuditLog } from "@/types";
import { formatRelativeTime, formatBytes } from "@/lib/utils";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Filter,
  Download,
  FileText,
  UploadCloud,
  Trash2,
  Share2,
  HardDrive,
  Laptop,
  Smartphone,
  Globe,
  Lock,
  Zap,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Eye,
  Check,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AdminAuditLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/logs");
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportLogsAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `neardrop_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Logs exported as JSON");
  };

  // Helper for action badge colors
  const getActionBadge = (action: string) => {
    if (action.includes("DELETE")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/15 px-2 py-0.5 text-[11px] font-bold text-rose-400 border border-rose-500/25">
          <Trash2 className="h-3 w-3" />
          {action}
        </span>
      );
    }
    if (action.includes("UPLOAD")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/25">
          <UploadCloud className="h-3 w-3" />
          {action}
        </span>
      );
    }
    if (action.includes("SHARE")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-sky-500/15 px-2 py-0.5 text-[11px] font-bold text-sky-400 border border-sky-500/25">
          <Share2 className="h-3 w-3" />
          {action}
        </span>
      );
    }
    if (action.includes("DOWNLOAD")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/15 px-2 py-0.5 text-[11px] font-bold text-purple-400 border border-purple-500/25">
          <Download className="h-3 w-3" />
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 px-2 py-0.5 text-[11px] font-bold text-zinc-300 border border-zinc-700">
        <Zap className="h-3 w-3" />
        {action}
      </span>
    );
  };

  // Helper for device & platform icon
  const getDeviceIcon = (deviceInfo?: string, platform?: string) => {
    const text = `${deviceInfo || ""} ${platform || ""}`.toLowerCase();
    if (text.includes("iphone") || text.includes("android") || text.includes("mobile")) {
      return <Smartphone className="h-3.5 w-3.5 text-amber-400" />;
    }
    if (text.includes("mac") || text.includes("windows") || text.includes("linux")) {
      return <Laptop className="h-3.5 w-3.5 text-sky-400" />;
    }
    return <Globe className="h-3.5 w-3.5 text-zinc-400" />;
  };

  // Helper for status badge
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "danger":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-3 w-3" />
            Critical
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
            <AlertTriangle className="h-3 w-3" />
            Warning / Deletion
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </span>
        );
    }
  };

  // Filtering
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.userEmail && log.userEmail.toLowerCase().includes(q)) ||
        (log.fileName && log.fileName.toLowerCase().includes(q)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(q)) ||
        (log.deviceInfo && log.deviceInfo.toLowerCase().includes(q));

      const matchStatus = statusFilter === "all" || log.status === statusFilter;

      let matchCat = true;
      if (categoryFilter === "upload") matchCat = log.action.includes("UPLOAD") || log.resourceType === "file";
      else if (categoryFilter === "delete") matchCat = log.action.includes("DELETE") || log.action.includes("REVOKE");
      else if (categoryFilter === "share") matchCat = log.resourceType === "share" || log.action.includes("SHARE");
      else if (categoryFilter === "download") matchCat = log.resourceType === "download" || log.action.includes("DOWNLOAD");
      else if (categoryFilter === "transfer") matchCat = log.resourceType === "transfer" || log.action.includes("TRANSFER");
      else if (categoryFilter === "billing") matchCat = log.resourceType === "billing" || log.action.includes("SUBSCRIPTION");

      return matchSearch && matchStatus && matchCat;
    });
  }, [logs, searchQuery, categoryFilter, statusFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Security & Audit Trail Logs</span>
              <span className="rounded-md bg-purple-500/15 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/30">
                {logs.length} Records
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Real-time audit log of file uploads, 2-step deletions, share creations, downloads, transfers, IP addresses, and client devices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportLogsAsJSON}
              className="gap-1.5 text-xs rounded-xl"
            >
              <Download className="h-3.5 w-3.5 text-sky-400" />
              <span>Export JSON</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
              className="gap-2 text-xs rounded-xl"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-zinc-800">
          {[
            { id: "all", label: "All Logs", count: logs.length },
            { id: "upload", label: "Uploads", count: logs.filter((l) => l.action.includes("UPLOAD")).length },
            { id: "delete", label: "Deletions & Revokes", count: logs.filter((l) => l.action.includes("DELETE")).length },
            { id: "share", label: "Shares", count: logs.filter((l) => l.resourceType === "share" || l.action.includes("SHARE")).length },
            { id: "download", label: "Downloads", count: logs.filter((l) => l.resourceType === "download" || l.action.includes("DOWNLOAD")).length },
            { id: "transfer", label: "Transfers", count: logs.filter((l) => l.resourceType === "transfer" || l.action.includes("TRANSFER")).length },
            { id: "billing", label: "Billing & POS", count: logs.filter((l) => l.resourceType === "billing").length },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl font-semibold transition-colors whitespace-nowrap ${
                categoryFilter === cat.id
                  ? "bg-zinc-800 text-white border-b-2 border-purple-500"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
              }`}
            >
              <span>{cat.label}</span>
              <span className="rounded-full bg-zinc-900 px-1.5 py-0.2 text-[10px] text-zinc-400">
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search filename, user email, IP address, device, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs bg-zinc-900/60 border-zinc-800 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Statuses" },
              { id: "success", label: "Success" },
              { id: "warning", label: "Warning / Delete" },
              { id: "danger", label: "Critical" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === st.id
                    ? "bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/20"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-2xl apple-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950/70 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target File</th>
                  <th className="py-3.5 px-4">Device & Browser</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-zinc-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-400 mb-2" />
                      Loading audit logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-zinc-500">
                      No matching audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-zinc-800/40 transition-colors cursor-pointer group"
                    >
                      {/* Timestamp */}
                      <td className="py-4 px-4 sm:px-6 text-zinc-400 whitespace-nowrap font-mono text-[11px]">
                        <div className="font-semibold text-zinc-300">
                          {new Date(log.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {formatRelativeTime(log.timestamp)}
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white">
                          {log.userEmail ? log.userEmail.split("@")[0] : "Anonymous / System"}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {log.userEmail || log.userId || "-"}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Target File */}
                      <td className="py-4 px-4 max-w-xs truncate">
                        {log.fileName ? (
                          <div className="space-y-0.5">
                            <div className="font-medium text-white truncate">{log.fileName}</div>
                            {log.fileSize ? (
                              <div className="text-[10px] text-zinc-400 font-mono">
                                {formatBytes(log.fileSize)}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-[11px]">-</span>
                        )}
                      </td>

                      {/* Device & Platform */}
                      <td className="py-4 px-4 whitespace-nowrap text-zinc-300 text-xs">
                        <div className="flex items-center gap-1.5">
                          {getDeviceIcon(log.deviceInfo, log.platform)}
                          <span className="font-medium">{log.deviceInfo || log.platform || "Web / Desktop"}</span>
                        </div>
                      </td>

                      {/* IP */}
                      <td className="py-4 px-4 whitespace-nowrap font-mono text-[11px] text-zinc-400">
                        <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          {log.ipAddress || "127.0.0.1"}
                        </span>
                      </td>

                      {/* Status & Inspector Button */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {getStatusBadge(log.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 w-7 p-0 rounded-lg text-zinc-400 group-hover:text-white"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Log Inspector Modal */}
        {selectedLog && (
          <Dialog
            open={Boolean(selectedLog)}
            onOpenChange={(open) => !open && setSelectedLog(null)}
            title="Audit Record Details"
            description={`Log ID: ${selectedLog.id}`}
          >
            <div className="space-y-4 pt-2 text-xs">
              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{selectedLog.action}</span>
                  {getStatusBadge(selectedLog.status)}
                </div>
                <p className="text-zinc-300 leading-relaxed">{selectedLog.details}</p>
              </div>

              {/* Grid Properties */}
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-1">
                  <span className="text-zinc-500 font-semibold block">User / Email</span>
                  <span className="text-white font-mono break-all">{selectedLog.userEmail || selectedLog.userId || "System"}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-1">
                  <span className="text-zinc-500 font-semibold block">Timestamp</span>
                  <span className="text-white font-mono">{new Date(selectedLog.timestamp).toLocaleString("en-US")}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-1">
                  <span className="text-zinc-500 font-semibold block">Device & Client</span>
                  <span className="text-sky-400 font-medium">{selectedLog.deviceInfo || selectedLog.platform || "Web"}</span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-1">
                  <span className="text-zinc-500 font-semibold block">IP Address</span>
                  <span className="text-purple-400 font-mono">{selectedLog.ipAddress || "127.0.0.1"}</span>
                </div>

                {selectedLog.fileName && (
                  <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/80 space-y-1 col-span-2">
                    <span className="text-zinc-500 font-semibold block">Target File & Size</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      {selectedLog.fileName} {selectedLog.fileSize ? `(${formatBytes(selectedLog.fileSize)})` : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Metadata JSON Viewer */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-zinc-400">Technical Metadata (JSON):</span>
                  <pre className="p-3 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-300 border border-zinc-800 overflow-x-auto max-h-40">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(JSON.stringify(selectedLog, null, 2), selectedLog.id)}
                  className="gap-1.5 text-xs rounded-xl"
                >
                  {copiedId === selectedLog.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy JSON</span>
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedLog(null)}
                  className="text-xs rounded-xl"
                >
                  Close
                </Button>
              </div>
            </div>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}
