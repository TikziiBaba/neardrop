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
import { LanguageToggle } from "@/components/layout/LanguageToggle";

const spring = { type: "spring" as const, bounce: 0.15, duration: 0.5 };

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t, locale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { scrollY } = useScroll();

  /* Yüzen cam hap — kaydırdıkça koyulaşır */
  const navBg = useTransform(
    scrollY,
    [0, 60],
    ["rgba(13, 26, 48, 0.45)", "rgba(7, 16, 36, 0.86)"]
  );
  const navBorder = useTransform(
    scrollY,
    [0, 60],
    ["rgba(98, 220, 245, 0.14)", "rgba(98, 220, 245, 0.26)"]
  );

  const cleanPath = pathname.replace(/^\/(tr|en)/, "") || "/";

  const isAuthPage =
    cleanPath.startsWith("/login") ||
    cleanPath.startsWith("/register") ||
    cleanPath.startsWith("/forgot-password");
  const isPublicSharePage = cleanPath.startsWith("/s/");
  const isDashboardOrAppPage = user
    ? (
        cleanPath.startsWith("/dashboard") ||
        cleanPath.startsWith("/files") ||
        cleanPath.startsWith("/shared") ||
        cleanPath.startsWith("/transfers") ||
        cleanPath.startsWith("/storage") ||
        cleanPath.startsWith("/settings") ||
        cleanPath.startsWith("/support") ||
        cleanPath.startsWith("/admin")
      )
    : (
        cleanPath.startsWith("/dashboard") ||
        cleanPath.startsWith("/files") ||
        cleanPath.startsWith("/shared") ||
        cleanPath.startsWith("/storage") ||
        cleanPath.startsWith("/settings") ||
        cleanPath.startsWith("/admin")
      );

  if (isAuthPage || isPublicSharePage || isDashboardOrAppPage) return null;

  const navLinkClass =
    "whitespace-nowrap px-3.5 py-2 rounded-full text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] active:scale-95 transition-all duration-200";

  const navLinkActiveClass =
    "whitespace-nowrap px-3.5 py-2 rounded-full text-[13px] font-semibold text-foreground bg-accent/20 ring-1 ring-inset ring-accent/40";

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 w-full px-3 pt-3 sm:px-4"
    >
      <motion.div
        style={{ backgroundColor: navBg, borderColor: navBorder }}
        className="mx-auto flex h-14 max-w-5xl items-center justify-between rounded-full border pl-4 pr-2 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-2xl backdrop-saturate-150"
      >
        {/* Logo */}
        <Logo size="sm" badge="" href="/" />

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {!user ? (
            <>
              <Link href="/#overview" className={navLinkClass}>
                {locale === "tr" ? "Genel Bakış" : "Overview"}
              </Link>
              <Link href="/#how" className={navLinkClass}>
                {t.navbar.howItWorks}
              </Link>
              <Link href="/#security" className={navLinkClass}>
                {t.navbar.security}
              </Link>
              <Link href="/#compare" className={navLinkClass}>
                {locale === "tr" ? "Karşılaştırma" : "Compare"}
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
        <div className="hidden lg:flex items-center gap-2.5">
          <LanguageToggle size="sm" />
          {!user ? (
            <div className="flex items-center gap-1.5">
              <Link href="/login">
                <span className="whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] text-accent-text hover:text-accent-text hover:bg-accent/15 cursor-pointer font-medium transition-all">
                  {t.navbar.login}
                </span>
              </Link>
              <Link href="/register">
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5 text-[13px] h-10 px-5 rounded-full shadow-lg shadow-accent/30"
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
                className="flex items-center gap-2 rounded-full border border-border bg-surface/80 p-0.5 pr-3 hover:border-border-strong transition-all cursor-pointer"
              >
                <UserAvatar user={user} size="sm" className="ring-1 ring-accent/20" />
                <span className="text-[12px] font-medium text-foreground">
                  {user.displayName}
                </span>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-border bg-surface/95 p-2 shadow-2xl backdrop-blur-xl z-50"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-border/80 mb-1">
                    <p className="text-xs font-medium text-foreground truncate">
                      {user.displayName}
                    </p>
                    <p className="text-[11px] text-subtle/70 truncate">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                  >
                    <Layers className="h-3.5 w-3.5 text-accent-text" />
                    <span>{t.navbar.dashboard}</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-subtle/70" />
                    <span>{t.navbar.settings}</span>
                  </Link>

                  <button
                    onClick={async () => {
                      setUserDropdownOpen(false);
                      await logout();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs text-danger hover:bg-danger/10 transition-colors mt-1 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t.navbar.logout}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobil menü düğmesi ve dil */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle size="sm" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Menü"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden mx-auto mt-2 max-w-5xl overflow-hidden rounded-3xl border border-border bg-background/90 px-3 py-3 space-y-3 shadow-2xl backdrop-blur-2xl"
          >
            {!user ? (
              <div className="flex flex-col gap-0.5 text-sm text-foreground">
                <Link href="/#overview" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {locale === "tr" ? "Genel Bakış" : "Overview"}
                </Link>
                <Link href="/#how" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {t.navbar.howItWorks}
                </Link>
                <Link href="/#security" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {t.navbar.security}
                </Link>
                <Link href="/#compare" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {locale === "tr" ? "Karşılaştırma" : "Compare"}
                </Link>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {t.navbar.pricing || "Fiyatlandırma"}
                </Link>
                <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {t.navbar.support || "Destek"}
                </Link>
                <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {t.navbar.faq}
                </Link>
                <div className="pt-3 flex flex-col gap-2 border-t border-border/60 mt-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">{t.navbar.login}</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">{t.navbar.getStarted}</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5 text-sm text-foreground">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-surface mb-1 border border-border/60">
                  <UserAvatar user={user} size="sm" />
                  <div className="truncate">
                    <p className="font-medium text-xs">{user.displayName}</p>
                    <p className="text-[10px] text-subtle/70 truncate">{user.email}</p>
                  </div>
                </div>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {t.navbar.dashboard}
                </Link>
                <Link href="/files" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {t.navbar.files}
                </Link>
                <Link href="/shared" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {t.navbar.sharedLinks}
                </Link>
                <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {t.navbar.pricing || "Fiyatlandırma"}
                </Link>
                <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {t.navbar.support || "Destek"}
                </Link>
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-surface transition-colors">
                  {t.navbar.settings}
                </Link>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await logout();
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 text-left text-sm text-danger hover:bg-danger/10 rounded-xl transition-colors cursor-pointer"
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
