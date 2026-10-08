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
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { useStorage } from "@/lib/storage/store";
import { useLanguage } from "@/lib/i18n/context";
import { formatBytes } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/ui/Logo";
import { UserAvatar } from "@/components/ui/UserAvatar";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { stats } = useStorage();
  const { t, locale } = useLanguage();

  const navItems: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { label: t.navbar.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { label: t.navbar.files, href: "/files", icon: FolderOpen, badge: stats.filesCount },
    { label: t.navbar.transfers, href: "/transfers", icon: ArrowLeftRight },
    { label: t.navbar.sharedLinks, href: "/shared", icon: Share2, badge: stats.sharedCount },
    { label: t.navbar.pricing || "Fiyatlandırma", href: "/pricing", icon: CreditCard },
    { label: t.navbar.support || "Destek", href: "/support", icon: LifeBuoy },
  ];

  const quotaPercent = Math.round((stats.usedBytes / (stats.quotaBytes || 1)) * 100) || 0;
  const isStaffOrAdmin = user?.role === "admin" || user?.role === "moderator";

  return (
    <aside className="hidden lg:flex w-64 m-3 mr-0 flex-col justify-between rounded-[28px] border border-border/80 bg-surface/55 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl select-none">
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
                className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-accent/25 to-accent-text/10 text-foreground font-semibold ring-1 ring-inset ring-accent/35 shadow-[0_8px_24px_-12px_hsl(var(--accent)/0.8)] before:absolute before:-left-4 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-halo"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive ? "text-accent-text" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="rounded-full bg-surface border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-3 pb-1">
            <div className="h-px bg-gradient-to-r from-transparent via-border-strong to-transparent" />
          </div>

          {isStaffOrAdmin && (
            <Link
              href="/admin"
              className={`group flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 ${
                pathname.startsWith("/admin")
                  ? "bg-accent/5 text-accent-text border border-accent/30 font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-accent-text hover:bg-accent-hover/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck
                  className={`h-4 w-4 transition-colors ${
                    pathname.startsWith("/admin") ? "text-accent-text" : "text-muted-foreground group-hover:text-accent-text"
                  }`}
                />
                <span>Admin Panel</span>
              </div>
              <span className="rounded-full bg-accent/10 border border-accent/20 px-1.5 py-0.5 text-[9px] font-semibold text-accent-text">
                {user?.role === "admin" ? "Admin" : "Staff"}
              </span>
            </Link>
          )}

          <Link
            href="/settings"
            className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[13px] font-medium transition-all duration-200 ${
              pathname === "/settings"
                ? "bg-gradient-to-r from-accent/25 to-accent-text/10 text-foreground font-semibold ring-1 ring-inset ring-accent/35"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
            }`}
          >
            <Settings
              className={`h-4 w-4 transition-colors ${
                pathname === "/settings" ? "text-accent-text" : "text-muted-foreground group-hover:text-foreground"
              }`}
            />
            <span>Settings</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Quota & User Info */}
      <div className="space-y-3.5">
        {/* Storage quota card */}
        <div className="rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/15 via-surface/40 to-halo/5 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">{t.dashboard.cloudStorage || "Bulut Depolama"}</span>
            <span className="text-[11px] text-accent-text font-mono font-medium">%{quotaPercent}</span>
          </div>
          <Progress value={stats.usedBytes} max={stats.quotaBytes || 2147483648} />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span>{formatBytes(stats.usedBytes)}</span>
            <span>{formatBytes(stats.quotaBytes || 2147483648)}</span>
          </div>
        </div>


        {/* User profile & logout */}
        {user && (
          <div className="flex items-center justify-between rounded-3xl border border-border/80 bg-background/40 p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar user={user} size="sm" className="ring-1 ring-accent/30" />
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
                  {user.role === "admin" && (
                    <span className="rounded bg-accent/20 px-1 py-0.2 text-[9px] font-bold text-accent-text font-mono">
                      ADMIN
                    </span>
                  )}
                  {user.role === "premium" && (
                    <span className="rounded bg-success/20 px-1 py-0.2 text-[9px] font-bold text-success font-mono">
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-1.5 rounded-2xl text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors flex-shrink-0 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
