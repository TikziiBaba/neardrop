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
  Loader2,
} from "lucide-react";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { LogoIcon } from "@/components/ui/Logo";

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (!user.isEmailVerified) {
        router.replace(`/verify-email?email=${encodeURIComponent(user.email)}`);
      }
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-accent-text" />
          <p className="text-xs text-muted-foreground font-medium tracking-wide">Loading NearDrop...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isEmailVerified) {
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
    <div className="dark flex h-screen w-full overflow-hidden text-foreground">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="mx-3 mt-3 flex h-14 items-center justify-between rounded-full border border-border/80 bg-surface/50 pl-4 pr-2 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            {/* Mobile Brand Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
              <LogoIcon size="sm" />
              <span className="font-display text-base text-foreground">Near<span className="italic text-accent-text">Drop</span></span>
            </Link>

            {/* Breadcrumb / Title */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span className="text-subtle">NearDrop</span>
              <span className="text-subtle/80">/</span>
              <span className="font-semibold text-foreground capitalize">
                {routeName}
              </span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            {isStaffOrAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/5 px-2.5 py-1 text-xs font-semibold text-accent-text hover:bg-accent/5 transition-colors"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span>Admin</span>
              </Link>
            )}

            {user && (
              <Link
                href="/settings"
                className="flex items-center gap-2 rounded-full border border-border bg-surface/60 p-1 pr-3 hover:border-border-strong transition-colors"
              >
                <UserAvatar user={user} size="sm" className="ring-1 ring-accent/40" />
                <span className="hidden sm:inline text-xs font-semibold text-foreground">{user.displayName}</span>
              </Link>
            )}
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-6xl">
            <EmailVerificationBanner />
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (Apple 44pt touch-target standard) */}
        <nav className="fixed bottom-3 left-3 right-3 z-40 flex h-16 items-center justify-around rounded-full border border-border/80 bg-surface/80 px-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)] backdrop-blur-2xl lg:hidden">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition-colors ${
                  isActive ? "text-foreground font-semibold bg-accent/20 rounded-full" : "text-muted-foreground hover:text-foreground"
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
