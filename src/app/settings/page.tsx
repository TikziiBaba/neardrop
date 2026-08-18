"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth/context";
import { useStorage } from "@/lib/storage/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User,
  Shield,
  HardDrive,
  Palette,
  Bell,
  KeyRound,
  Check,
  Save,
  Moon,
  Sun,
  Laptop,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { settings, updateSettings } = useStorage();

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.displayName || "Bekir");
  const [email, setEmail] = useState(user?.email || "bekir@neardrop.dev");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");

  // Preferences
  const [defaultExpiry, setDefaultExpiry] = useState<number>(settings.defaultExpirationHours || 24);
  const [defaultMaxDl, setDefaultMaxDl] = useState<number>(settings.defaultMaxDownloads || 10);
  const [emailOnDl, setEmailOnDl] = useState<boolean>(settings.emailOnDownload);
  const [emailOnExp, setEmailOnExp] = useState<boolean>(settings.emailOnExpire);
  const [themePreference, setThemePreference] = useState<"dark" | "light" | "system">(settings.theme || "dark");

  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage your account preferences, default sharing parameters, and notifications.
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1.5 mb-6">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-3.5 w-3.5" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="storage" className="gap-2">
              <HardDrive className="h-3.5 w-3.5" />
              <span>Defaults</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-3.5 w-3.5" />
              <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-3.5 w-3.5" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-3.5 w-3.5" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>

          {/* 1. Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-semibold text-white">Profile Information</h3>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="flex items-center gap-4">
                  <img
                    src={
                      avatarUrl ||
                      user?.avatarUrl ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                    }
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-sky-500/40"
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white">Profile Photo</p>
                    <p className="text-[11px] text-zinc-400">Paste an image URL below to update.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Avatar URL</label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Display Name</label>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Email Address</label>
                  <Input type="email" value={email} disabled className="opacity-60 cursor-not-allowed" />
                  <p className="text-[10px] text-zinc-500">Contact admin to change primary account email.</p>
                </div>

                <Button type="submit" variant="primary" disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* 2. Defaults / Storage Tab */}
          <TabsContent value="storage" className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-semibold text-white">Default Sharing Preferences</h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Default Link Lifespan (hours)
                  </label>
                  <select
                    value={defaultExpiry}
                    onChange={(e) => setDefaultExpiry(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value={1}>1 hour</option>
                    <option value={24}>24 hours (1 day)</option>
                    <option value={168}>168 hours (7 days)</option>
                    <option value={720}>720 hours (30 days)</option>
                    <option value={0}>Never expire</option>
                  </select>
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
                  />
                  <p className="text-[10px] text-zinc-500">
                    Default cap on how many times a newly created link can be downloaded.
                  </p>
                </div>

                <Button variant="primary" onClick={handleSavePreferences} className="gap-2">
                  <Save className="h-4 w-4" />
                  <span>Save Defaults</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* 3. Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-semibold text-white">Theme Selection</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: "dark", label: "Dark Mode", desc: "Default dark-first palette", icon: Moon },
                  { id: "light", label: "Light Mode", desc: "Crisp bright clean interface", icon: Sun },
                  { id: "system", label: "System Sync", desc: "Follows OS appearance", icon: Laptop },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = themePreference === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleThemeChange(item.id as any)}
                      className={`cursor-pointer rounded-2xl border p-5 space-y-3 transition-all ${
                        isSelected
                          ? "border-sky-500 bg-sky-500/10 text-white"
                          : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={`h-5 w-5 ${isSelected ? "text-sky-400" : "text-zinc-500"}`} />
                        {isSelected && <Check className="h-4 w-4 text-sky-400" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-white">{item.label}</h4>
                        <p className="text-[11px] text-zinc-500">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* 4. Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-semibold text-white">Email & Activity Alerts</h3>

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

                <Button variant="primary" onClick={handleSavePreferences} className="gap-2 mt-4">
                  <Save className="h-4 w-4" />
                  <span>Update Notification Settings</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* 5. Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-semibold text-white">Security & Active Sessions</h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">Current Session</p>
                    <p className="text-[11px] text-zinc-400">
                      Windows • Chrome / Edge • Active now
                    </p>
                  </div>
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Danger Zone</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Permanently delete your account and all associated files stored in Cloudflare R2.
                  </p>
                  <Button variant="destructive" size="sm" className="mt-2 text-xs">
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
