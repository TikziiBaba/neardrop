"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { AdminUser, UserRole, SubscriptionTier } from "@/types";
import { formatBytes, formatRelativeTime } from "@/lib/utils";
import {
  Users,
  Search,
  HardDrive,
  FolderOpen,
  Share2,
  Edit2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Eye,
  Laptop,
  Smartphone,
  Globe,
  Wifi,
  Filter,
  Download,
  MoreVertical,
  Zap,
  UserCheck,
  Ban,
  AlertTriangle,
  Lock,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Edit User Modal State
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<UserRole>("member");
  const [editTier, setEditTier] = useState<SubscriptionTier>("free");
  const [editQuotaGb, setEditQuotaGb] = useState<number>(10);
  const [editStatus, setEditStatus] = useState<"active" | "suspended" | "banned">("active");
  const [editNotes, setEditNotes] = useState<string>("");

  const [selectedUserForDelete, setSelectedUserForDelete] = useState<AdminUser | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEditModal = (u: AdminUser, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserForEdit(u);
    setEditRole(u.role);
    setEditTier(u.subscriptionTier || "free");
    setEditQuotaGb(Math.round(u.quotaBytes / (1024 * 1024 * 1024)) || 10);
    setEditStatus((u.status as any) || "active");
    setEditNotes(u.notes || "");
  };

  const handleSaveUserEdit = async () => {
    if (!selectedUserForEdit) return;
    setIsUpdating(true);
    try {
      const quotaBytes = editQuotaGb * 1024 * 1024 * 1024;
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserForEdit.id,
          role: editRole,
          subscriptionTier: editTier,
          quotaBytes,
          status: editStatus,
          notes: editNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`User ${selectedUserForEdit.displayName} updated successfully!`);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUserForEdit.id
              ? {
                  ...u,
                  role: editRole,
                  subscriptionTier: editTier,
                  quotaBytes,
                  status: editStatus,
                  notes: editNotes,
                }
              : u
          )
        );
        setSelectedUserForEdit(null);
      } else {
        toast.error(data.error || "Failed to update user");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuickChangeRole = async (u: AdminUser, newRole: UserRole, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Optimistic update
      setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, role: newRole } : item)));

      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Role for ${u.displayName} changed to ${newRole.toUpperCase()}`);
      } else {
        toast.error(data.error || "Failed to change role");
        fetchUsers();
      }
    } catch (err: any) {
      toast.error("Failed to change role");
      fetchUsers();
    }
  };

  const handleQuickChangeStatus = async (u: AdminUser, newStatus: "active" | "banned" | "suspended", e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setUsers((prev) => prev.map((item) => (item.id === u.id ? { ...item, status: newStatus } : item)));

      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status for ${u.displayName} set to ${newStatus.toUpperCase()}`);
      } else {
        toast.error(data.error || "Failed to change status");
        fetchUsers();
      }
    } catch (err: any) {
      toast.error("Failed to change status");
      fetchUsers();
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${selectedUserForDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`User ${selectedUserForDelete.email} removed`);
        setUsers((prev) => prev.filter((u) => u.id !== selectedUserForDelete.id));
        setSelectedUserForDelete(null);
      } else {
        toast.error(data.error || "Failed to delete user");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyIp = (ip: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    toast.success(`Copied IP: ${ip}`);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const exportUsersCsv = () => {
    const headers = ["ID", "Display Name", "Email", "Role", "Plan", "Status", "Quota (GB)", "Used (MB)", "Last IP", "Device", "Platform", "Browser", "Created At"];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.displayName.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      u.role,
      u.subscriptionTier,
      u.status || "active",
      Math.round(u.quotaBytes / (1024 * 1024 * 1024)),
      Math.round(u.usedBytes / (1024 * 1024)),
      u.lastIpAddress || "127.0.0.1",
      `"${(u.lastDevice || "Desktop Web").replace(/"/g, '""')}"`,
      u.lastPlatform || "windows",
      u.lastBrowser || "Chrome",
      u.createdAt,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `neardrop_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported users directory to CSV");
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.email.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      (u.lastIpAddress && u.lastIpAddress.toLowerCase().includes(q)) ||
      (u.lastDevice && u.lastDevice.toLowerCase().includes(q)) ||
      (u.lastBrowser && u.lastBrowser.toLowerCase().includes(q)) ||
      (u.lastPlatform && u.lastPlatform.toLowerCase().includes(q));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || (u.status || "active") === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2.5">
              <span>User & Client Directory</span>
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent-text border border-accent/30">
                {users.length} Total Accounts
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Live directory with real-time IP tracking, direct role management, quota controls, and device telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={exportUsersCsv}
              className="gap-1.5 text-xs rounded-full border-white/[0.1] bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-white"
            >
              <Download className="h-3.5 w-3.5 text-accent-text" />
              <span>Export CSV</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
              className="gap-2 text-xs rounded-full border-white/[0.1] bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-accent-text" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-secondary p-3 rounded-2xl border border-white/[0.08]">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, IP address, device, browser, platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs bg-surface border-white/[0.08] text-white rounded-xl placeholder:text-subtle"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-surface px-2.5 py-1.5 rounded-xl border border-white/[0.08] text-xs">
              <span className="text-muted-foreground text-[11px] font-medium mr-1">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-surface-secondary">All Roles</option>
                <option value="admin" className="bg-surface-secondary text-accent-text">Admin Only</option>
                <option value="moderator" className="bg-surface-secondary text-accent-text">Moderators</option>
                <option value="premium" className="bg-surface-secondary text-success">Premium</option>
                <option value="member" className="bg-surface-secondary">Members</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-surface px-2.5 py-1.5 rounded-xl border border-white/[0.08] text-xs">
              <span className="text-muted-foreground text-[11px] font-medium mr-1">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-surface-secondary">All Statuses</option>
                <option value="active" className="bg-surface-secondary">Active</option>
                <option value="banned" className="bg-surface-secondary">Banned</option>
                <option value="suspended" className="bg-surface-secondary">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-3xl border border-white/[0.08] bg-surface-secondary overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-surface text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">User / Identity</th>
                  <th className="py-3.5 px-4">Role & Plan</th>
                  <th className="py-3.5 px-4">IP Address & Telemetry</th>
                  <th className="py-3.5 px-4">Storage Usage</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Files / Shares</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-subtle">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-accent-text mb-2" />
                      Loading user accounts and devices...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-subtle">
                      No users match your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const usagePercent = Math.min(100, Math.round((u.usedBytes / (u.quotaBytes || 1)) * 100));
                    const isAdmin = u.role === "admin";
                    const isMod = u.role === "moderator";
                    const isPrem = u.role === "premium";

                    return (
                      <tr
                        key={u.id}
                        onClick={() => (window.location.href = `/admin/users/${u.id}`)}
                        className="hover:bg-surface-secondary/40 transition-colors group cursor-pointer"
                      >
                        {/* User Identity with Smart Avatar */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              user={u}
                              size="md"
                              showStatusDot={true}
                              className="ring-2 ring-accent/30"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate group-hover:text-accent-text transition-colors flex items-center gap-1.5">
                                <span>{u.displayName}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-subtle group-hover:text-accent-text group-hover:translate-x-0.5 transition-all" />
                              </p>
                              <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role & Plan Switcher */}
                        <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-1 items-start">
                            {/* Role Select */}
                            <select
                              value={u.role}
                              onChange={(e) => handleQuickChangeRole(u, e.target.value as UserRole, e as any)}
                              className={`text-[10px] font-bold rounded-xl px-2 py-0.5 border transition-all cursor-pointer ${
                                isAdmin
                                  ? "bg-accent/15 text-accent-text border-accent/30"
                                  : isMod
                                  ? "bg-accent/10 text-accent-text border-accent/30"
                                  : isPrem
                                  ? "bg-success/10 text-success border-success/30"
                                  : "bg-surface-secondary text-foreground/80 border-border-strong"
                              }`}
                            >
                              <option value="admin" className="bg-surface-secondary text-accent-text font-bold">Admin</option>
                              <option value="moderator" className="bg-surface-secondary text-accent-text font-bold">Moderator</option>
                              <option value="premium" className="bg-surface-secondary text-success font-bold">Premium</option>
                              <option value="member" className="bg-surface-secondary text-foreground/80">Member</option>
                            </select>

                            <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider">
                              Plan: <strong className="text-foreground/80">{u.subscriptionTier?.toUpperCase() || "FREE"}</strong>
                            </span>
                          </div>
                        </td>

                        {/* Detailed IP Address & Telemetry */}
                        <td className="py-4 px-4">
                          <div className="space-y-1 min-w-[170px]">
                            {/* IP Box with Copy button */}
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="font-mono text-accent-text bg-accent/10 px-2 py-0.5 rounded border border-accent/25 font-semibold flex items-center gap-1">
                                <Wifi className="h-3 w-3 text-accent-text" />
                                {u.lastIpAddress || "127.0.0.1"}
                              </span>
                              <button
                                onClick={(e) => handleCopyIp(u.lastIpAddress || "127.0.0.1", e)}
                                title="Copy IP Address"
                                className="p-1 rounded bg-surface-secondary/80 text-muted-foreground hover:text-white transition-colors"
                              >
                                {copiedIp === (u.lastIpAddress || "127.0.0.1") ? (
                                  <Check className="h-3 w-3 text-success" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>

                            {/* Device and Browser */}
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground truncate">
                              <span className="flex items-center gap-1 text-foreground/80">
                                <Laptop className="h-3 w-3 text-muted-foreground" />
                                {u.lastDevice || "Desktop"}
                              </span>
                              <span>•</span>
                              <span className="truncate text-muted-foreground font-medium">{u.lastBrowser || "Web"}</span>
                            </div>
                          </div>
                        </td>

                        {/* Storage Usage Progress */}
                        <td className="py-4 px-4 min-w-[140px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px]">
                              <span className="font-medium text-foreground/80">{formatBytes(u.usedBytes)}</span>
                              <span className="text-subtle">{formatBytes(u.quotaBytes)}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
                              <div
                                style={{ width: `${usagePercent}%` }}
                                className={`h-full rounded-full transition-all ${
                                  usagePercent > 85 ? "bg-danger" : "bg-gradient-to-r from-accent-text to-accent"
                                }`}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Account Status Switcher */}
                        <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={u.status || "active"}
                            onChange={(e) => handleQuickChangeStatus(u, e.target.value as any, e as any)}
                            className={`text-[10px] font-bold rounded-xl px-2 py-0.5 border transition-all cursor-pointer ${
                              u.status === "banned"
                                ? "bg-danger/10 text-danger border-danger/30"
                                : u.status === "suspended"
                                ? "bg-warning/10 text-warning border-warning/30"
                                : "bg-success/10 text-success border-success/30"
                            }`}
                          >
                            <option value="active" className="bg-surface text-success font-bold">Active</option>
                            <option value="suspended" className="bg-surface text-warning font-bold">Suspended</option>
                            <option value="banned" className="bg-surface text-danger font-bold">Banned</option>
                          </select>
                        </td>

                        {/* Files & Shares count */}
                        <td className="py-4 px-4 text-foreground/80">
                          <div className="flex items-center gap-2.5 text-[11px]">
                            <span className="flex items-center gap-1 text-foreground/80 font-semibold" title="Files count">
                              <FolderOpen className="h-3.5 w-3.5 text-accent-text" />
                              {u.filesCount}
                            </span>
                            <span className="flex items-center gap-1 text-foreground/80 font-semibold" title="Shares count">
                              <Share2 className="h-3.5 w-3.5 text-success" />
                              {u.sharesCount}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 sm:px-6 text-right">
                          <div
                            className="flex items-center justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link href={`/admin/users/${u.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-8 text-accent-text hover:text-accent-text hover:bg-accent/10 gap-1 rounded-2xl"
                                title="Inspect User Full Details & IP History"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Inspect</span>
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleOpenEditModal(u, e)}
                              title="Edit User Role, Quota & Status"
                              className="text-xs h-8 text-accent-text hover:text-accent-text hover:bg-accent-hover/10 gap-1 rounded-2xl"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUserForDelete(u);
                              }}
                              title="Delete Account"
                              className="text-xs h-8 text-danger hover:text-danger hover:bg-danger/10 gap-1 rounded-2xl"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Comprehensive Edit User Modal */}
      <Dialog
        open={Boolean(selectedUserForEdit)}
        onOpenChange={(open) => !open && setSelectedUserForEdit(null)}
      >
        <DialogContent className="max-w-lg rounded-3xl border border-border bg-background p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2.5">
              <UserAvatar user={selectedUserForEdit} size="sm" />
              <span>Edit Account: {selectedUserForEdit?.displayName}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* User Meta Summary */}
            <div className="p-3 rounded-2xl bg-surface/60 border border-border space-y-1">
              <p className="text-foreground/80 font-semibold">{selectedUserForEdit?.email}</p>
              <p className="text-[11px] text-muted-foreground font-mono">
                IP: <strong className="text-accent-text">{selectedUserForEdit?.lastIpAddress || "127.0.0.1"}</strong> • Client: {selectedUserForEdit?.lastDevice || "Desktop"} ({selectedUserForEdit?.lastBrowser || "Web"})
              </p>
            </div>

            {/* Role & Status Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">User Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full bg-surface text-white rounded-xl border border-border px-3 py-2 text-xs focus:outline-none focus:border-accent"
                >
                  <option value="member">Standard Member</option>
                  <option value="premium">Premium Member</option>
                  <option value="moderator">Support / Moderator</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full bg-surface text-white rounded-xl border border-border px-3 py-2 text-xs focus:outline-none focus:border-accent"
                >
                  <option value="active">Active (Normal Access)</option>
                  <option value="suspended">Suspended (Temporary)</option>
                  <option value="banned">Banned (Blocked)</option>
                </select>
              </div>
            </div>

            {/* Subscription Tier & Quota */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Subscription Plan</label>
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
                  className="w-full bg-surface text-white rounded-xl border border-border px-3 py-2 text-xs focus:outline-none focus:border-accent"
                >
                  <option value="free">Free Starter (2 GB)</option>
                  <option value="pro">Pro Plan (100 GB)</option>
                  <option value="ultra">Ultra Plan (500 GB)</option>
                  <option value="enterprise">Enterprise (2 TB)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground/80">Quota Limit (GB)</label>
                <Input
                  type="number"
                  min={1}
                  max={10000}
                  value={editQuotaGb}
                  onChange={(e) => setEditQuotaGb(Number(e.target.value))}
                  className="bg-surface text-white rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Admin Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/80">Internal Admin Notes</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Write private notes about this user, reasons for bans/upgrades, or special permissions..."
                rows={3}
                className="w-full bg-surface text-white rounded-xl border border-border p-3 text-xs focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setSelectedUserForEdit(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveUserEdit}
              disabled={isUpdating}
              className="bg-accent hover:bg-accent-hover text-white text-xs rounded-xl font-medium"
            >
              {isUpdating ? "Saving Changes..." : "Save All Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog
        open={Boolean(selectedUserForDelete)}
        onOpenChange={(open) => !open && setSelectedUserForDelete(null)}
      >
        <DialogContent className="max-w-md rounded-3xl border border-danger/30 bg-background p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-danger flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Confirm Delete Account</span>
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-foreground/80 py-2">
            Are you sure you want to permanently delete user <strong className="text-white">{selectedUserForDelete?.email}</strong>? All their stored files in R2 and active share links will be purged immediately.
          </p>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setSelectedUserForDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteUser}
              disabled={isUpdating}
              className="text-xs rounded-xl"
            >
              {isUpdating ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
