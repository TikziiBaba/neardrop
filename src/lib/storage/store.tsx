"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { CloudFile, ShareLink, TransferItem, StorageStats, UserSettings } from "@/types";
import { getFileCategory } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";

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
  downloadFile: (fileId: string) => Promise<void>;
  cancelTransfer: (transferId: string) => void;
  retryTransfer: (transferId: string) => void;
  clearCompletedTransfers: () => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  refreshFiles: () => Promise<void>;
}

const STORAGE_KEY_SETTINGS = "neardrop_user_settings";

const DEFAULT_SETTINGS: UserSettings = {
  userId: "",
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

  const supabase = useMemo(() => createClient(), []);

  // Helper to obtain fresh Bearer token
  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    if (!supabase) return {};
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch (e) {
      console.error("Auth session fetch error:", e);
    }
    return {};
  }, [supabase]);

  // Fetch files from Supabase via API
  const fetchFiles = useCallback(async () => {
    if (!user) return;
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/files", {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files || []);
      }
    } catch (e) {
      console.error("Failed to fetch files:", e);
    }
  }, [user, getAuthHeaders]);

  // Fetch shares from Supabase via API
  const fetchShares = useCallback(async () => {
    if (!user) return;
    try {
      const authHeaders = await getAuthHeaders();
      const res = await fetch("/api/shares", {
        headers: authHeaders,
      });
      if (res.ok) {
        const data = await res.json();
        setShares(data.shares || []);
      }
    } catch (e) {
      console.error("Failed to fetch shares:", e);
    }
  }, [user, getAuthHeaders]);

  // Refresh all data
  const refreshFiles = useCallback(async () => {
    await Promise.all([fetchFiles(), fetchShares()]);
  }, [fetchFiles, fetchShares]);

  // Load data on user change
  useEffect(() => {
    if (!user) {
      setFiles([]);
      setShares([]);
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      await refreshFiles();

      // Load local settings
      try {
        const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      }

      setIsLoading(false);
    };

    loadData();
  }, [user, refreshFiles]);

  // Upload handler with R2 presigned URL and auto fallback to direct upload
  const uploadFiles = useCallback(async (fileList: File[] | FileList) => {
    const rawFiles = Array.from(fileList);
    if (!rawFiles.length || !user) return;

    const authHeaders = await getAuthHeaders();

    for (const file of rawFiles) {
      const fullFilename = (file as any).relativePath || file.webkitRelativePath || file.name;
      const transferId = `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newTransfer: TransferItem = {
        id: transferId,
        filename: fullFilename,
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

      try {
        let uploadSucceeded = false;

        // Step 1: Try Presigned R2 URL first
        try {
          const apiRes = await fetch("/api/upload", {
            method: "POST",
            headers: {
              ...authHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filename: fullFilename,
              size: file.size,
              mimeType: file.type || "application/octet-stream",
            }),
          });

          if (apiRes.ok) {
            const { uploadUrl } = await apiRes.json();

            // Try direct XHR PUT to presigned R2 URL
            await new Promise<void>((resolve, reject) => {
              const xhr = new XMLHttpRequest();

              xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                  const progress = Math.round((e.loaded / e.total) * 100);
                  const elapsedSec = (Date.now() - newTransfer.startedAt) / 1000;
                  const speed = elapsedSec > 0 ? Math.round(e.loaded / elapsedSec) : 0;

                  setTransfers((prev) =>
                    prev.map((t) =>
                      t.id === transferId
                        ? { ...t, progress, transferredBytes: e.loaded, speed }
                        : t
                    )
                  );
                }
              });

              xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  uploadSucceeded = true;
                  resolve();
                } else {
                  reject(new Error(`Presigned upload status ${xhr.status}`));
                }
              });

              xhr.addEventListener("error", () => reject(new Error("Network / CORS error on presigned upload")));
              xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

              xhr.open("PUT", uploadUrl);
              xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
              xhr.send(file);
            });
          }
        } catch (presignedErr) {
          console.warn("Direct R2 presigned upload failed, attempting direct proxy upload fallback...", presignedErr);
        }

        // Step 2: If direct R2 PUT failed (e.g. CORS not configured yet), fallback to server proxy
        if (!uploadSucceeded) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("filename", fullFilename);

          const fallbackRes = await fetch("/api/upload", {
            method: "POST",
            headers: authHeaders,
            body: formData,
          });

          if (!fallbackRes.ok) {
            const errData = await fallbackRes.json();
            throw new Error(errData.error || "Upload failed");
          }

          uploadSucceeded = true;
        }

        // Mark transfer completed
        setTransfers((prev) =>
          prev.map((t) =>
            t.id === transferId
              ? { ...t, progress: 100, transferredBytes: file.size, status: "completed", completedAt: Date.now() }
              : t
          )
        );

        // Refresh file list from DB
        await fetchFiles();

      } catch (err: any) {
        console.error("Upload error:", err);
        setTransfers((prev) =>
          prev.map((t) =>
            t.id === transferId
              ? { ...t, status: "failed", errorMessage: err.message }
              : t
          )
        );
        throw err; // Propagate to DropZone for user alert
      }
    }
  }, [user, fetchFiles, getAuthHeaders]);

  const createShareLink = async (params: {
    cloudFileId: string;
    expiresInHours?: number;
    maxDownloads?: number;
    password?: string;
  }): Promise<ShareLink> => {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/shares", {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to create share link");
    }

    const newShare = await res.json();
    await fetchShares();
    await fetchFiles();
    return newShare;
  };

  const deleteFile = async (fileId: string) => {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/files", {
      method: "DELETE",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to delete file");
    }

    // Optimistic update
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setShares((prev) => prev.filter((s) => s.cloudFileId !== fileId));
  };

  const renameFile = async (fileId: string, newName: string) => {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/files", {
      method: "PATCH",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId, filename: newName }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to rename file");
    }

    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, filename: newName } : f)));
  };

  const revokeShareLink = async (shareId: string) => {
    const share = shares.find((s) => s.id === shareId);
    if (!share) return;

    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/shares", {
      method: "PATCH",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shareId, isActive: !share.isActive }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to toggle share");
    }

    setShares((prev) =>
      prev.map((s) => (s.id === shareId ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const deleteShareLink = async (shareId: string) => {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/shares", {
      method: "DELETE",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shareId }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to delete share");
    }

    setShares((prev) => prev.filter((s) => s.id !== shareId));
    await fetchFiles();
  };

  const updateShareExpiry = async (shareId: string, expiresInHours: number) => {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/shares", {
      method: "PATCH",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ shareId, expiresInHours }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to update expiry");
    }

    const newExpiresAt =
      expiresInHours > 0 ? new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString() : null;
    setShares((prev) =>
      prev.map((s) => (s.id === shareId ? { ...s, expiresAt: newExpiresAt } : s))
    );
  };

  const getShareByToken = async (
    token: string
  ): Promise<{ share: ShareLink | null; file: CloudFile | null; error?: string }> => {
    try {
      const res = await fetch(`/api/download?token=${encodeURIComponent(token)}`);

      if (!res.ok) {
        const errData = await res.json();
        return { share: null, file: null, error: errData.error };
      }

      const data = await res.json();
      return {
        share: data.share,
        file: data.file,
      };
    } catch (err: any) {
      return { share: null, file: null, error: err.message };
    }
  };

  const unlockShareDownload = async (
    token: string,
    password?: string
  ): Promise<{ downloadUrl: string; filename: string; size: number } | null> => {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Download failed");
    }

    return await res.json();
  };

  const downloadFile = async (fileId: string) => {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/files/download", {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Download failed");
    }

    const { downloadUrl, filename } = await res.json();
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
    archive: { bytes: 0, count: 0, color: "#f59e0b" },
    document: { bytes: 0, count: 0, color: "#3b82f6" },
    video: { bytes: 0, count: 0, color: "#8b5cf6" },
    image: { bytes: 0, count: 0, color: "#10b981" },
    audio: { bytes: 0, count: 0, color: "#ec4899" },
    code: { bytes: 0, count: 0, color: "#06b6d4" },
    other: { bytes: 0, count: 0, color: "#6b7280" },
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
        downloadFile,
        cancelTransfer,
        retryTransfer,
        clearCompletedTransfers,
        updateSettings,
        refreshFiles,
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
