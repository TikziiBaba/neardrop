"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CloudFile, ShareLink, TransferItem, StorageStats, UserSettings } from "@/types";
import { getFileCategory } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";

interface FilePreviewData {
  previewUrl: string;
  filename: string;
  size: number;
  mimeType: string;
  textContent: string | null;
  isTextFile: boolean;
}

interface StorageContextType {
  files: CloudFile[];
  shares: ShareLink[];
  transfers: TransferItem[];
  stats: StorageStats;
  settings: UserSettings;
  isLoading: boolean;
  uploadFiles: (fileList: File[] | FileList) => Promise<void>;
  createShareLink: (params: {
    cloudFileId?: string;
    folderPath?: string;
    title?: string;
    description?: string;
    expiresInHours?: number;
    maxDownloads?: number;
    password?: string;
  }) => Promise<ShareLink>;
  deleteFile: (fileId: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  revokeShareLink: (shareId: string) => Promise<void>;
  deleteShareLink: (shareId: string) => Promise<void>;
  updateShareExpiry: (shareId: string, expiresInHours: number) => Promise<void>;
  getShareByToken: (token: string) => Promise<{
    share: ShareLink | null;
    file: CloudFile | null;
    files?: CloudFile[];
    isFolder?: boolean;
    folderPath?: string;
    title?: string;
    description?: string;
    totalSize?: number;
    totalCount?: number;
    error?: string;
  }>;
  unlockShareDownload: (
    token: string,
    password?: string,
    fileId?: string
  ) => Promise<{ downloadUrl: string; filename: string; size: number } | null>;
  unlockFolderBatchDownload: (
    token: string,
    password?: string
  ) => Promise<{
    isFolder: boolean;
    folderName: string;
    items: {
      id: string;
      filename: string;
      fullPath: string;
      relativePath: string;
      size: number;
      mimeType: string;
      downloadUrl: string;
    }[];
  } | null>;
  downloadFile: (fileId: string) => Promise<void>;
  previewFile: (fileId: string) => Promise<FilePreviewData | null>;
  downloadFolder: (folderPath: string) => Promise<void>;
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

  const activeXHRsRef = useRef<Record<string, XMLHttpRequest>>({});

  // Upload handler with presigned URL and auto fallback to direct upload (both with full XHR progress)
  const uploadFiles = useCallback(async (fileList: File[] | FileList) => {
    const rawFiles = Array.from(fileList);
    if (!rawFiles.length || !user) return;

    const authHeaders = await getAuthHeaders();

    for (const file of rawFiles) {
      const fullFilename = (file as any).relativePath || file.webkitRelativePath || file.name;
      const transferId = `tr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const startedAt = Date.now();
      const newTransfer: TransferItem = {
        id: transferId,
        filename: fullFilename,
        size: file.size,
        progress: 0,
        transferredBytes: 0,
        speed: 0,
        eta: undefined,
        status: "uploading",
        direction: "upload",
        startedAt,
        file,
      };

      setTransfers((prev) => [newTransfer, ...prev]);

      const handleProgressEvent = (e: ProgressEvent) => {
        if (e.lengthComputable && e.total > 0) {
          const progress = Math.min(99, Math.max(1, Math.round((e.loaded / e.total) * 100)));
          const elapsedSec = (Date.now() - startedAt) / 1000;
          const speed = elapsedSec > 0 ? Math.round(e.loaded / elapsedSec) : 0;
          const remainingBytes = Math.max(0, e.total - e.loaded);
          const eta = speed > 0 ? Math.round(remainingBytes / speed) : undefined;

          setTransfers((prev) =>
            prev.map((t) =>
              t.id === transferId
                ? { ...t, progress, transferredBytes: e.loaded, speed, eta }
                : t
            )
          );
        }
      };

      try {
        let uploadSucceeded = false;

        // Step 1: Try Presigned URL first
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

            // Direct XHR PUT to presigned URL
            await new Promise<void>((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              activeXHRsRef.current[transferId] = xhr;

              xhr.upload.addEventListener("progress", handleProgressEvent);

              xhr.addEventListener("load", () => {
                delete activeXHRsRef.current[transferId];
                if (xhr.status >= 200 && xhr.status < 300) {
                  uploadSucceeded = true;
                  resolve();
                } else {
                  reject(new Error(`Direct storage upload returned status ${xhr.status}`));
                }
              });

              xhr.addEventListener("error", () => {
                delete activeXHRsRef.current[transferId];
                reject(new Error("Network connection error during direct upload"));
              });
              xhr.addEventListener("abort", () => {
                delete activeXHRsRef.current[transferId];
                reject(new Error("Upload cancelled"));
              });

              xhr.open("PUT", uploadUrl);
              xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
              xhr.send(file);
            });
          }
        } catch (presignedErr: any) {
          if (presignedErr?.message === "Upload cancelled") {
            throw presignedErr;
          }
          console.warn("Direct storage upload failed, falling back to secure tunnel upload...", presignedErr);
        }

        // Step 2: Fallback to server proxy upload with full progress tracking
        if (!uploadSucceeded) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("filename", fullFilename);

          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            activeXHRsRef.current[transferId] = xhr;

            xhr.upload.addEventListener("progress", handleProgressEvent);

            xhr.addEventListener("load", () => {
              delete activeXHRsRef.current[transferId];
              if (xhr.status >= 200 && xhr.status < 300) {
                uploadSucceeded = true;
                resolve();
              } else {
                try {
                  const data = JSON.parse(xhr.responseText);
                  reject(new Error(data.error || `Upload failed (${xhr.status})`));
                } catch {
                  reject(new Error(`Upload failed (${xhr.status})`));
                }
              }
            });

            xhr.addEventListener("error", () => {
              delete activeXHRsRef.current[transferId];
              reject(new Error("Network error during upload"));
            });
            xhr.addEventListener("abort", () => {
              delete activeXHRsRef.current[transferId];
              reject(new Error("Upload cancelled"));
            });

            xhr.open("POST", "/api/upload");
            if (authHeaders.Authorization) {
              xhr.setRequestHeader("Authorization", authHeaders.Authorization);
            }
            xhr.send(formData);
          });
        }

        // Mark transfer completed
        delete activeXHRsRef.current[transferId];
        setTransfers((prev) =>
          prev.map((t) =>
            t.id === transferId
              ? {
                  ...t,
                  progress: 100,
                  transferredBytes: file.size,
                  speed: 0,
                  eta: 0,
                  status: "completed",
                  completedAt: Date.now(),
                }
              : t
          )
        );

        // Refresh file list from DB
        await fetchFiles();

      } catch (err: any) {
        delete activeXHRsRef.current[transferId];
        const isCancelled = err?.message === "Upload cancelled";
        console.error("Upload error:", err);
        setTransfers((prev) =>
          prev.map((t) =>
            t.id === transferId
              ? {
                  ...t,
                  status: isCancelled ? "cancelled" : "failed",
                  speed: 0,
                  eta: undefined,
                  errorMessage: err.message,
                }
              : t
          )
        );
        if (!isCancelled) {
          throw err;
        }
      }
    }
  }, [user, fetchFiles, getAuthHeaders]);

  const createShareLink = async (params: {
    cloudFileId?: string;
    folderPath?: string;
    title?: string;
    description?: string;
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
  ): Promise<{
    share: ShareLink | null;
    file: CloudFile | null;
    files?: CloudFile[];
    isFolder?: boolean;
    folderPath?: string;
    title?: string;
    description?: string;
    totalSize?: number;
    totalCount?: number;
    error?: string;
  }> => {
    try {
      const res = await fetch(`/api/download?token=${encodeURIComponent(token)}`);

      if (!res.ok) {
        const errData = await res.json();
        return { share: null, file: null, error: errData.error };
      }

      const data = await res.json();
      return {
        share: data.share,
        file: data.file || null,
        files: data.files || undefined,
        isFolder: data.isFolder,
        folderPath: data.folderPath,
        title: data.title,
        description: data.description,
        totalSize: data.totalSize,
        totalCount: data.totalCount,
      };
    } catch (err: any) {
      return { share: null, file: null, error: err.message };
    }
  };

  const unlockShareDownload = async (
    token: string,
    password?: string,
    fileId?: string
  ): Promise<{ downloadUrl: string; filename: string; size: number } | null> => {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, fileId }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Download failed");
    }

    return await res.json();
  };

  const unlockFolderBatchDownload = async (
    token: string,
    password?: string
  ): Promise<{
    isFolder: boolean;
    folderName: string;
    items: {
      id: string;
      filename: string;
      fullPath: string;
      relativePath: string;
      size: number;
      mimeType: string;
      downloadUrl: string;
    }[];
  } | null> => {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, batch: true }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Batch download failed");
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

  const previewFile = async (fileId: string): Promise<FilePreviewData | null> => {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/files/preview", {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Preview failed");
    }

    return await res.json();
  };

  const downloadFolder = async (folderPath: string) => {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/files/folder-download", {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ folderPath }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Folder download failed");
    }

    const data = await res.json();
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();

    // Fetch each file and add to ZIP
    let completed = 0;
    const total = data.items.length;

    for (const item of data.items) {
      try {
        const fileRes = await fetch(item.downloadUrl);
        if (fileRes.ok) {
          const blob = await fileRes.blob();
          zip.file(item.relativePath, blob);
        }
        completed++;
      } catch (err) {
        console.error(`Failed to fetch file for ZIP: ${item.relativePath}`, err);
        completed++;
      }
    }

    // Generate ZIP and trigger download
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.folderName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const cancelTransfer = (transferId: string) => {
    if (activeXHRsRef.current[transferId]) {
      try {
        activeXHRsRef.current[transferId].abort();
      } catch (e) {
        console.warn("Error aborting XHR:", e);
      }
      delete activeXHRsRef.current[transferId];
    }
    setTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: "cancelled", speed: 0, eta: undefined }
          : t
      )
    );
  };

  const retryTransfer = (transferId: string) => {
    const item = transfers.find((t) => t.id === transferId);
    if (item && item.file) {
      uploadFiles([item.file]);
    }
  };

  const clearCompletedTransfers = () => {
    setTransfers((prev) =>
      prev.filter((t) => t.status === "uploading" || t.status === "pending")
    );
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
        unlockFolderBatchDownload,
        downloadFile,
        previewFile,
        downloadFolder,
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
