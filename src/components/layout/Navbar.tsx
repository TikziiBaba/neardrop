"use client";

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

const spring = { type: "spring" as const, bounce: 0.15, duration: 0.5 };

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t, locale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { scrollY } = useScroll();

  /* Frosted glass — opacity ramps with scroll */
  const navBg = useTransform(
    scrollY,
    [0, 50],
    ["rgba(10,10,12,0.72)", "rgba(10,10,12,0.92)"]
  );
  const navBorder = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255,255,255,0.06)", "rgba(255,255,255,0.12)"]
  );

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

  const navLinkClass =
    "px-3 py-1.5 rounded-full text-[13px] font-medium text-[var(--apple-text-primary)] hover:text-[var(--apple-blue)] hover:bg-[var(--apple-blue-light)] active:scale-95 transition-all duration-150";

  const navLinkActiveClass =
    "px-3 py-1.5 rounded-full text-[13px] font-medium text-[var(--apple-blue)]";

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
        {/* Logo */}
        <Logo size="sm" badge="" href="/" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {!user ? (
            <>
              <Link href="/#product" className={navLinkClass}>
                {t.navbar.product}
              </Link>
              <Link href="/#how-it-works" className={navLinkClass}>
                {t.navbar.howItWorks}
              </Link>
              <Link href="/#security" className={navLinkClass}>
                {t.navbar.security}
              </Link>
              <Link href="/pricing" className={navLinkClass}>
                {t.navbar.pricing || "Fiyatlandırma"}
              </Link>
              <Link href="/support" className={navLinkClass}>
                {t.navbar.support || "Destek"}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/dashboard"
                className={cleanPath === "/dashboard" ? navLinkActiveClass : navLinkClass}
              >
                {t.navbar.dashboard}
              </Link>
              <Link
                href="/files"
                className={cleanPath === "/files" ? navLinkActiveClass : navLinkClass}
              >
                {t.navbar.files}
              </Link>
              <Link
                href="/shared"
                className={cleanPath === "/shared" ? navLinkActiveClass : navLinkClass}
              >
                {t.navbar.shared}
              </Link>
              <Link
                href="/transfers"
                className={cleanPath === "/transfers" ? navLinkActiveClass : navLinkClass}
              >
                {t.navbar.transfers}
              </Link>
              <Link
                href="/pricing"
                className={cleanPath === "/pricing" ? navLinkActiveClass : navLinkClass}
              >
                {t.navbar.pricing || "Fiyatlandırma"}
              </Link>
              <Link
                href="/support"
                className={cleanPath.startsWith("/support") ? navLinkActiveClass : navLinkClass}
              >
                {t.navbar.support || "Destek"}
              </Link>
            </>
          )}
        </nav>

        {/* Right Controls */}
        <div className="hidden md:flex items-center gap-2">
          {!user ? (
            <div className="flex items-center gap-1.5">
              <Link href="/login">
                <span className="px-3 py-1.5 rounded-full text-[13px] text-[var(--apple-blue)] hover:text-[var(--apple-blue-hover)] hover:bg-[var(--apple-blue-light)] cursor-pointer font-medium transition-all">
                  {t.navbar.login}
                </span>
              </Link>
              <Link href="/register">
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5 text-[12px] h-8 px-4 rounded-full font-semibold shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
                >
                  <span>{t.navbar.getStarted}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 p-0.5 pr-3 hover:border-zinc-700 transition-all cursor-pointer"
              >
                <UserAvatar user={user} size="sm" className="ring-1 ring-blue-500/20" />
                <span className="text-[12px] font-medium text-[var(--apple-text-primary)]">
                  {user.displayName}
                </span>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-zinc-800 bg-zinc-900/95 p-2 shadow-2xl backdrop-blur-xl z-50"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
                    <p className="text-xs font-medium text-[var(--apple-text-primary)] truncate">
                      {user.displayName}
                    </p>
                    <p className="text-[11px] text-[var(--apple-text-quaternary)] truncate">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-bg)] transition-colors"
                  >
                    <Layers className="h-3.5 w-3.5 text-[var(--apple-blue)]" />
                    <span>{t.navbar.dashboard}</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] hover:bg-[var(--apple-bg)] transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-[var(--apple-text-quaternary)]" />
                    <span>{t.navbar.settings}</span>
                  </Link>

                  <button
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await logout();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--apple-red)] hover:bg-red-500/10 transition-colors mt-1 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t.navbar.logout}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[var(--apple-text-secondary)] hover:text-[var(--apple-text-primary)] cursor-pointer"
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden border-b border-[var(--apple-separator-light)] bg-[var(--apple-bg)]/95 px-4 py-4 space-y-3 backdrop-blur-xl"
          >
            {!user ? (
              <div className="flex flex-col gap-0.5 text-sm text-[var(--apple-text-primary)]">
                <Link href="/#product" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-[var(--apple-bg-elevated)] transition-colors">
                  {t.navbar.product}
                </Link>
                <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-[var(--apple-bg-elevated)] transition-colors">
                  {t.navbar.howItWorks}
                </Link>
                <Link href="/#security" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-[var(--apple-bg-elevated)] transition-colors">
                  {t.navbar.security}
                </Link>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-[var(--apple-bg-elevated)] transition-colors">
                  {t.navbar.pricing || "Fiyatlandırma"}
                </Link>
                <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-[var(--apple-bg-elevated)] transition-colors">
                  {t.navbar.support || "Destek"}
                </Link>
                <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-[var(--apple-bg-elevated)] transition-colors">
                  {t.navbar.faq}
                </Link>
                <div className="pt-3 flex flex-col gap-2 border-t border-[var(--apple-separator-light)] mt-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">{t.navbar.login}</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">{t.navbar.getStarted}</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 text-sm text-[var(--apple-text-primary)]">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--apple-bg-elevated)] mb-1 border border-[var(--apple-separator-light)]">
                  <UserAvatar user={user} size="sm" />
                  <div className="truncate">
                    <p className="font-medium text-xs">{user.displayName}</p>
                    <p className="text-[10px] text-[var(--apple-text-quaternary)] truncate">{user.email}</p>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-[var(--apple-bg-elevated)] transition-colors">
                  {t.navbar.dashboard}
                </Link>
                <Link href="/files" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-[var(--apple-bg-elevated)] transition-colors">
                  {t.navbar.files}
                </Link>
                <Link href="/shared" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-[var(--apple-bg-elevated)] transition-colors">
                  {t.navbar.sharedLinks}
                </Link>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-[var(--apple-bg-elevated)] transition-colors">
                  {t.navbar.pricing || "Fiyatlandırma"}
                </Link>
                <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-[var(--apple-bg-elevated)] transition-colors">
                  {t.navbar.support || "Destek"}
                </Link>
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-[var(--apple-bg-elevated)] transition-colors">
                  {t.navbar.settings}
                </Link>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 text-left text-sm text-[var(--apple-red)] hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
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
