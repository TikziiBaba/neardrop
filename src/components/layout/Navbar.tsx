"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, LogOut, Settings, Layers } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { UserAvatar } from "@/components/ui/UserAvatar";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password");
  const isPublicSharePage = pathname.startsWith("/s/");
  const isDashboardOrAppPage =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/files") ||
    pathname.startsWith("/shared") ||
    pathname.startsWith("/transfers") ||
    pathname.startsWith("/storage") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/admin");

  if (isAuthPage || isPublicSharePage || isDashboardOrAppPage) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Logo size="md" badge="v1.0" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-zinc-400">
          {!user ? (
            <>
              <Link href="/#product" className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-zinc-900/60 transition-colors">
                {t.navbar.product}
              </Link>
              <Link href="/#how-it-works" className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-zinc-900/60 transition-colors">
                {t.navbar.howItWorks}
              </Link>
              <Link href="/#security" className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-zinc-900/60 transition-colors">
                {t.navbar.security}
              </Link>
              <Link href="/pricing" className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-zinc-900/60 transition-colors">
                Pricing
              </Link>
              <Link href="/support" className="px-3.5 py-2 rounded-lg hover:text-white hover:bg-zinc-900/60 transition-colors">
                Support
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  pathname === "/dashboard" ? "text-white bg-zinc-800/80 font-semibold" : "hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                {t.navbar.dashboard}
              </Link>
              <Link
                href="/files"
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  pathname === "/files" ? "text-white bg-zinc-800/80 font-semibold" : "hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                {t.navbar.files}
              </Link>
              <Link
                href="/shared"
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  pathname === "/shared" ? "text-white bg-zinc-800/80 font-semibold" : "hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                {t.navbar.shared}
              </Link>
              <Link
                href="/transfers"
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  pathname === "/transfers" ? "text-white bg-zinc-800/80 font-semibold" : "hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                {t.navbar.transfers}
              </Link>
              <Link
                href="/pricing"
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  pathname === "/pricing" ? "text-white bg-zinc-800/80 font-semibold" : "hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                Pricing
              </Link>
              <Link
                href="/support"
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  pathname.startsWith("/support") ? "text-white bg-zinc-800/80 font-semibold" : "hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                Support
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {t.navbar.login}
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <span>{t.navbar.getStarted}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 rounded-full border border-zinc-800 bg-zinc-900/80 p-1 pr-3 hover:border-zinc-700 transition-all"
              >
                <UserAvatar user={user} size="sm" className="ring-1 ring-sky-500/40" />
                <span className="text-xs font-semibold text-zinc-200">{user.displayName}</span>
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <Layers className="h-3.5 w-3.5 text-sky-400" />
                    <span>{t.navbar.dashboard}</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{t.navbar.settings}</span>
                  </Link>

                  <button
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await logout();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t.navbar.logout}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 space-y-3 backdrop-blur-xl">
          {!user ? (
            <div className="flex flex-col gap-2 text-sm font-medium text-zinc-300">
              <Link href="/#product" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-zinc-900">
                {t.navbar.product}
              </Link>
              <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-zinc-900">
                {t.navbar.howItWorks}
              </Link>
              <Link href="/#security" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-zinc-900">
                {t.navbar.security}
              </Link>
              <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-zinc-900">
                {t.navbar.faq}
              </Link>
              <div className="pt-2 flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {t.navbar.login}
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    {t.navbar.getStarted}
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-sm font-medium text-zinc-300">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-900/80 mb-1 border border-zinc-800">
                <UserAvatar user={user} size="sm" />
                <div className="truncate">
                  <p className="font-semibold text-xs text-white">{user.displayName}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                </div>
              </div>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-zinc-900">
                {t.navbar.dashboard}
              </Link>
              <Link href="/files" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-zinc-900">
                {t.navbar.files}
              </Link>
              <Link href="/shared" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-zinc-900">
                {t.navbar.sharedLinks}
              </Link>
              <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-zinc-900">
                Pricing
              </Link>
              <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-zinc-900">
                Support
              </Link>
              <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-zinc-900">
                {t.navbar.settings}
              </Link>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                }}
                className="flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.navbar.logout}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
