"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AdminUser, CloudFile, ShareLink, UserRole, SubscriptionTier } from "@/types";
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
  Zap,
  UserCheck,
  Ban,
  Activity,
  Edit3,
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

  // Account Control State
  const [editRole, setEditRole] = useState<UserRole>("member");
  const [editTier, setEditTier] = useState<SubscriptionTier>("free");
  const [editStatus, setEditStatus] = useState<"active" | "suspended" | "banned">("active");
  const [editDisplayName, setEditDisplayName] = useState<string>("");
  const [editQuotaGb, setEditQuotaGb] = useState<number>(10);
  const [editNotes, setEditNotes] = useState<string>("");
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // File action modals
  const [selectedFileForDelete, setSelectedFileForDelete] = useState<CloudFile | null>(null);
  const [downloadLinkModal, setDownloadLinkModal] = useState<{ url: string; filename: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setFiles(data.files || []);
        setShares(data.shares || []);
        setDevices(data.devices || []);

        setEditRole(data.user.role || "member");
        setEditTier(data.user.subscriptionTier || "free");
        setEditStatus((data.user.status as any) || "active");
        setEditDisplayName(data.user.displayName || "");
        setEditQuotaGb(Math.round(data.user.quotaBytes / (1024 * 1024 * 1024)) || 10);
        setEditNotes(data.user.notes || "");
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

  const handleSaveAccountChanges = async () => {
    if (!user) return;
    setIsSavingAccount(true);
    try {
      const quotaBytes = editQuotaGb * 1024 * 1024 * 1024;
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: editDisplayName,
          role: editRole,
          subscriptionTier: editTier,
          quotaBytes,
          status: editStatus,
          notes: editNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User account and permissions updated successfully!");
        setUser({
          ...user,
          displayName: editDisplayName,
          role: editRole,
          subscriptionTier: editTier,
          quotaBytes,
          status: editStatus,
          notes: editNotes,
        });
      } else {
        toast.error(data.error || "Failed to update account");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update account");
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleGetDownloadLink = async (file: CloudFile) => {
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

  const handleDisconnectDevice = async (deviceRecordId: string) => {
    try {
      const res = await fetch(`/api/auth/device?id=${deviceRecordId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Device disconnected");
        setDevices((prev) => prev.filter((d) => d.id !== deviceRecordId));
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

  const renderFileIcon = (file: CloudFile) => {
    const cat = getFileCategory(file.mimeType, file.filename);
    switch (cat) {
      case "archive":
        return <FileArchive className="h-4 w-4 text-warning" />;
      case "image":
        return <FileImage className="h-4 w-4 text-success" />;
      case "video":
        return <FileVideo className="h-4 w-4 text-file-video" />;
      case "audio":
        return <FileAudio className="h-4 w-4 text-file-audio" />;
      case "code":
        return <FileCode className="h-4 w-4 text-accent-text" />;
      default:
        return <FileText className="h-4 w-4 text-accent-text" />;
    }
  };

  const renderDeviceIcon = (platform: string, deviceType: string) => {
    if (deviceType === "mobile" || platform === "ios" || platform === "android") {
      return <Smartphone className="h-5 w-5 text-success" />;
    }
    if (deviceType === "tablet") {
      return <Tablet className="h-5 w-5 text-accent-text" />;
    }
    return <Laptop className="h-5 w-5 text-accent-text" />;
  };

  if (loading && !user) {
    return (
      <AdminLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-accent-text" />
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="p-8 text-center space-y-4">
          <p className="text-muted-foreground">User account not found.</p>
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              Return to Users
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
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-3.5 py-1.5 text-xs font-semibold text-foreground/80 hover:text-white hover:bg-surface-secondary transition-colors shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Directory</span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchUserData}
            className="gap-2 text-xs rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-accent-text" : ""}`} />
            <span>Sync Live Data</span>
          </Button>
        </div>

        {/* User Hero Identity Card */}
        <div className="rounded-3xl border border-border bg-surface/60 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Identity with Smart Avatar */}
            <div className="flex items-center gap-5 min-w-0">
              <UserAvatar
                user={user}
                size="2xl"
                showStatusDot={true}
                className="ring-4 ring-accent/30 shadow-2xl"
              />
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="page-title-sm truncate">
                    {user.displayName}
                  </h1>

                  {/* Role Badge */}
                  {user.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold text-accent-text border border-accent/30">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Administrator
                    </span>
                  ) : user.role === "moderator" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent-text border border-accent/20">
                      Moderator / Support
                    </span>
                  ) : user.role === "premium" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold text-success border border-success/20">
                      <Zap className="h-3.5 w-3.5" />
                      Premium Member
                    </span>
                  ) : (
                    <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border-strong">
                      Standard Member
                    </span>
                  )}

                  {/* Status Badge */}
                  <span
                    className={`rounded-xl px-2.5 py-0.5 text-xs font-semibold border ${
                      user.status === "banned"
                        ? "bg-danger/10 text-danger border-danger/20"
                        : user.status === "suspended"
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-success/10 text-success border-success/20"
                    }`}
                  >
                    {user.status?.toUpperCase() || "ACTIVE"}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground font-mono truncate">{user.email}</p>

                {/* IP & Telemetry Line */}
                <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground flex-wrap">
                  <div className="flex items-center gap-1.5 bg-background/80 px-2.5 py-1 rounded-xl border border-border font-mono text-accent-text">
                    <Wifi className="h-3.5 w-3.5 text-accent-text" />
                    <span>{user.lastIpAddress || "127.0.0.1"}</span>
                    <button
                      onClick={() => handleCopyIp(user.lastIpAddress || "127.0.0.1")}
                      title="Copy IP Address"
                      className="text-subtle hover:text-white ml-1"
                    >
                      {copiedIp === (user.lastIpAddress || "127.0.0.1") ? (
                        <Check className="h-3 w-3 text-success" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>

                  <span className="text-[11px] text-subtle">
                    Client: <strong className="text-foreground/80">{user.lastDevice || "Desktop Web"}</strong> ({user.lastBrowser || "Chrome"})
                  </span>
                  <span className="text-[11px] text-subtle">• Joined {formatRelativeTime(user.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6 text-center lg:text-left w-full lg:w-auto">
              <div className="space-y-0.5">
                <span className="text-[10px] text-subtle font-semibold uppercase">Cloud Files</span>
                <p className="text-lg font-bold text-white flex items-center justify-center lg:justify-start gap-1.5">
                  <FolderOpen className="h-4 w-4 text-accent-text" />
                  <span>{files.length}</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-subtle font-semibold uppercase">Active Shares</span>
                <p className="text-lg font-bold text-white flex items-center justify-center lg:justify-start gap-1.5">
                  <Share2 className="h-4 w-4 text-success" />
                  <span>{shares.length}</span>
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-subtle font-semibold uppercase">Devices</span>
                <p className="text-lg font-bold text-white flex items-center justify-center lg:justify-start gap-1.5">
                  <Laptop className="h-4 w-4 text-accent-text" />
                  <span>{devices.length}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Account Controls & Permissions Card */}
        <div className="rounded-3xl border border-border bg-surface-secondary p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/15 text-accent-text border border-accent/30">
                <Edit3 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Account Permissions & Controls</h2>
                <p className="text-xs text-muted-foreground">Modify user role, subscription tier, storage quota, and account status.</p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAccountChanges}
              disabled={isSavingAccount}
              className="gap-2 text-xs bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20 rounded-xl font-bold"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSavingAccount ? "Saving Changes..." : "Save All Changes"}</span>
            </Button>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* 1. Role Selector */}
            <div className="space-y-2 p-4 rounded-2xl bg-background/70 border border-border">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-accent-text" />
                <span>User Role</span>
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
                className="w-full bg-surface text-white rounded-xl border border-border-strong px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-accent"
              >
                <option value="member">Standard Member (Basic Access)</option>
                <option value="premium">Premium Member (High Quota)</option>
                <option value="moderator">Support / Moderator (Ticket Plane)</option>
                <option value="admin">Administrator (Full Control Plane)</option>
              </select>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Admins have full root access to system settings, user records, and R2 files.
              </p>
            </div>

            {/* 2. Subscription Plan */}
            <div className="space-y-2 p-4 rounded-2xl bg-background/70 border border-border">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-success" />
                <span>Subscription Plan</span>
              </label>
              <select
                value={editTier}
                onChange={(e) => {
                  const newT = e.target.value as SubscriptionTier;
                  setEditTier(newT);
                  if (newT === "enterprise") setEditQuotaGb(2048);
                  else if (newT === "ultra") setEditQuotaGb(500);
                  else if (newT === "pro") setEditQuotaGb(100);
                  else if (newT === "free") setEditQuotaGb(10);
                }}
                className="w-full bg-surface text-white rounded-xl border border-border-strong px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-accent"
              >
                <option value="free">Free Starter (2 GB)</option>
                <option value="pro">Pro Plan (100 GB)</option>
                <option value="ultra">Ultra Plan (500 GB)</option>
                <option value="enterprise">Enterprise (2 TB)</option>
              </select>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Selecting a plan auto-sets the standard cloud quota size.
              </p>
            </div>

            {/* 3. Account Status */}
            <div className="space-y-2 p-4 rounded-2xl bg-background/70 border border-border">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-accent-text" />
                <span>Account Status</span>
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full bg-surface text-white rounded-xl border border-border-strong px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-accent"
              >
                <option value="active">Active (Normal Access)</option>
                <option value="suspended">Suspended (Read-only / Frozen)</option>
                <option value="banned">Banned (Blocked from Login)</option>
              </select>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Banned accounts cannot authenticate or access stored links.
              </p>
            </div>
          </div>

          {/* Storage Quota Controls */}
          <div className="p-5 rounded-2xl bg-background/70 border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-accent-text" />
                  <span>Custom Storage Quota Limit</span>
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Current usage: <strong className="text-foreground">{formatBytes(user.usedBytes)}</strong> of <strong className="text-accent-text">{formatBytes(user.quotaBytes)}</strong> ({usagePercent}%)
                </p>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[10, 50, 100, 500, 1000, 2048].map((gb) => (
                  <button
                    key={gb}
                    type="button"
                    onClick={() => setEditQuotaGb(gb)}
                    className={`rounded-2xl border px-2.5 py-1 text-[11px] font-bold transition-all ${
                      editQuotaGb === gb
                        ? "border-accent bg-accent/20 text-accent-text"
                        : "border-border bg-surface text-muted-foreground hover:text-white"
                    }`}
                  >
                    {gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground">Quota Value in Gigabytes (GB)</label>
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  value={editQuotaGb}
                  onChange={(e) => setEditQuotaGb(Number(e.target.value))}
                  className="bg-surface text-white rounded-xl text-xs"
                />
              </div>

              {/* Visual usage preview */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Usage Preview</span>
                  <span>{Math.round((user.usedBytes / (editQuotaGb * 1024 * 1024 * 1024 || 1)) * 100)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface overflow-hidden border border-border">
                  <div
                    style={{ width: `${Math.min(100, (user.usedBytes / (editQuotaGb * 1024 * 1024 * 1024 || 1)) * 100)}%` }}
                    className="h-full bg-gradient-to-r from-accent-text to-accent rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Internal Admin Notes</span>
            </label>
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Write private notes about this user, history, or special permissions..."
              rows={2}
              className="w-full bg-background/80 text-white rounded-xl border border-border p-3 text-xs focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("files")}
            className={`pb-3 flex items-center gap-2 transition-colors relative ${
              activeTab === "files" ? "text-accent-text font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Files ({files.length})</span>
            {activeTab === "files" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
          </button>

          <button
            onClick={() => setActiveTab("shares")}
            className={`pb-3 flex items-center gap-2 transition-colors relative ${
              activeTab === "shares" ? "text-accent-text font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Share2 className="h-4 w-4" />
            <span>Active Shares ({shares.length})</span>
            {activeTab === "shares" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
          </button>

          <button
            onClick={() => setActiveTab("devices")}
            className={`pb-3 flex items-center gap-2 transition-colors relative ${
              activeTab === "devices" ? "text-accent-text font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Laptop className="h-4 w-4" />
            <span>Devices & IP Telemetry ({devices.length})</span>
            {activeTab === "devices" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
          </button>
        </div>

        {/* Tab 1: Cloud Files */}
        {activeTab === "files" && (
          <div className="rounded-3xl border border-border bg-surface/60 overflow-hidden shadow-xl">
            {files.length === 0 ? (
              <div className="py-16 text-center text-subtle space-y-2">
                <FolderOpen className="h-8 w-8 mx-auto text-subtle/80" />
                <p className="text-xs">User has not uploaded any files yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-background/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Filename</th>
                      <th className="py-3.5 px-4">Size</th>
                      <th className="py-3.5 px-4">MIME Type</th>
                      <th className="py-3.5 px-4">Uploaded</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {files.map((file) => (
                      <tr key={file.id} className="hover:bg-surface-secondary/40 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-background border border-border">
                              {renderFileIcon(file)}
                            </div>
                            <span className="font-semibold text-white truncate max-w-xs">{file.filename}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-foreground/80 font-mono">{formatBytes(file.size)}</td>
                        <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">{file.mimeType}</td>
                        <td className="py-3.5 px-4 text-muted-foreground text-[11px] whitespace-nowrap">
                          {formatRelativeTime(file.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleGetDownloadLink(file)}
                              title="Download file"
                              className="h-8 text-accent-text hover:text-accent-text hover:bg-accent-hover/10 gap-1 rounded-2xl text-xs"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>Download</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFileForDelete(file)}
                              title="Delete from R2"
                              className="h-8 w-8 p-0 text-subtle hover:text-danger hover:bg-danger/10 rounded-2xl"
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
            )}
          </div>
        )}

        {/* Tab 2: Shared Links */}
        {activeTab === "shares" && (
          <div className="rounded-3xl border border-border bg-surface/60 overflow-hidden shadow-xl">
            {shares.length === 0 ? (
              <div className="py-16 text-center text-subtle space-y-2">
                <Share2 className="h-8 w-8 mx-auto text-subtle/80" />
                <p className="text-xs">User has not created any public share links.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-background/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Share Token / Link</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Password</th>
                      <th className="py-3.5 px-4">Downloads</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {shares.map((share) => (
                      <tr key={share.id} className="hover:bg-surface-secondary/40 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-accent-text bg-background px-2 py-0.5 rounded border border-border">
                              /s/{share.token}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/s/${share.token}`);
                                toast.success("Share URL copied!");
                              }}
                              className="text-subtle hover:text-white"
                              title="Copy URL"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-xl px-2 py-0.5 text-[10px] font-semibold border ${
                              share.isActive
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-surface-secondary text-muted-foreground border-border-strong"
                            }`}
                          >
                            {share.isActive ? "Active" : "Revoked"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {share.passwordProtected ? (
                            <span className="flex items-center gap-1 text-warning">
                              <Lock className="h-3 w-3" />
                              <span>Protected</span>
                            </span>
                          ) : (
                            <span className="text-subtle">Public</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-foreground/80 font-mono">{share.downloadCount}</td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleShare(share)}
                            className={`text-xs rounded-xl ${
                              share.isActive
                                ? "text-danger hover:text-danger border-danger/30 hover:bg-danger/10"
                                : "text-success hover:text-success border-success/30 hover:bg-success/10"
                            }`}
                          >
                            {share.isActive ? "Revoke Link" : "Activate Link"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Devices & Detailed IP Telemetry */}
        {activeTab === "devices" && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-surface/60 p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Wifi className="h-4 w-4 text-accent-text" />
                <span>Recorded Client Sessions & Devices</span>
              </h3>

              {devices.length === 0 ? (
                <div className="py-12 text-center text-subtle space-y-2">
                  <Laptop className="h-8 w-8 mx-auto text-subtle/80" />
                  <p className="text-xs">No registered client devices found for this user.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {devices.map((device) => {
                    const devIp = device.ip_address || "127.0.0.1";
                    return (
                      <div
                        key={device.id}
                        className="flex items-start justify-between p-4 rounded-2xl bg-background/80 border border-border/80 shadow-md space-y-2"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2.5 rounded-xl bg-surface border border-border flex-shrink-0">
                            {renderDeviceIcon(device.platform, device.device_type)}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <p className="font-semibold text-white text-xs truncate">
                              {device.device_name || "Desktop Web Client"}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono truncate">
                              ID: {device.device_id?.slice(0, 16)}...
                            </p>

                            {/* IP Box */}
                            <div className="flex items-center gap-1.5 pt-1">
                              <span className="font-mono text-[11px] text-accent-text bg-accent/10 px-2 py-0.5 rounded border border-accent/30 flex items-center gap-1">
                                <Wifi className="h-3 w-3 text-accent-text" />
                                {devIp}
                              </span>
                              <button
                                onClick={() => handleCopyIp(devIp)}
                                title="Copy IP"
                                className="text-subtle hover:text-white"
                              >
                                {copiedIp === devIp ? (
                                  <Check className="h-3 w-3 text-success" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>

                            <p className="text-[10px] text-subtle pt-1">
                              Browser: <strong className="text-muted-foreground">{device.browser || "Web Browser"}</strong> • Last seen {formatRelativeTime(device.last_seen || device.created_at)}
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnectDevice(device.id)}
                          title="Revoke session"
                          className="h-8 text-xs text-danger hover:text-danger hover:bg-danger/10 rounded-2xl flex-shrink-0"
                        >
                          Disconnect
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Direct Download Link Modal */}
      <Dialog
        open={Boolean(downloadLinkModal)}
        onOpenChange={(open) => !open && setDownloadLinkModal(null)}
      >
        <DialogContent className="max-w-md rounded-3xl border border-border bg-background p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Download className="h-4 w-4 text-accent-text" />
              <span>Signed R2 Download Link</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <p className="text-foreground/80">
              Download link for: <strong className="text-white">{downloadLinkModal?.filename}</strong>
            </p>
            <div className="p-3 rounded-xl bg-surface border border-border font-mono text-[11px] text-foreground/80 break-all select-all">
              {downloadLinkModal?.url}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setDownloadLinkModal(null)}>
              Close
            </Button>
            <a href={downloadLinkModal?.url} download={downloadLinkModal?.filename} target="_blank" rel="noreferrer">
              <Button variant="primary" size="sm" className="bg-accent hover:bg-accent-hover text-xs rounded-xl">
                Open / Download Now
              </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete File Confirmation Modal */}
      <Dialog
        open={Boolean(selectedFileForDelete)}
        onOpenChange={(open) => !open && setSelectedFileForDelete(null)}
      >
        <DialogContent className="max-w-md rounded-3xl border border-danger/30 bg-background p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-danger flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Delete File from Storage</span>
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-foreground/80 py-2">
            Are you sure you want to delete file <strong className="text-white">{selectedFileForDelete?.filename}</strong> ({formatBytes(selectedFileForDelete?.size || 0)}) from secure cloud storage?
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
              {isDeletingFile ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
