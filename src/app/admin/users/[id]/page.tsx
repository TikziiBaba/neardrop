"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminUser, CloudFile, ShareLink } from "@/types";
import { formatBytes, formatRelativeTime, formatExpiresIn, getFileCategory } from "@/lib/utils";
import {
  Users,
  ArrowLeft,
  HardDrive,
  FolderOpen,
  Share2,
  Download,
  Trash2,
  Lock,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  Monitor,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  FileText,
  FileArchive,
  FileCode,
  FileImage,
  FileVideo,
  FileAudio,
  AlertTriangle,
  Save,
  Globe,
  Wifi,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function UserDetailPage() {
  const params = useParams();
  const userId = params?.id as string;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [shares, setShares] = useState<ShareLink[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"files" | "shares" | "devices">("files");

  // File action modals
  const [selectedFileForDelete, setSelectedFileForDelete] = useState<CloudFile | null>(null);
  const [downloadLinkModal, setDownloadLinkModal] = useState<{ url: string; filename: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  // Quota editor
  const [newQuotaGb, setNewQuotaGb] = useState<number>(10);
  const [isSavingQuota, setIsSavingQuota] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setFiles(data.files || []);
        setShares(data.shares || []);
        setDevices(data.devices || []);
        if (data.user?.quotaBytes) {
          setNewQuotaGb(Math.round(data.user.quotaBytes / (1024 * 1024 * 1024)) || 10);
        }
      } else {
        toast.error(data.error || "Failed to load user profile");
      }
    } catch (err: any) {
      console.error("User fetch error:", err);
      toast.error(err.message || "Failed to fetch user");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const renderFileIcon = (file: CloudFile) => {
    const cat = getFileCategory(file.mimeType, file.filename);
    switch (cat) {
      case "archive":
        return <FileArchive className="h-4 w-4 text-amber-400" />;
      case "image":
        return <FileImage className="h-4 w-4 text-emerald-400" />;
      case "video":
        return <FileVideo className="h-4 w-4 text-purple-400" />;
      case "audio":
        return <FileAudio className="h-4 w-4 text-pink-400" />;
      case "code":
        return <FileCode className="h-4 w-4 text-cyan-400" />;
      default:
        return <FileText className="h-4 w-4 text-sky-400" />;
    }
  };

  const renderDeviceIcon = (platform: string, deviceType: string) => {
    if (deviceType === "mobile" || platform === "ios" || platform === "android") {
      return <Smartphone className="h-5 w-5 text-emerald-400" />;
    }
    if (deviceType === "tablet") {
      return <Tablet className="h-5 w-5 text-sky-400" />;
    }
    if (platform === "macos") {
      return <Laptop className="h-5 w-5 text-purple-400" />;
    }
    return <Monitor className="h-5 w-5 text-purple-400" />;
  };

  const handleGenerateDownload = async (file: CloudFile) => {
    try {
      const res = await fetch("/api/admin/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ r2ObjectKey: file.r2ObjectKey, filename: file.filename }),
      });
      const data = await res.json();
      if (data.success && data.downloadUrl) {
        setDownloadLinkModal({ url: data.downloadUrl, filename: file.filename });
      } else {
        toast.error("Failed to generate download link");
      }
    } catch (err) {
      toast.error("Failed to generate download link");
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFileForDelete) return;
    setIsDeletingFile(true);
    try {
      const res = await fetch(`/api/admin/files?fileId=${selectedFileForDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Deleted ${selectedFileForDelete.filename} from R2`);
        setFiles((prev) => prev.filter((f) => f.id !== selectedFileForDelete.id));
        if (user) {
          setUser({
            ...user,
            usedBytes: Math.max(0, user.usedBytes - selectedFileForDelete.size),
            filesCount: Math.max(0, user.filesCount - 1),
          });
        }
        setSelectedFileForDelete(null);
      } else {
        toast.error(data.error || "Failed to delete file");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete file");
    } finally {
      setIsDeletingFile(false);
    }
  };

  const handleToggleShare = async (share: ShareLink) => {
    try {
      const nextActive = !share.isActive;
      const res = await fetch("/api/admin/shares", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shareId: share.id, isActive: nextActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Share link ${nextActive ? "activated" : "revoked"}`);
        setShares((prev) =>
          prev.map((s) => (s.id === share.id ? { ...s, isActive: nextActive } : s))
        );
      }
    } catch (err) {
      toast.error("Failed to update share link");
    }
  };

  const handleSaveQuota = async () => {
    if (!user) return;
    setIsSavingQuota(true);
    try {
      const quotaBytes = newQuotaGb * 1024 * 1024 * 1024;
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotaBytes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Quota updated to ${newQuotaGb} GB`);
        setUser({ ...user, quotaBytes });
      } else {
        toast.error(data.error || "Failed to update quota");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update quota");
    } finally {
      setIsSavingQuota(false);
    }
  };

  const handleDisconnectDevice = async (deviceId: string) => {
    try {
      const res = await fetch(`/api/auth/device?id=${deviceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Device disconnected successfully");
        setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      } else {
        toast.error(data.error || "Failed to disconnect device");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to disconnect device");
    }
  };

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    toast.success(`Copied IP: ${ip}`);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-400" />
          <p className="text-sm font-semibold text-zinc-300">Loading user profile, devices & files...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-12 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">User Not Found</h2>
          <p className="text-xs text-zinc-400">The requested user profile does not exist in the database.</p>
          <Link href="/admin/users">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to User List</span>
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const usagePercent = Math.min(100, Math.round((user.usedBytes / (user.quotaBytes || 1)) * 100));

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Navigation Breadcrumb & Back button */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Users</span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchUserData}
            className="gap-2 text-xs rounded-xl"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync Profile</span>
          </Button>
        </div>

        {/* User Hero Identity Card */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6 apple-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Identity */}
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={
                  user.avatarUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                }
                alt={user.displayName}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover ring-2 ring-purple-500/40 flex-shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight truncate">
                    {user.displayName}
                  </h1>
                  {user.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-400 border border-purple-500/20">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Administrator
                    </span>
                  ) : (
                    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                      Standard User
                    </span>
                  )}
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                    Active Account
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono truncate">{user.email}</p>
                <p className="text-[11px] text-zinc-500">
                  User ID: <span className="font-mono text-zinc-400">{user.id}</span> • Joined {formatRelativeTime(user.createdAt)}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 border-t sm:border-t-0 sm:border-l border-zinc-800 pt-4 sm:pt-0 sm:pl-6 text-center sm:text-left">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Files</span>
                <p className="text-lg font-bold text-white">{files.length}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Shares</span>
                <p className="text-lg font-bold text-emerald-400">{shares.length}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Devices</span>
                <p className="text-lg font-bold text-sky-400">{devices.length || 1}</p>
              </div>
            </div>
          </div>

          {/* Storage Quota Progress & Quick Adjuster */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold text-white">Storage Utilization</span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  ({formatBytes(user.usedBytes)} of {formatBytes(user.quotaBytes)})
                </span>
              </div>
              <span className="text-xs font-bold text-purple-400">{usagePercent}% Used</span>
            </div>

            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                style={{ width: `${usagePercent}%` }}
                className={`h-full rounded-full transition-all ${
                  usagePercent > 85 ? "bg-rose-500" : "bg-gradient-to-r from-sky-400 to-purple-500"
                }`}
              />
            </div>

            {/* In-place Quick Quota Adjuster */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-zinc-400 font-medium mr-1">Assign Quota:</span>
                {[10, 25, 50, 100, 250, 500].map((gb) => (
                  <button
                    key={gb}
                    type="button"
                    onClick={() => setNewQuotaGb(gb)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      newQuotaGb === gb
                        ? "bg-purple-600 text-white shadow-sm"
                        : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                    }`}
                  >
                    {gb} GB
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={5000}
                  value={newQuotaGb}
                  onChange={(e) => setNewQuotaGb(Number(e.target.value))}
                  className="h-8 w-24 text-xs bg-zinc-900 text-white rounded-xl"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveQuota}
                  disabled={isSavingQuota}
                  className="h-8 text-xs bg-purple-600 hover:bg-purple-500 gap-1 rounded-xl"
                >
                  <Save className="h-3 w-3" />
                  <span>{isSavingQuota ? "Updating..." : "Save Quota"}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* User Content Tabs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
            {[
              { id: "files", label: `User's Files (${files.length})`, icon: FolderOpen },
              { id: "shares", label: `Active Share Links (${shares.length})`, icon: Share2 },
              { id: "devices", label: `Connected Devices & IP (${devices.length || 1})`, icon: Laptop },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: User's Files */}
          {activeTab === "files" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-zinc-400">
                  All objects stored in Cloudflare R2 by this account. You can generate admin download links or permanently purge objects.
                </p>
              </div>

              {files.length === 0 ? (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-12 text-center space-y-2">
                  <FolderOpen className="h-8 w-8 text-zinc-600 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-300">No Files Uploaded</p>
                  <p className="text-xs text-zinc-500">This user has not stored any files in Cloudflare R2 yet.</p>
                </div>
              ) : (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        <tr>
                          <th className="py-3.5 px-4 sm:px-6">Filename</th>
                          <th className="py-3.5 px-4">Size</th>
                          <th className="py-3.5 px-4">MIME Type</th>
                          <th className="py-3.5 px-4">Uploaded</th>
                          <th className="py-3.5 px-4">Downloads</th>
                          <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {files.map((file) => (
                          <tr key={file.id} className="hover:bg-zinc-800/40 transition-colors group">
                            <td className="py-4 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700/60 flex-shrink-0">
                                  {renderFileIcon(file)}
                                </div>
                                <div className="min-w-0 max-w-[240px]">
                                  <p className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                                    {file.filename}
                                  </p>
                                  <p className="font-mono text-[10px] text-zinc-500 truncate">
                                    {file.r2ObjectKey}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 font-semibold text-zinc-200 whitespace-nowrap">
                              {formatBytes(file.size)}
                            </td>

                            <td className="py-4 px-4">
                              <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                                {file.mimeType}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-[11px] text-zinc-400 whitespace-nowrap">
                              {formatRelativeTime(file.createdAt)}
                            </td>

                            <td className="py-4 px-4 text-zinc-300">
                              {file.downloadsCount || 0} hits
                            </td>

                            <td className="py-4 px-4 sm:px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleGenerateDownload(file)}
                                  className="text-xs h-8 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 gap-1 rounded-lg"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Download</span>
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedFileForDelete(file)}
                                  className="h-8 w-8 p-0 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
                                  title="Delete from R2"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: User's Shares */}
          {activeTab === "shares" && (
            <div className="space-y-4">
              {shares.length === 0 ? (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-12 text-center space-y-2">
                  <Share2 className="h-8 w-8 text-zinc-600 mx-auto" />
                  <p className="text-sm font-semibold text-zinc-300">No Share Links</p>
                  <p className="text-xs text-zinc-500">This user has not generated any share links yet.</p>
                </div>
              ) : (
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-semibold uppercase text-zinc-400">
                        <tr>
                          <th className="py-3 px-4 sm:px-6">Share Token</th>
                          <th className="py-3 px-4">Target File</th>
                          <th className="py-3 px-4">Security</th>
                          <th className="py-3 px-4">Downloads</th>
                          <th className="py-3 px-4">Expires</th>
                          <th className="py-3 px-4 sm:px-6 text-right">Status / Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60">
                        {shares.map((share) => (
                          <tr key={share.id} className="hover:bg-zinc-800/40 transition-colors">
                            <td className="py-3.5 px-4 sm:px-6 font-mono text-purple-400 font-semibold">
                              /s/{share.token}
                            </td>
                            <td className="py-3.5 px-4 font-medium text-white">
                              {share.cloudFile?.filename || "Deleted file"}
                            </td>
                            <td className="py-3.5 px-4">
                              {share.passwordProtected ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400 border border-amber-500/20 font-semibold">
                                  <Lock className="h-3 w-3" /> Locked
                                </span>
                              ) : (
                                <span className="text-zinc-500">Public</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-zinc-200">
                              {share.downloadCount} downloads
                            </td>
                            <td className="py-3.5 px-4 text-zinc-400">
                              {formatExpiresIn(share.expiresAt)}
                            </td>
                            <td className="py-3.5 px-4 sm:px-6 text-right">
                              <button
                                onClick={() => handleToggleShare(share)}
                                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                                  share.isActive
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-emerald-500/10 hover:text-emerald-400"
                                }`}
                              >
                                {share.isActive ? "Active (Revoke)" : "Revoked (Restore)"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Connected Devices & IP Addresses */}
          {activeTab === "devices" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-zinc-400">
                  Registered client hardware, browsers, and network IP addresses used by this user to access NearDrop.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.length === 0 ? (
                  <div className="col-span-2 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-10 text-center space-y-3">
                    <Laptop className="h-10 w-10 text-purple-400 mx-auto opacity-70" />
                    <div>
                      <h4 className="text-sm font-semibold text-white">Active Web Session</h4>
                      <p className="text-xs text-zinc-400 mt-1">
                        Current IP: <span className="font-mono text-purple-300">127.0.0.1</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  devices.map((device: any) => {
                    const devIp = device.ip_address || "127.0.0.1";
                    return (
                      <div
                        key={device.id}
                        className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4 hover:border-purple-500/30 transition-all apple-card"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 flex-shrink-0">
                              {renderDeviceIcon(device.platform, device.device_type)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                                {device.device_name || "Client Device"}
                              </h4>
                              <p className="text-[11px] text-zinc-400 capitalize">
                                {device.platform} • {device.device_type}
                              </p>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                            <Radio className="h-2.5 w-2.5 animate-pulse" />
                            Connected
                          </span>
                        </div>

                        {/* Network & IP Details */}
                        <div className="rounded-2xl bg-zinc-950/60 border border-zinc-800/80 p-3.5 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                              <Globe className="h-3.5 w-3.5 text-sky-400" />
                              <span>IP Address</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <code className="font-mono text-[11px] text-purple-300 font-semibold">
                                {devIp}
                              </code>
                              <button
                                onClick={() => handleCopyIp(devIp)}
                                title="Copy IP"
                                className="p-1 rounded text-zinc-500 hover:text-white"
                              >
                                {copiedIp === devIp ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800/60">
                            <span className="text-[11px] text-zinc-400">Device ID</span>
                            <span className="font-mono text-[10px] text-zinc-400 truncate max-w-[170px]">
                              {device.device_id}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1.5 border-t border-zinc-800/60">
                            <span className="text-[11px] text-zinc-400">Last Seen</span>
                            <span className="text-[11px] text-zinc-300">
                              {formatRelativeTime(device.last_seen || device.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* Action: Disconnect device */}
                        <div className="flex justify-end pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDisconnectDevice(device.id)}
                            className="text-[11px] h-7 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Disconnect Device</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Download Presigned URL Modal */}
      <Dialog
        open={Boolean(downloadLinkModal)}
        onOpenChange={(open) => !open && setDownloadLinkModal(null)}
      >
        <DialogContent className="max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Download className="h-4 w-4 text-sky-400" />
              <span>Admin Presigned Download Link</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-1">
            <p className="text-xs text-zinc-400">
              Generated direct R2 signed URL for <strong className="text-white">{downloadLinkModal?.filename}</strong> (Valid for 60 minutes).
            </p>

            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={downloadLinkModal?.url || ""}
                className="bg-zinc-900 font-mono text-[11px] text-zinc-300 rounded-xl"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (downloadLinkModal) {
                    navigator.clipboard.writeText(downloadLinkModal.url);
                    setCopiedLink(true);
                    toast.success("URL copied to clipboard!");
                    setTimeout(() => setCopiedLink(false), 2000);
                  }
                }}
                className="gap-1.5 h-10 flex-shrink-0 rounded-xl"
              >
                {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setDownloadLinkModal(null)}>
              Close
            </Button>
            <a
              href={downloadLinkModal?.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-500 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open & Download</span>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(selectedFileForDelete)}
        onOpenChange={(open) => !open && setSelectedFileForDelete(null)}
      >
        <DialogContent className="max-w-md rounded-3xl border border-rose-500/30 bg-zinc-950 p-6 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Confirm Delete Object</span>
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-zinc-300">
            Are you sure you want to permanently delete <strong className="text-white">{selectedFileForDelete?.filename}</strong>? This will purge the object from Cloudflare R2 bucket and recalculate the user&apos;s used storage quota.
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setSelectedFileForDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteFile}
              disabled={isDeletingFile}
              className="text-xs rounded-xl"
            >
              {isDeletingFile ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
