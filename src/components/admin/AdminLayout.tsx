"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Share2,
  Activity,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  ShieldAlert,
  Server,
  HardDrive,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/UserAvatar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (user.role !== "admin" && user.role !== "moderator") {
        router.replace("/dashboard");
      }
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0071e3]" />
          <p className="text-xs text-zinc-400 font-medium animate-pulse">Loading Admin Control Plane...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return null;
  }

  const navItems = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "User Accounts", href: "/admin/users", icon: Users },
    { label: "Support Tickets", href: "/admin/tickets", icon: ShieldCheck },
    { label: "All Files", href: "/admin/files", icon: FolderOpen },
    { label: "Active Shares", href: "/admin/shares", icon: Share2 },
    { label: "System Health", href: "/admin/system", icon: Activity },
    { label: "Audit Logs", href: "/admin/logs", icon: ShieldAlert },
  ];

  return (
    <div className="dark flex h-screen w-full overflow-hidden bg-[#0c0c0e] text-[#f5f5f7]">
      {/* Admin Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-white/[0.08] bg-[#121215]/95 p-4 backdrop-blur-2xl">
        <div className="space-y-6">
          {/* Admin Brand */}
          <div className="flex items-center justify-between px-2 py-1">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0071e3] text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  NearDrop
                  <span className="rounded-md bg-[#0071e3]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#2997ff] border border-[#0071e3]/30">
                    Admin
                  </span>
                </span>
                <span className="text-[11px] text-[#86868b] font-medium">Control Plane</span>
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6e6e73]">
              Management
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#0071e3] text-white shadow-md shadow-blue-500/20 font-semibold"
                      : "text-[#86868b] hover:text-[#f5f5f7] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? "text-white" : "text-[#86868b] group-hover:text-[#f5f5f7]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switcher & Status */}
        <div className="space-y-3">
          {/* Quick System Badge */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#161619] p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-[#a1a1a6]">Engine & Storage Active</span>
            </div>
            <Server className="h-3.5 w-3.5 text-[#6e6e73]" />
          </div>

          {/* Return to Dashboard */}
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs font-medium text-[#a1a1a6] hover:bg-white/[0.08] hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to User App</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#0c0c0e]">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#121215]/80 px-4 sm:px-6 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            {/* Mobile Brand */}
            <Link href="/admin" className="flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0071e3] text-white shadow-sm">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-white">Admin</span>
            </Link>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#86868b]">
              <Link href="/dashboard" className="text-[#86868b] hover:text-[#f5f5f7] transition-colors">
                NearDrop
              </Link>
              <span>/</span>
              <span className="text-[#2997ff] font-semibold">Admin Panel</span>
              <span>/</span>
              <span className="font-semibold text-[#f5f5f7] capitalize">
                {pathname.replace("/admin", "").replace("/", "") || "Overview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-[#a1a1a6] hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to App</span>
            </Link>
            {user && (
              <div className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] p-1 pr-3">
                <UserAvatar user={user} size="sm" className="ring-1 ring-[#0071e3]/40" />
                <span className="text-xs font-semibold text-[#f5f5f7]">{user.displayName}</span>
              </div>
            )}
          </div>
        </header>

        {/* Mobile Navigation bar */}
        <nav className="flex lg:hidden overflow-x-auto border-b border-white/[0.08] bg-[#121215] px-3 py-2 gap-1 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#0071e3] text-white font-semibold"
                    : "text-[#86868b] hover:text-[#f5f5f7]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Scrollable Main */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-16 bg-[#0c0c0e]">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};
