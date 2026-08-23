"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminUser } from "@/types";
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
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Eye,
  Laptop,
  Smartphone,
  Globe,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserForQuota, setSelectedUserForQuota] = useState<AdminUser | null>(null);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<AdminUser | null>(null);
  const [newQuotaGb, setNewQuotaGb] = useState<number>(10);
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

  const handleOpenQuotaModal = (user: AdminUser, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserForQuota(user);
    setNewQuotaGb(Math.round(user.quotaBytes / (1024 * 1024 * 1024)) || 10);
  };

  const handleSaveQuota = async () => {
    if (!selectedUserForQuota) return;
    setIsUpdating(true);
    try {
      const quotaBytes = newQuotaGb * 1024 * 1024 * 1024;
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserForQuota.id, quotaBytes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Updated ${selectedUserForQuota.displayName}'s quota to ${newQuotaGb} GB`);
        setUsers((prev) =>
          prev.map((u) => (u.id === selectedUserForQuota.id ? { ...u, quotaBytes } : u))
        );
        setSelectedUserForQuota(null);
      } else {
        toast.error(data.error || "Failed to update quota");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update quota");
    } finally {
      setIsUpdating(false);
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

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.displayName.toLowerCase().includes(q) ||
      (u.lastIpAddress && u.lastIpAddress.toLowerCase().includes(q)) ||
      (u.lastDevice && u.lastDevice.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>User & Device Directory</span>
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-400 border border-purple-500/20">
                {users.length} Registered Accounts
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Inspect user accounts, recorded client devices, active IP addresses, and manage storage quotas.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="gap-2 text-xs self-start sm:self-auto rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-purple-400" : ""}`} />
            <span>Refresh Directory</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by name, email, IP address, or device..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs bg-zinc-900/60 border-zinc-800 rounded-xl"
          />
        </div>

        {/* Users Table */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">User / Identity</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Device & IP Address</th>
                  <th className="py-3.5 px-4">Storage Usage</th>
                  <th className="py-3.5 px-4">Files / Shares</th>
                  <th className="py-3.5 px-4">Last Active</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-400 mb-2" />
                      Loading user accounts and devices...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No users match &ldquo;{searchQuery}&rdquo;
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const usagePercent = Math.min(
                      100,
                      Math.round((u.usedBytes / (u.quotaBytes || 1)) * 100)
                    );
                    const isAdmin = u.role === "admin";

                    return (
                      <tr
                        key={u.id}
                        onClick={() => (window.location.href = `/admin/users/${u.id}`)}
                        className="hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                      >
                        {/* User identity */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                u.avatarUrl ||
                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                              }
                              alt={u.displayName}
                              className="h-9 w-9 rounded-full object-cover ring-1 ring-zinc-700 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                                <span>{u.displayName}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                              </p>
                              <p className="text-[11px] text-zinc-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-4">
                          {isAdmin ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400 border border-purple-500/20">
                              <ShieldCheck className="h-3 w-3" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                              User
                            </span>
                          )}
                        </td>

                        {/* Device & IP Address */}
                        <td className="py-4 px-4">
                          <div className="space-y-1 min-w-[150px]">
                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-300 font-medium truncate">
                              <Laptop className="h-3.5 w-3.5 text-purple-400 flex-shrink-0" />
                              <span className="truncate">{u.lastDevice || "Desktop Web"}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="font-mono text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                                {u.lastIpAddress || "127.0.0.1"}
                              </span>
                              <button
                                onClick={(e) => handleCopyIp(u.lastIpAddress || "127.0.0.1", e)}
                                title="Copy IP"
                                className="p-0.5 rounded text-zinc-500 hover:text-white"
                              >
                                {copiedIp === (u.lastIpAddress || "127.0.0.1") ? (
                                  <Check className="h-3 w-3 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Storage Progress */}
                        <td className="py-4 px-4 min-w-[150px]">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px]">
                              <span className="font-medium text-zinc-300">{formatBytes(u.usedBytes)}</span>
                              <span className="text-zinc-500">{formatBytes(u.quotaBytes)}</span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                style={{ width: `${usagePercent}%` }}
                                className={`h-full rounded-full transition-all ${
                                  usagePercent > 85 ? "bg-rose-500" : "bg-gradient-to-r from-sky-400 to-purple-500"
                                }`}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Files & Shares count */}
                        <td className="py-4 px-4 text-zinc-300">
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="flex items-center gap-1 text-zinc-300 font-semibold">
                              <FolderOpen className="h-3.5 w-3.5 text-sky-400" />
                              {u.filesCount}
                            </span>
                            <span className="flex items-center gap-1 text-zinc-300 font-semibold">
                              <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                              {u.sharesCount}
                            </span>
                          </div>
                        </td>

                        {/* Joined / Last Active Date */}
                        <td className="py-4 px-4 text-[11px] text-zinc-400 whitespace-nowrap">
                          {formatRelativeTime(u.lastLogin || u.createdAt)}
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
                                className="text-xs h-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1 rounded-lg"
                                title="Inspect User Files, Devices & Profile"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>Inspect</span>
                              </Button>
                            </Link>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleOpenQuotaModal(u, e)}
                              title="Edit Storage Quota"
                              className="text-xs h-8 text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 gap-1 rounded-lg"
                            >
                              <HardDrive className="h-3.5 w-3.5" />
                              <span>Quota</span>
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUserForDelete(u)}
                              title="Delete User"
                              className="h-8 w-8 p-0 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"
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

      {/* Quota Modal */}
      <Dialog
        open={Boolean(selectedUserForQuota)}
        onOpenChange={(open) => !open && setSelectedUserForQuota(null)}
      >
        <DialogContent className="max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-purple-400" />
              <span>Adjust Cloud Quota</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-zinc-400">
              Set storage limit for <strong className="text-white">{selectedUserForQuota?.displayName}</strong> ({selectedUserForQuota?.email}).
            </p>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
              {[10, 25, 50, 100, 250, 500].map((gb) => (
                <button
                  key={gb}
                  type="button"
                  onClick={() => setNewQuotaGb(gb)}
                  className={`rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                    newQuotaGb === gb
                      ? "border-purple-500 bg-purple-500/15 text-purple-300"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {gb} GB
                </button>
              ))}
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-medium text-zinc-300">Custom Storage Quota (GB)</label>
              <Input
                type="number"
                min={1}
                max={5000}
                value={newQuotaGb}
                onChange={(e) => setNewQuotaGb(Number(e.target.value))}
                className="bg-zinc-900 text-white rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" size="sm" onClick={() => setSelectedUserForQuota(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveQuota}
              disabled={isUpdating}
              className="bg-purple-600 hover:bg-purple-500 text-xs rounded-xl"
            >
              {isUpdating ? "Saving..." : "Save Quota"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog
        open={Boolean(selectedUserForDelete)}
        onOpenChange={(open) => !open && setSelectedUserForDelete(null)}
      >
        <DialogContent className="max-w-md rounded-3xl border border-rose-500/30 bg-zinc-950 p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-400 flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Confirm Delete Account</span>
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-zinc-300 py-2">
            Are you sure you want to permanently delete user <strong className="text-white">{selectedUserForDelete?.email}</strong>? All their stored files in R2 and active share links will be purged.
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
