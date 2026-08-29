"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/lib/auth/context";
import {
  LayoutDashboard,
  FolderOpen,
  Share2,
  ArrowLeftRight,
  HardDrive,
  Settings,
  Sparkles,
  Loader2,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/UserAvatar";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-sky-400" />
          <p className="text-xs text-zinc-400 font-medium tracking-wide">Loading NearDrop...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isStaffOrAdmin = user?.role === "admin" || user?.role === "moderator";

  const mobileNav = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Files", href: "/files", icon: FolderOpen },
    { label: "Shared", href: "/shared", icon: Share2 },
    { label: "Transfers", href: "/transfers", icon: ArrowLeftRight },
    { label: "Storage", href: "/storage", icon: HardDrive },
  ];

  const routeName = pathname.replace("/", "") || "Dashboard";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/60 px-4 sm:px-6 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            {/* Mobile Brand Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-sm shadow-blue-500/30">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-sm text-white">NearDrop</span>
            </Link>

            {/* Breadcrumb / Title */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <span className="text-zinc-500">NearDrop</span>
              <span className="text-zinc-600">/</span>
              <span className="font-semibold text-zinc-200 capitalize">
                {routeName}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {isStaffOrAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-950/40 px-2.5 py-1 text-xs font-semibold text-sky-300 hover:bg-sky-900/40 transition-colors"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span>Admin</span>
              </Link>
            )}

            {user && (
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 p-1 pr-3 hover:border-zinc-700 transition-colors"
              >
                <UserAvatar user={user} size="sm" className="ring-1 ring-sky-500/40" />
                <span className="hidden sm:inline text-xs font-semibold text-zinc-200">{user.displayName}</span>
              </Link>
            )}
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>

        {/* Mobile Bottom Navigation Bar (Apple 44pt touch-target standard) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-zinc-800/90 bg-zinc-950/90 px-2 backdrop-blur-2xl lg:hidden">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition-colors ${
                  isActive ? "text-sky-400 font-semibold" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
