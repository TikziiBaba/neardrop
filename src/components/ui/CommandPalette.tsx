"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  FolderOpen,
  Upload,
  Share2,
  Settings,
  Moon,
  Sun,
  Zap,
  LayoutDashboard,
  HardDrive,
  ArrowRight,
  Command,
  CornerDownLeft,
  History,
  Wifi,
  CreditCard,
  LifeBuoy,
  Shield,
  LogOut,
} from "lucide-react";
import { useStorage } from "@/lib/storage/store";
import { useAuth } from "@/lib/auth/context";
import { SoundManager } from "@/lib/utils/sound-effects";
import { formatBytes } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  category: "navigation" | "action" | "file" | "settings";
  keywords: string[];
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { files } = useStorage();
  const { user, logout } = useAuth();

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Auto focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      SoundManager.play("click");
    }
  }, [open]);

  // Build command list
  const commands = useMemo<CommandItem[]>(() => {
    const nav: CommandItem[] = [
      {
        id: "nav-dashboard",
        label: "Dashboard",
        sublabel: "Overview & quick stats",
        icon: <LayoutDashboard className="h-4 w-4" />,
        category: "navigation",
        keywords: ["dashboard", "home", "overview", "anasayfa"],
        action: () => router.push("/dashboard"),
      },
      {
        id: "nav-files",
        label: "My Files",
        sublabel: "Browse & manage uploaded files",
        icon: <FolderOpen className="h-4 w-4" />,
        category: "navigation",
        keywords: ["files", "documents", "browse", "dosyalar"],
        action: () => router.push("/files"),
      },
      {
        id: "nav-shared",
        label: "Shared Links",
        sublabel: "Manage share links & QR codes",
        icon: <Share2 className="h-4 w-4" />,
        category: "navigation",
        keywords: ["shared", "links", "share", "paylaşım"],
        action: () => router.push("/shared"),
      },
      {
        id: "nav-transfers",
        label: "Direct Transfer",
        sublabel: "P2P LAN file transfer",
        icon: <Wifi className="h-4 w-4" />,
        category: "navigation",
        keywords: ["transfer", "p2p", "lan", "direct", "aktarım"],
        action: () => router.push("/transfers"),
      },
      {
        id: "nav-storage",
        label: "Storage",
        sublabel: "Quota & analytics",
        icon: <HardDrive className="h-4 w-4" />,
        category: "navigation",
        keywords: ["storage", "quota", "disk", "depolama"],
        action: () => router.push("/storage"),
      },
      {
        id: "nav-settings",
        label: "Settings",
        sublabel: "Account, theme & preferences",
        icon: <Settings className="h-4 w-4" />,
        category: "navigation",
        keywords: ["settings", "preferences", "account", "ayarlar"],
        action: () => router.push("/settings"),
      },
      {
        id: "nav-pricing",
        label: "Upgrade Plan",
        sublabel: "Pro, Ultra & Enterprise plans",
        icon: <CreditCard className="h-4 w-4" />,
        category: "navigation",
        keywords: ["pricing", "upgrade", "plan", "pro", "fiyat"],
        action: () => router.push("/pricing"),
      },
      {
        id: "nav-support",
        label: "Support",
        sublabel: "Help center & tickets",
        icon: <LifeBuoy className="h-4 w-4" />,
        category: "navigation",
        keywords: ["support", "help", "ticket", "destek"],
        action: () => router.push("/support"),
      },
    ];

    const actions: CommandItem[] = [
      {
        id: "action-upload",
        label: "Upload Files",
        sublabel: "Upload to cloud storage",
        icon: <Upload className="h-4 w-4 text-sky-400" />,
        category: "action",
        keywords: ["upload", "yükle", "add"],
        action: () => router.push("/files"),
      },
      {
        id: "action-signout",
        label: "Sign Out",
        sublabel: user?.email || "",
        icon: <LogOut className="h-4 w-4 text-red-400" />,
        category: "action",
        keywords: ["sign out", "logout", "çıkış"],
        action: () => logout(),
      },
    ];

    // File search results
    const fileItems: CommandItem[] = query.length >= 2
      ? files
          .filter((f) => f.filename.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 8)
          .map((f) => ({
            id: `file-${f.id}`,
            label: f.filename,
            sublabel: formatBytes(f.size),
            icon: <FileText className="h-4 w-4 text-zinc-400" />,
            category: "file" as const,
            keywords: [f.filename.toLowerCase()],
            action: () => router.push("/files"),
          }))
      : [];

    return [...nav, ...actions, ...fileItems];
  }, [files, query, router, user, logout]);

  // Filtered results
  const filtered = useMemo(() => {
    if (!query.trim()) return commands.filter((c) => c.category !== "file");
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.sublabel?.toLowerCase().includes(q) ||
        c.keywords.some((kw) => kw.includes(q))
    );
  }, [commands, query]);

  // Clamp selection index
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeSelected = useCallback(() => {
    const item = filtered[selectedIndex];
    if (item) {
      SoundManager.play("pop");
      SoundManager.haptic(10);
      item.action();
      setOpen(false);
    }
  }, [filtered, selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      executeSelected();
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    const selected = container.children[selectedIndex] as HTMLElement;
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Group results by category
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filtered]);

  const categoryLabels: Record<string, string> = {
    navigation: "Navigation",
    action: "Actions",
    file: "Files",
    settings: "Settings",
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="fixed left-1/2 top-[20%] z-[10000] w-full max-w-[560px] -translate-x-1/2"
          >
            <div className="liquid-glass-elevated rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
                <Search className="h-5 w-5 text-zinc-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search files, navigate, run actions..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
                <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800/60 rounded border border-zinc-700/50">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="max-h-[360px] overflow-y-auto py-2 scroll-smooth"
              >
                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-zinc-500">No results found</p>
                    <p className="text-xs text-zinc-600 mt-1">Try a different search term</p>
                  </div>
                )}

                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-4 pt-2 pb-1">
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                        {categoryLabels[category] || category}
                      </span>
                    </div>
                    {items.map((item) => {
                      const globalIndex = filtered.indexOf(item);
                      const isSelected = globalIndex === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            SoundManager.play("pop");
                            item.action();
                            setOpen(false);
                          }}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100 ${
                            isSelected
                              ? "bg-white/[0.08]"
                              : "hover:bg-white/[0.04]"
                          }`}
                        >
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                              isSelected
                                ? "bg-sky-500/20 text-sky-400"
                                : "bg-zinc-800/60 text-zinc-400"
                            }`}
                          >
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">
                              {item.label}
                            </p>
                            {item.sublabel && (
                              <p className="text-xs text-zinc-500 truncate">
                                {item.sublabel}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <CornerDownLeft className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Footer hints */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.06] text-[10px] text-zinc-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-zinc-800/60 rounded border border-zinc-700/50 font-mono">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-zinc-800/60 rounded border border-zinc-700/50 font-mono">↵</kbd>
                    Select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-zinc-800/60 rounded border border-zinc-700/50 font-mono">esc</kbd>
                    Close
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Command className="h-3 w-3" />K to toggle
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
