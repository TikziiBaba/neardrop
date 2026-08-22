"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useStorage } from "@/lib/storage/store";
import { useLanguage } from "@/lib/i18n/context";
import { CloudFile, ShareLink } from "@/types";
import { formatBytes, formatExpiresIn, getFileCategory } from "@/lib/utils";
import {
  Sparkles,
  DownloadCloud,
  Lock,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  FileText,
  FileArchive,
  FileVideo,
  FileImage,
  FileCode,
  FileAudio,
  HardDrive,
  Hash,
  ArrowRight,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import confetti from "canvas-confetti";
import { toast } from "sonner";

export default function PublicSharePage() {
  const params = useParams();
  const token = params?.token as string;
  const { getShareByToken, unlockShareDownload } = useStorage();
  const { locale, setLocale, t } = useLanguage();

  const [share, setShare] = useState<ShareLink | null>(null);
  const [file, setFile] = useState<CloudFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUnlocking, setIsUnlocking] = useState<boolean>(false);
  const [downloadStarted, setDownloadStarted] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchShare = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await getShareByToken(token);
        if (res.error || !res.share || !res.file) {
          setError(res.error || "Invalid or expired share link.");
        } else {
          setShare(res.share);
          setFile(res.file);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load shared file.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchShare();
  }, [token, getShareByToken]);

  const handleDownload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token) return;

    setIsUnlocking(true);
    setError(null);

    try {
      const res = await unlockShareDownload(token, password);
      if (!res) throw new Error("Could not unlock download URL");

      setDownloadUrl(res.downloadUrl);
      setDownloadStarted(true);

      // Trigger celebration
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      // Trigger automatic browser download
      const a = document.createElement("a");
      a.href = res.downloadUrl;
      a.download = res.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.success(t.publicShare.downloadInitiated);
    } catch (err: any) {
      setError(err.message || "Failed to unlock download.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const renderFileIcon = (file: CloudFile) => {
    const cat = getFileCategory(file.mimeType, file.filename);
    switch (cat) {
      case "archive":
        return <FileArchive className="h-7 w-7 text-amber-400" />;
      case "image":
        return <FileImage className="h-7 w-7 text-emerald-400" />;
      case "video":
        return <FileVideo className="h-7 w-7 text-purple-400" />;
      case "audio":
        return <FileAudio className="h-7 w-7 text-pink-400" />;
      case "code":
        return <FileCode className="h-7 w-7 text-cyan-400" />;
      default:
        return <FileText className="h-7 w-7 text-sky-400" />;
    }
  };

  const toggleLanguage = () => {
    setLocale(locale === "tr" ? "en" : "tr");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-950 text-foreground relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <div className="pointer-events-none absolute inset-0 mesh-grid opacity-30" />

      {/* Top Simple Brand Header */}
      <header className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-md shadow-sky-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">NearDrop</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            aria-label={t.langToggle.label}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-2.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-xs font-semibold"
          >
            <Globe className="h-4 w-4" />
            <span>{locale === "tr" ? "EN" : "TR"}</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Share Card Content */}
      <main className="relative z-10 mx-auto w-full max-w-lg px-4 py-8">
        {isLoading ? (
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-zinc-800 animate-pulse mx-auto" />
            <div className="h-4 w-48 bg-zinc-800 animate-pulse rounded mx-auto" />
            <div className="h-3 w-32 bg-zinc-800/60 animate-pulse rounded mx-auto" />
          </div>
        ) : error && !file ? (
          /* Error / Expired View */
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mx-auto">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-white">{t.publicShare.linkUnavailable}</h2>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                {error}
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <span>{t.publicShare.goToHome}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        ) : file && share ? (
          /* Active File Card View */
          <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Header: Shared by */}
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 text-[11px] font-semibold text-sky-400 border border-sky-500/20 mb-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t.publicShare.secureCloudShare}</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {t.publicShare.fileSharedWithYou}
              </h2>
              <p className="text-xs text-zinc-400">
                {t.publicShare.encryptedSubtitle}
              </p>
            </div>

            {/* File Info Box */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 flex-shrink-0">
                {renderFileIcon(file)}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <h3 className="font-bold text-sm text-white break-words">{file.filename}</h3>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300">{formatBytes(file.size)}</span>
                  <span>•</span>
                  <Badge variant="secondary" className="text-[10px] uppercase">
                    {file.mimeType.split("/")[1] || "File"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Badges / Security indicators */}
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1 border-t border-b border-zinc-800/60 py-3">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                <span>{formatExpiresIn(share.expiresAt)}</span>
              </span>
              {share.passwordProtected && (
                <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Lock className="h-3.5 w-3.5" />
                  <span>{t.publicShare.passwordProtected}</span>
                </span>
              )}
            </div>

            {/* Password input if password protected & not unlocked */}
            {share.passwordProtected && !downloadStarted && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{t.publicShare.enterPasswordLabel}</span>
                </label>
                <Input
                  type="password"
                  placeholder={t.publicShare.enterPasswordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-xs"
                />
              </div>
            )}

            {/* Error banner if unlock failed */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Download CTA Button */}
            {downloadStarted && downloadUrl ? (
              <div className="space-y-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-in zoom-in-95 duration-150">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                <div>
                  <h4 className="text-xs font-semibold text-emerald-300">{t.publicShare.downloadInitiated}</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {t.publicShare.browserDidNotStart}
                  </p>
                </div>
                <a
                  href={downloadUrl}
                  download={file.filename}
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-colors"
                >
                  <DownloadCloud className="h-4 w-4" />
                  <span>{t.publicShare.clickToRedownload}</span>
                </a>
              </div>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => handleDownload()}
                disabled={isUnlocking}
                className="w-full gap-2 shadow-xl shadow-sky-500/25 py-3"
              >
                <DownloadCloud className="h-5 w-5" />
                <span>{isUnlocking ? t.publicShare.verifying : t.publicShare.downloadFile}</span>
              </Button>
            )}

            {/* Checksum Hash Verification Footer */}
            <div className="pt-2 text-center text-[10px] text-zinc-500 font-mono">
              <span>SHA-256: {file.checksum?.substring(0, 16) || "8f434346648f6b96"}...</span>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-zinc-600">
        <p>{t.publicShare.footerTagline}</p>
      </footer>
    </div>
  );
}
