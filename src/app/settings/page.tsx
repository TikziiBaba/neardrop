"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth/context";
import { useStorage } from "@/lib/storage/store";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  User,
  Shield,
  HardDrive,
  Palette,
  Bell,
  Check,
  Save,
  Moon,
  Sun,
  Laptop,
  AlertTriangle,
  Upload,
  Sparkles,
  CreditCard,
  LifeBuoy,
  ShieldCheck,
  Zap,
  ArrowRight,
  Volume2,
} from "lucide-react";
import { SoundManager } from "@/lib/utils/sound-effects";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { settings, updateSettings } = useStorage();

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  // Preferences
  const [defaultExpiry, setDefaultExpiry] = useState<number>(settings.defaultExpirationHours || 24);
  const [defaultMaxDl, setDefaultMaxDl] = useState<number>(settings.defaultMaxDownloads || 10);
  const [emailOnDl, setEmailOnDl] = useState<boolean>(settings.emailOnDownload);
  const [emailOnExp, setEmailOnExp] = useState<boolean>(settings.emailOnExpire);
  const [soundEffects, setSoundEffects] = useState<boolean>(SoundManager.isEnabled());
  const [themePreference, setThemePreference] = useState<"dark" | "light" | "system">(settings.theme || "dark");

  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be under 5 MB");
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("userId", user.id);

    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
        await updateProfile({ avatarUrl: data.avatarUrl });
        toast.success("Profile photo uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload avatar");
      }
    } catch (err: any) {
      toast.error(err.message || "Avatar upload error");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        displayName,
        avatarUrl,
      });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = () => {
    updateSettings({
      defaultExpirationHours: defaultExpiry,
      defaultMaxDownloads: defaultMaxDl,
      emailOnDownload: emailOnDl,
      emailOnExpire: emailOnExp,
      theme: themePreference,
    });
    toast.success("Settings saved!");
  };

  const handleThemeChange = (theme: "dark" | "light" | "system") => {
    setThemePreference(theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    updateSettings({ theme });
    toast.info(`Theme set to ${theme}`);
  };

  const usagePercent = user
    ? Math.min(100, Math.round((user.usedBytes / (user.quotaBytes || 1)) * 100))
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Account Settings</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your personal profile, subscription tier, default share parameters, and security sessions.
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1.5 mb-6">
            <TabsTrigger value="profile" className="gap-2 text-xs">
              <User className="h-3.5 w-3.5" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2 text-xs">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Subscription & Plans</span>
            </TabsTrigger>
            <TabsTrigger value="storage" className="gap-2 text-xs">
              <HardDrive className="h-3.5 w-3.5" />
              <span>Share Defaults</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 text-xs">
              <Bell className="h-3.5 w-3.5" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 text-xs">
              <Shield className="h-3.5 w-3.5" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          {/* 1. Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6 apple-card">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Profile Information</h3>
                {user?.role === "admin" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-400 border border-purple-500/20">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Administrator
                  </span>
                ) : user?.role === "moderator" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2.5 py-0.5 text-xs font-bold text-sky-400 border border-sky-500/20">
                    Staff / Support
                  </span>
                ) : user?.role === "premium" ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                    <Zap className="h-3.5 w-3.5" />
                    Premium Member
                  </span>
                ) : (
                  <span className="rounded-md bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-400">
                    Standard Member
                  </span>
                )}
              </div>

              {/* Avatar File Uploader */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80">
                <div className="relative group flex-shrink-0">
                  <UserAvatar
                    src={avatarUrl || user?.avatarUrl}
                    user={user}
                    size="2xl"
                    className="ring-2 ring-purple-500/40"
                  />
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-[10px] text-white font-bold">
                      Uploading...
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">Avatar Photo</h4>
                    <p className="text-[11px] text-zinc-400">
                      Upload a PNG, JPG, or WEBP photo directly from your device (Max 5 MB).
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileSelect}
                    accept="image/*"
                    className="hidden"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        SoundManager.play("click");
                        fileInputRef.current?.click();
                      }}
                      disabled={isUploadingAvatar}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-xs text-zinc-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 backdrop-blur-md shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer select-none disabled:opacity-50"
                    >
                      <Upload className="h-3.5 w-3.5 text-sky-400" />
                      <span>{isUploadingAvatar ? "Uploading..." : "Upload New Photo"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Display Name</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="rounded-xl text-xs bg-zinc-950/60"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Email Address</label>
                  <Input
                    value={email}
                    disabled
                    className="rounded-xl text-xs bg-zinc-950/40 text-zinc-400 cursor-not-allowed"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                  className="gap-2 text-xs rounded-xl bg-purple-600 hover:bg-purple-500"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSaving ? "Saving..." : "Save Profile"}</span>
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* 2. Subscription & Plans Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6 apple-card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-5">
                <div>
                  <h3 className="text-sm font-bold text-white">Current Subscription Tier</h3>
                  <p className="text-xs text-zinc-400">
                    Manage storage quota, billing intervals, and upgrades.
                  </p>
                </div>

                <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-bold text-purple-400 border border-purple-500/30 uppercase tracking-wider">
                  {user?.subscriptionTier ? `${user.subscriptionTier.toUpperCase()} PLAN` : "FREE STARTER"}
                </span>
              </div>

              {/* Storage bar */}
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-5 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-purple-400" />
                    <span className="font-bold text-white">Total Quota</span>
                    <span className="text-zinc-400 font-mono">
                      ({formatBytes(user?.usedBytes || 0)} / {formatBytes(user?.quotaBytes || 2147483648)})
                    </span>
                  </div>
                  <span className="font-bold text-purple-400">{usagePercent}% Used</span>
                </div>

                <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    style={{ width: `${usagePercent}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-purple-500 transition-all"
                  />
                </div>
              </div>

              {/* Upgrade CTA banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-zinc-900 to-zinc-950 border border-purple-500/30">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                    <span>Expand to 100 GB, 500 GB, or 2 TB Storage</span>
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Unlock permanent link lifetimes, cryptographic passwords, and 24/7 dedicated support.
                  </p>
                </div>

                <Link href="/pricing" className="flex-shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs rounded-xl bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 gap-1.5"
                  >
                    <span>View Pricing Plans</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          {/* 3. Storage Defaults Tab */}
          <TabsContent value="storage" className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6 apple-card">
              <h3 className="text-sm font-bold text-white">Default Sharing Parameters</h3>

              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Default Link Lifespan (Hours)
                  </label>
                  <Input
                    type="number"
                    value={defaultExpiry}
                    onChange={(e) => setDefaultExpiry(Number(e.target.value))}
                    min={1}
                    max={720}
                    className="rounded-xl text-xs bg-zinc-950/60"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Newly uploaded share links will automatically expire after this duration.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Default Max Downloads Limit
                  </label>
                  <Input
                    type="number"
                    value={defaultMaxDl}
                    onChange={(e) => setDefaultMaxDl(Number(e.target.value))}
                    min={1}
                    max={1000}
                    className="rounded-xl text-xs bg-zinc-950/60"
                  />
                  <p className="text-[10px] text-zinc-500">
                    Default cap on how many times a newly created link can be downloaded.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Volume2 className="h-3.5 w-3.5 text-pink-400" />
                      <span>Audio & Haptic Feedback</span>
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Play subtle Apple-style sound effects on file upload, completion, and interactions.
                    </p>
                  </div>
                  <Switch
                    checked={soundEffects}
                    onCheckedChange={(checked) => {
                      setSoundEffects(checked);
                      SoundManager.setEnabled(checked);
                      if (checked) SoundManager.play("chime");
                    }}
                  />
                </div>

                <Button
                  variant="primary"
                  onClick={() => {
                    handleSavePreferences();
                    SoundManager.setEnabled(soundEffects);
                  }}
                  className="gap-2 text-xs rounded-xl"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Defaults</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* 4. Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6 apple-card">
              <h3 className="text-sm font-bold text-white">Email & Activity Alerts</h3>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">Download Notifications</p>
                    <p className="text-[11px] text-zinc-400">
                      Receive an alert when someone downloads one of your shared links.
                    </p>
                  </div>
                  <Switch checked={emailOnDl} onCheckedChange={setEmailOnDl} />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">Link Expiration Warning</p>
                    <p className="text-[11px] text-zinc-400">
                      Get notified when a shared link is about to expire.
                    </p>
                  </div>
                  <Switch checked={emailOnExp} onCheckedChange={setEmailOnExp} />
                </div>

                <Button variant="primary" onClick={handleSavePreferences} className="gap-2 mt-4 text-xs rounded-xl">
                  <Save className="h-3.5 w-3.5" />
                  <span>Update Notification Settings</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* 6. Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6 apple-card">
              <h3 className="text-sm font-bold text-white">Security & Support</h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">Support & Assistance</p>
                    <p className="text-[11px] text-zinc-400">
                      Open a support ticket for technical or account inquiries.
                    </p>
                  </div>
                  <Link href="/support">
                    <Button variant="outline" size="sm" className="text-xs rounded-xl">
                      Open Helpdesk
                    </Button>
                  </Link>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Danger Zone</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Permanently delete your account and all associated files stored in your cloud storage.
                  </p>
                  <Button variant="destructive" size="sm" className="mt-2 text-xs rounded-xl">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
