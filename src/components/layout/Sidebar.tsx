"use client";
/* eslint-disable @next/next/no-img-element */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Share2,
  ArrowLeftRight,
  HardDrive,
  Settings,
  Sparkles,
  LogOut,
  ShieldCheck,
  LifeBuoy,
  CreditCard,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { useStorage } from "@/lib/storage/store";
import { formatBytes } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/ui/Logo";
import { UserAvatar } from "@/components/ui/UserAvatar";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { stats } = useStorage();

  const navItems: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Files", href: "/files", icon: FolderOpen, badge: stats.filesCount },
    { label: "Direct Transfers", href: "/transfers", icon: ArrowLeftRight },
    { label: "Shared Links", href: "/shared", icon: Share2, badge: stats.sharedCount },
    { label: "Pricing & Plans", href: "/pricing", icon: CreditCard },
    { label: "Support", href: "/support", icon: LifeBuoy },
  ];

  const quotaPercent = Math.round((stats.usedBytes / (stats.quotaBytes || 1)) * 100) || 0;
  const isStaffOrAdmin = user?.role === "admin" || user?.role === "moderator";

  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-zinc-800/80 bg-zinc-950/60 p-4 backdrop-blur-xl">
      {/* Brand & Nav */}
      <div className="space-y-6">
        {/* Brand */}
        <div className="px-2 py-1">
          <Logo size="md" badge="" />
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-sm font-semibold"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? "text-purple-400" : "text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="rounded-md bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 pb-1">
            <div className="h-[1px] bg-zinc-800/80" />
          </div>

          {isStaffOrAdmin && (
            <Link
              href="/admin"
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                pathname.startsWith("/admin")
                  ? "bg-purple-950/40 text-purple-300 border border-purple-500/30 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-purple-300 hover:bg-purple-500/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className={`h-4 w-4 transition-colors ${
                    pathname.startsWith("/admin") ? "text-purple-400" : "text-zinc-400 group-hover:text-purple-400"
                  }`}
                />
                <span>Admin Panel</span>
              </div>
              <span className="rounded-md bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-purple-400">
                {user?.role === "admin" ? "Admin" : "Staff"}
              </span>
            </Link>
          )}

          <Link
            href="/settings"
            className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              pathname === "/settings"
                ? "bg-zinc-800 text-white shadow-sm font-semibold"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80"
            }`}
          >
            <Settings
              className={`h-4 w-4 transition-colors ${
                pathname === "/settings" ? "text-purple-400" : "text-zinc-400 group-hover:text-zinc-200"
              }`}
            />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Quota & User Info */}
      <div className="space-y-4">
        {/* Storage quota card */}
        <div className="rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-zinc-200">Cloud Storage</span>
            <span className="text-[11px] text-sky-400 font-medium">{quotaPercent}%</span>
          </div>
          <Progress value={stats.usedBytes} max={stats.quotaBytes || 10737418240} />
          <div className="flex items-center justify-between text-[10px] text-zinc-400">
            <span>{formatBytes(stats.usedBytes)}</span>
            <span>{formatBytes(stats.quotaBytes || 10737418240)}</span>
          </div>
        </div>

        {/* User profile & logout */}
        {user && (
          <div className="flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar user={user} size="sm" className="ring-1 ring-sky-500/30" />
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
                  {user.role === "admin" && (
                    <span className="rounded bg-purple-500/20 px-1 py-0.2 text-[9px] font-bold text-purple-400">
                      ADMIN
                    </span>
                  )}
                  {user.role === "premium" && (
                    <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-bold text-emerald-400">
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
