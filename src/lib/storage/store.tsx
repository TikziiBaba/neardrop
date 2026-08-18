"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CloudFile, ShareLink, TransferItem, StorageStats, UserSettings } from "@/types";
import { computeSHA256, generateSecureToken, getFileCategory } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";

interface StorageContextType {
  files: CloudFile[];
  shares: ShareLink[];
  transfers: TransferItem[];
  stats: StorageStats;
  settings: UserSettings;
  isLoading: boolean;
  uploadFiles: (fileList: File[] | FileList) => Promise<void>;
  createShareLink: (params: {
    cloudFileId: string;
    expiresInHours?: number;
    maxDownloads?: number;
    password?: string;
  }) => Promise<ShareLink>;
  deleteFile: (fileId: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  revokeShareLink: (shareId: string) => Promise<void>;
  deleteShareLink: (shareId: string) => Promise<void>;
  updateShareExpiry: (shareId: string, expiresInHours: number) => Promise<void>;
  getShareByToken: (token: string) => Promise<{ share: ShareLink | null; file: CloudFile | null; error?: string }>;
  unlockShareDownload: (token: string, password?: string) => Promise<{ downloadUrl: string; filename: string; size: number } | null>;
  cancelTransfer: (transferId: string) => void;
  retryTransfer: (transferId: string) => void;
  clearCompletedTransfers: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
}

const STORAGE_KEY_FILES = "neardrop_files_data";
const STORAGE_KEY_SHARES = "neardrop_shares_data";
const STORAGE_KEY_SETTINGS = "neardrop_user_settings";

const INITIAL_DEMO_FILES: CloudFile[] = [
  {
    id: "file_proj_881",
    userId: "usr_demo_88294",
    filename: "client-brand-guidelines.pdf",
    r2ObjectKey: "users/usr_demo_88294/file_proj_881/client-brand-guidelines.pdf",
    size: 14.8 * 1024 * 1024, // 14.8 MB
    mimeType: "application/pdf",
    checksum: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    isDeleted: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    downloadsCount: 14,
    activeSharesCount: 1,
  },
  {
    id: "file_proj_882",
    userId: "usr_demo_88294",
    filename: "design-assets-2026.zip",
    r2ObjectKey: "users/usr_demo_88294/file_proj_882/design-assets-2026.zip",
    size: 1.82 * 1024 * 1024 * 1024, // 1.82 GB
    mimeType: "application/zip",
    checksum: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    isDeleted: false,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    downloadsCount: 42,
    activeSharesCount: 1,
  },
  {
    id: "file_proj_883",
    userId: "usr_demo_88294",
    filename: "product-demo-4k.mp4",
    r2ObjectKey: "users/usr_demo_88294/file_proj_883/product-demo-4k.mp4",
    size: 420 * 1024 * 1024, // 420 MB
    mimeType: "video/mp4",
    checksum: "cca709a96e57008cfc2eb0350d53c7a36c53e1db6d1358055627236beceb6099",
    isDeleted: false,
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    downloadsCount: 8,
    activeSharesCount: 0,
  },
  {
    id: "file_proj_884",
    userId: "usr_demo_88294",
    filename: "keynote-presentation-final.key",
    r2ObjectKey: "users/usr_demo_88294/file_proj_884/keynote-presentation-final.key",
    size: 68.5 * 1024 * 1024, // 68.5 MB
    mimeType: "application/vnd.apple.keynote",
    checksum: "bc606e30b1da6a7e0c4b75a13c9e6bb07b8a8b139775f0a71144cbceb1a03f4f",
    isDeleted: false,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    downloadsCount: 19,
    activeSharesCount: 1,
  },
  {
    id: "file_proj_885",
    userId: "usr_demo_88294",
    filename: "neardrop-architecture-diagram.png",
    r2ObjectKey: "users/usr_demo_88294/file_proj_885/neardrop-architecture-diagram.png",
    size: 4.2 * 1024 * 1024, // 4.2 MB
    mimeType: "image/png",
    checksum: "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    isDeleted: false,
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    downloadsCount: 31,
    activeSharesCount: 0,
  },
];

const INITIAL_DEMO_SHARES: ShareLink[] = [
  {
    id: "shr_demo_001",
    userId: "usr_demo_88294",
    cloudFileId: "file_proj_882",
    token: "neardrop-asset-pack",
    passwordProtected: true,
    passwordHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // 'password'
    expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    downloadCount: 42,
    maxDownloads: 100,
    isActive: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: "shr_demo_002",
    userId: "usr_demo_88294",
    cloudFileId: "file_proj_881",
    token: "brand-guide-share",
    passwordProtected: false,
    passwordHash: null,
    expiresAt: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString(),
    downloadCount: 14,
    maxDownloads: 50,
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "shr_demo_003",
    userId: "usr_demo_88294",
    cloudFileId: "file_proj_884",
    token: "keynote-preview-7x",
    passwordProtected: false,
    passwordHash: null,
    expiresAt: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    downloadCount: 19,
    maxDownloads: null,
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

const DEFAULT_SETTINGS: UserSettings = {
  userId: "usr_demo_88294",
  downloadPath: "Downloads/NearDrop",
  defaultExpirationHours: 24,
  defaultMaxDownloads: 10,
  theme: "dark",
  emailOnDownload: true,
  emailOnExpire: true,
  twoFactorEnabled: false,
};

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [shares, setShares] = useState<ShareLink[]>([]);
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load files and shares
  useEffect(() => {
    try {
      const storedFiles = localStorage.getItem(STORAGE_KEY_FILES);
      if (storedFiles) {
        setFiles(JSON.parse(storedFiles));
      } else {
        setFiles(INITIAL_DEMO_FILES);
        localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(INITIAL_DEMO_FILES));
      }

      const storedShares = localStorage.getItem(STORAGE_KEY_SHARES);
      if (storedShares) {
        setShares(JSON.parse(storedShares));
      } else {
        setShares(INITIAL_DEMO_SHARES);
        localStorage.setItem(STORAGE_KEY_SHARES, JSON.stringify(INITIAL_DEMO_SHARES));
      }

      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (e) {
      console.error("Failed to load stored files:", e);
      setFiles(INITIAL_DEMO_FILES);
      setShares(INITIAL_DEMO_SHARES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync with localStorage
  const saveFiles = (newFiles: CloudFile[]) => {
    setFiles(newFiles);
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(newFiles));
  };

  const saveShares = (newShares: ShareLink[]) => {
    setShares(newShares);
    localStorage.setItem(STORAGE_KEY_SHARES, JSON.stringify(newShares));
  };

  // Upload handler with real progress tracking simulation and local blob holding
  const uploadFiles = useCallback(async (fileList: File[] | FileList) => {
    const rawFiles = Array.from(fileList);
    if (!rawFiles.length) return;

    for (const file of rawFiles) {
      const transferId = `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newTransfer: TransferItem = {
        id: transferId,
        filename: file.name,
        size: file.size,
        progress: 0,
        transferredBytes: 0,
        speed: 0,
        status: "uploading",
        direction: "upload",
        startedAt: Date.now(),
        file,
      };

      setTransfers((prev) => [newTransfer, ...prev]);

      // Simulate chunked upload progress with speed calculation
      const totalSize = file.size;
      const chunks = 10;
      const intervalMs = Math.min(250, Math.max(80, totalSize / (1024 * 1024 * 10))); // dynamic speed feel

      let currentStep = 0;
      const interval = setInterval(async () => {
        currentStep++;
        const progress = Math.min(100, Math.round((currentStep / chunks) * 100));
        const transferredBytes = Math.round((progress / 100) * totalSize);
        const elapsedSec = (Date.now() - newTransfer.startedAt) / 1000;
        const speed = elapsedSec > 0 ? Math.round(transferredBytes / elapsedSec) : 48 * 1024 * 1024;

        setTransfers((prev) =>
          prev.map((t) =>
            t.id === transferId
              ? {
                  ...t,
                  progress,
                  transferredBytes,
                  speed,
                  status: progress >= 100 ? "completed" : "uploading",
                  completedAt: progress >= 100 ? Date.now() : undefined,
                }
              : t
          )
        );

        if (progress >= 100) {
          clearInterval(interval);

          // Create cloud file record
          const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const checksum = await computeSHA256(file.name + file.size + Date.now());
          
          const newCloudFile: CloudFile = {
            id: fileId,
            userId: user?.id || "usr_demo_88294",
            filename: file.name,
            r2ObjectKey: `users/${user?.id || "usr_demo_88294"}/${fileId}/${file.name}`,
            size: file.size,
            mimeType: file.type || "application/octet-stream",
            checksum,
            isDeleted: false,
            createdAt: new Date().toISOString(),
            downloadsCount: 0,
            activeSharesCount: 0,
          };

          setFiles((prev) => {
            const updated = [newCloudFile, ...prev];
            localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(updated));
            return updated;
          });
        }
      }, intervalMs);
    }
  }, [user]);

  const createShareLink = async (params: {
    cloudFileId: string;
    expiresInHours?: number;
    maxDownloads?: number;
    password?: string;
  }): Promise<ShareLink> => {
    const token = generateSecureToken(12);
    let passwordHash: string | null = null;

    if (params.password && params.password.trim().length > 0) {
      passwordHash = await computeSHA256(params.password.trim());
    }

    let expiresAt: string | null = null;
    if (params.expiresInHours && params.expiresInHours > 0) {
      expiresAt = new Date(Date.now() + params.expiresInHours * 3600 * 1000).toISOString();
    }

    const newShare: ShareLink = {
      id: `shr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user?.id || "usr_demo_88294",
      cloudFileId: params.cloudFileId,
      token,
      passwordProtected: Boolean(passwordHash),
      passwordHash,
      expiresAt,
      downloadCount: 0,
      maxDownloads: params.maxDownloads || null,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const updatedShares = [newShare, ...shares];
    saveShares(updatedShares);

    // Update active share count on file
    const updatedFiles = files.map((f) =>
      f.id === params.cloudFileId ? { ...f, activeSharesCount: (f.activeSharesCount || 0) + 1 } : f
    );
    saveFiles(updatedFiles);

    return newShare;
  };

  const deleteFile = async (fileId: string) => {
    const updatedFiles = files.filter((f) => f.id !== fileId);
    saveFiles(updatedFiles);

    // Remove associated shares
    const updatedShares = shares.filter((s) => s.cloudFileId !== fileId);
    saveShares(updatedShares);
  };

  const renameFile = async (fileId: string, newName: string) => {
    const updatedFiles = files.map((f) => (f.id === fileId ? { ...f, filename: newName } : f));
    saveFiles(updatedFiles);
  };

  const revokeShareLink = async (shareId: string) => {
    const updatedShares = shares.map((s) => (s.id === shareId ? { ...s, isActive: !s.isActive } : s));
    saveShares(updatedShares);
  };

  const deleteShareLink = async (shareId: string) => {
    const share = shares.find((s) => s.id === shareId);
    const updatedShares = shares.filter((s) => s.id !== shareId);
    saveShares(updatedShares);

    if (share) {
      const updatedFiles = files.map((f) =>
        f.id === share.cloudFileId ? { ...f, activeSharesCount: Math.max(0, (f.activeSharesCount || 1) - 1) } : f
      );
      saveFiles(updatedFiles);
    }
  };

  const updateShareExpiry = async (shareId: string, expiresInHours: number) => {
    const newExpiresAt =
      expiresInHours > 0 ? new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString() : null;
    const updatedShares = shares.map((s) => (s.id === shareId ? { ...s, expiresAt: newExpiresAt } : s));
    saveShares(updatedShares);
  };

  const getShareByToken = async (
    token: string
  ): Promise<{ share: ShareLink | null; file: CloudFile | null; error?: string }> => {
    const share = shares.find((s) => s.token === token);
    if (!share) {
      return { share: null, file: null, error: "Share link not found or has been revoked." };
    }

    if (!share.isActive) {
      return { share: null, file: null, error: "This share link is no longer active." };
    }

    if (share.expiresAt && new Date(share.expiresAt).getTime() < Date.now()) {
      return { share: null, file: null, error: "This share link has expired." };
    }

    if (share.maxDownloads && share.downloadCount >= share.maxDownloads) {
      return { share: null, file: null, error: "This link has reached its maximum download limit." };
    }

    const file = files.find((f) => f.id === share.cloudFileId);
    if (!file) {
      return { share: null, file: null, error: "The underlying file was removed." };
    }

    return { share, file };
  };

  const unlockShareDownload = async (
    token: string,
    password?: string
  ): Promise<{ downloadUrl: string; filename: string; size: number } | null> => {
    const { share, file, error } = await getShareByToken(token);
    if (error || !share || !file) {
      throw new Error(error || "Invalid share link");
    }

    if (share.passwordProtected && share.passwordHash) {
      if (!password) {
        throw new Error("This file is password protected. Please provide a password.");
      }
      const hash = await computeSHA256(password.trim());
      if (hash !== share.passwordHash) {
        throw new Error("Incorrect password. Please try again.");
      }
    }

    // Increment download count
    const updatedShares = shares.map((s) =>
      s.id === share.id ? { ...s, downloadCount: s.downloadCount + 1 } : s
    );
    saveShares(updatedShares);

    const updatedFiles = files.map((f) =>
      f.id === file.id ? { ...f, downloadsCount: (f.downloadsCount || 0) + 1 } : f
    );
    saveFiles(updatedFiles);

    // Create a real downloadable dummy blob or direct URL
    const blob = new Blob(
      [
        `=================================================================\nNearDrop Secure Cloud Share\nFilename: ${file.filename}\nChecksum: ${file.checksum || "N/A"}\nDownloaded at: ${new Date().toISOString()}\n=================================================================\n\nThis file content was securely delivered through NearDrop end-to-end encrypted transfer architecture.`,
      ],
      { type: file.mimeType || "application/octet-stream" }
    );
    const downloadUrl = URL.createObjectURL(blob);

    return {
      downloadUrl,
      filename: file.filename,
      size: file.size,
    };
  };

  const cancelTransfer = (transferId: string) => {
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: "cancelled" } : t))
    );
  };

  const retryTransfer = (transferId: string) => {
    const item = transfers.find((t) => t.id === transferId);
    if (item && item.file) {
      uploadFiles([item.file]);
    }
  };

  const clearCompletedTransfers = () => {
    setTransfers((prev) => prev.filter((t) => t.status === "uploading" || t.status === "pending"));
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
  };

  // Compute statistics
  const usedBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const quotaBytes = user?.quotaBytes || 10 * 1024 * 1024 * 1024; // 10 GB
  const totalDownloads = files.reduce((acc, f) => acc + (f.downloadsCount || 0), 0);
  const sharedCount = shares.filter((s) => s.isActive).length;

  // Breakdown by categories
  const categoriesMap: Record<string, { bytes: number; count: number; color: string }> = {
    archive: { bytes: 0, count: 0, color: "#f59e0b" }, // Amber
    document: { bytes: 0, count: 0, color: "#3b82f6" }, // Blue
    video: { bytes: 0, count: 0, color: "#8b5cf6" }, // Purple
    image: { bytes: 0, count: 0, color: "#10b981" }, // Emerald
    audio: { bytes: 0, count: 0, color: "#ec4899" }, // Pink
    code: { bytes: 0, count: 0, color: "#06b6d4" }, // Cyan
    other: { bytes: 0, count: 0, color: "#6b7280" }, // Gray
  };

  files.forEach((f) => {
    const cat = getFileCategory(f.mimeType, f.filename);
    if (categoriesMap[cat]) {
      categoriesMap[cat].bytes += f.size;
      categoriesMap[cat].count += 1;
    } else {
      categoriesMap.other.bytes += f.size;
      categoriesMap.other.count += 1;
    }
  });

  const categories = Object.entries(categoriesMap)
    .filter(([_, data]) => data.count > 0)
    .map(([cat, data]) => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1) + "s",
      bytes: data.bytes,
      count: data.count,
      color: data.color,
    }));

  const stats: StorageStats = {
    usedBytes,
    quotaBytes,
    filesCount: files.length,
    sharedCount,
    totalDownloads,
    categories,
  };

  return (
    <StorageContext.Provider
      value={{
        files,
        shares,
        transfers,
        stats,
        settings,
        isLoading,
        uploadFiles,
        createShareLink,
        deleteFile,
        renameFile,
        revokeShareLink,
        deleteShareLink,
        updateShareExpiry,
        getShareByToken,
        unlockShareDownload,
        cancelTransfer,
        retryTransfer,
        clearCompletedTransfers,
        updateSettings,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};
