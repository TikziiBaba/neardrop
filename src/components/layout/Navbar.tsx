"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
  const { t, locale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { scrollY } = useScroll();

  // Apple frosted nav — gets more opaque on scroll
  const navBg = useTransform(
    scrollY,
    [0, 60],
    ["rgba(255,255,255,0.72)", "rgba(255,255,255,0.92)"]
  );
  const navBlur = useTransform(scrollY, [0, 60], [20, 20]);
  const navBorder = useTransform(
    scrollY,
    [0, 60],
    ["rgba(0,0,0,0.04)", "rgba(0,0,0,0.1)"]
  );

  // Normalize pathname by stripping /tr or /en prefix if present
  const cleanPath = pathname.replace(/^\/(tr|en)/, "") || "/";

  const isAuthPage =
    cleanPath.startsWith("/login") ||
    cleanPath.startsWith("/register") ||
    cleanPath.startsWith("/forgot-password");
  const isPublicSharePage = cleanPath.startsWith("/s/");
  const isDashboardOrAppPage =
    cleanPath.startsWith("/dashboard") ||
    cleanPath.startsWith("/files") ||
    cleanPath.startsWith("/shared") ||
    cleanPath.startsWith("/transfers") ||
    cleanPath.startsWith("/storage") ||
    cleanPath.startsWith("/settings") ||
    cleanPath.startsWith("/support") ||
    cleanPath.startsWith("/admin");

  if (isAuthPage || isPublicSharePage || isDashboardOrAppPage) return null;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        backgroundColor: navBg,
        borderBottomColor: navBorder,
      }}
      className="sticky top-0 z-40 w-full backdrop-blur-[20px] backdrop-saturate-[180%] border-b transition-colors"
    >
      <div className="mx-auto flex h-12 max-w-[980px] items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <Logo size="sm" badge="" href="/" />

        {/* Desktop Navigation — Apple style: crisp contrast with tactile pill hover */}
        <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium">
          {!user ? (
            <>
              <Link
                href="/#product"
                className="px-3.5 py-1.5 rounded-full text-[#1d1d1f] hover:text-[#0071e3] hover:bg-[#0071e3]/8 active:scale-95 transition-all duration-150"
              >
                {t.navbar.product}
              </Link>
              <Link
                href="/#how-it-works"
                className="px-3.5 py-1.5 rounded-full text-[#1d1d1f] hover:text-[#0071e3] hover:bg-[#0071e3]/8 active:scale-95 transition-all duration-150"
              >
                {t.navbar.howItWorks}
              </Link>
              <Link
                href="/#security"
                className="px-3.5 py-1.5 rounded-full text-[#1d1d1f] hover:text-[#0071e3] hover:bg-[#0071e3]/8 active:scale-95 transition-all duration-150"
              >
                {t.navbar.security}
              </Link>
              <Link
                href="/pricing"
                className="px-3.5 py-1.5 rounded-full text-[#1d1d1f] hover:text-[#0071e3] hover:bg-[#0071e3]/8 active:scale-95 transition-all duration-150"
              >
                {t.navbar.pricing || "Fiyatlandırma"}
              </Link>
              <Link
                href="/support"
                className="px-3.5 py-1.5 rounded-full text-[#1d1d1f] hover:text-[#0071e3] hover:bg-[#0071e3]/8 active:scale-95 transition-all duration-150"
              >
                {t.navbar.support || "Destek"}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  cleanPath === "/dashboard"
                    ? "text-[#0071e3] font-medium"
                    : "text-[#1d1d1f]/80 hover:text-[#1d1d1f]"
                }`}
              >
                {t.navbar.dashboard}
              </Link>
              <Link
                href="/files"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  cleanPath === "/files"
                    ? "text-[#0071e3] font-medium"
                    : "text-[#1d1d1f]/80 hover:text-[#1d1d1f]"
                }`}
              >
                {t.navbar.files}
              </Link>
              <Link
                href="/shared"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  cleanPath === "/shared"
                    ? "text-[#0071e3] font-medium"
                    : "text-[#1d1d1f]/80 hover:text-[#1d1d1f]"
                }`}
              >
                {t.navbar.shared}
              </Link>
              <Link
                href="/transfers"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  cleanPath === "/transfers"
                    ? "text-[#0071e3] font-medium"
                    : "text-[#1d1d1f]/80 hover:text-[#1d1d1f]"
                }`}
              >
                {t.navbar.transfers}
              </Link>
              <Link
                href="/pricing"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  cleanPath === "/pricing"
                    ? "text-[#0071e3] font-medium"
                    : "text-[#1d1d1f]/80 hover:text-[#1d1d1f]"
                }`}
              >
                {t.navbar.pricing || "Fiyatlandırma"}
              </Link>
              <Link
                href="/support"
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  cleanPath.startsWith("/support")
                    ? "text-[#0071e3] font-medium"
                    : "text-[#1d1d1f]/80 hover:text-[#1d1d1f]"
                }`}
              >
                {t.navbar.support || "Destek"}
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / Auth controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {!user ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <span className="px-3 py-1.5 rounded-full text-[13px] text-[#0071e3] hover:text-[#005bb5] hover:bg-blue-50/80 cursor-pointer font-semibold transition-all">
                  {t.navbar.login}
                </span>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="gap-1.5 text-[12px] h-8 px-4 rounded-full font-semibold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all">
                  <span>{t.navbar.getStarted}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-[#d2d2d7] bg-white/80 p-0.5 pr-3 hover:border-[#86868b] transition-all cursor-pointer"
              >
                <UserAvatar user={user} size="sm" className="ring-1 ring-[#0071e3]/30" />
                <span className="text-[12px] font-medium text-[#1d1d1f]">{user.displayName}</span>
              </button>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#d2d2d7] bg-white/95 p-2 shadow-xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#e8e8ed] mb-1">
                    <p className="text-xs font-medium text-[#1d1d1f] truncate">{user.displayName}</p>
                    <p className="text-[11px] text-[#86868b] truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
                  >
                    <Layers className="h-3.5 w-3.5 text-[#0071e3]" />
                    <span>{t.navbar.dashboard}</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-[#86868b]" />
                    <span>{t.navbar.settings}</span>
                  </Link>

                  <button
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await logout();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#ff3b30] hover:bg-red-50 transition-colors mt-1 cursor-pointer"
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[#1d1d1f]/70 hover:text-[#1d1d1f] cursor-pointer"
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden overflow-hidden border-b border-[#d2d2d7]/50 bg-white/95 px-4 py-4 space-y-3 backdrop-blur-xl"
        >
          {!user ? (
            <div className="flex flex-col gap-1 text-sm font-normal text-[#1d1d1f]">
              <Link
                href="/#product"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors"
              >
                {t.navbar.product}
              </Link>
              <Link
                href="/#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors"
              >
                {t.navbar.howItWorks}
              </Link>
              <Link
                href="/#security"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors"
              >
                {t.navbar.security}
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors"
              >
                {t.navbar.pricing || "Fiyatlandırma"}
              </Link>
              <Link
                href="/support"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors"
              >
                {t.navbar.support || "Destek"}
              </Link>
              <Link
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors"
              >
                {t.navbar.faq}
              </Link>
              <div className="pt-3 flex flex-col gap-2 border-t border-[#e8e8ed] mt-2">
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
            <div className="flex flex-col gap-1 text-sm font-normal text-[#1d1d1f]">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[#f5f5f7] mb-1 border border-[#e8e8ed]">
                <UserAvatar user={user} size="sm" />
                <div className="truncate">
                  <p className="font-medium text-xs text-[#1d1d1f]">{user.displayName}</p>
                  <p className="text-[10px] text-[#86868b] truncate">{user.email}</p>
                </div>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors"
              >
                {t.navbar.dashboard}
              </Link>
              <Link
                href="/files"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors"
              >
                {t.navbar.files}
              </Link>
              <Link
                href="/shared"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors"
              >
                {t.navbar.sharedLinks}
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors"
              >
                {t.navbar.pricing || "Fiyatlandırma"}
              </Link>
              <Link
                href="/support"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors"
              >
                {t.navbar.support || "Destek"}
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl hover:bg-[#f5f5f7] transition-colors"
              >
                {t.navbar.settings}
              </Link>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await logout();
                }}
                className="flex items-center gap-2 px-3 py-2.5 text-left text-sm text-[#ff3b30] hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.navbar.logout}</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>
    </motion.header>
  );
};
