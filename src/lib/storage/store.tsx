"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CloudFile, ShareLink, TransferItem, StorageStats, UserSettings } from "@/types";
import { getFileCategory } from "@/lib/utils";
import { useAuth } from "@/lib/auth/context";
import { createClient } from "@/lib/supabase/client";
import { SoundManager } from "@/lib/utils/sound-effects";
import { toast } from "sonner";

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
    burnAfterRead?: boolean;
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
  saveFileContent: (fileId: string, content: string) => Promise<void>;
  downloadFolder: (folderPath: string) => Promise<void>;
  cancelTransfer: (transferId: string) => void;
  retryTransfer: (transferId: string) => void | Promise<void>;
  retryAllFailed: (folderGroup?: string) => Promise<void>;
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
  const activeFileIdsRef = useRef<Record<string, string>>({});
  const transfersRef = useRef<TransferItem[]>([]);

  useEffect(() => {
    transfersRef.current = transfers;
  }, [transfers]);

  // Core single item upload executor with retry, dynamic JWT, and quota cleanup
  const uploadSingleItem = useCallback(
    async (transferItem: TransferItem) => {
      const { id: transferId, file, filename: fullFilename } = transferItem;
      if (!file) return;

      const startedAt = Date.now();

      // Mark status as uploading
      setTransfers((prev) =>
        prev.map((t) =>
          t.id === transferId
            ? { ...t, status: "uploading", startedAt, errorMessage: undefined }
            : t
        )
      );

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
        } else if (file.size === 0) {
          setTransfers((prev) =>
            prev.map((t) =>
              t.id === transferId
                ? { ...t, progress: 99, transferredBytes: 0, speed: 0, eta: 0 }
                : t
            )
          );
        }
      };

      let currentFileId: string | null = null;
      let uploadUrl: string | null = null;
      let uploadSucceeded = false;
      let lastError: any = null;
      const MAX_RETRIES = 3;

      // Calculate sample & hash once
      let sha256 = "";
      let headerSample = "";
      try {
        if (file.size > 0) {
          const sampleSlice = file.slice(0, 65536);
          const sampleBuf = await sampleSlice.arrayBuffer();
          const sampleBytes = new Uint8Array(sampleBuf);
          let binary = "";
          for (let i = 0; i < sampleBytes.byteLength; i++) {
            binary += String.fromCharCode(sampleBytes[i]);
          }
          headerSample = btoa(binary);

          if (window.crypto?.subtle) {
            const hashBuf = await window.crypto.subtle.digest(
              "SHA-256",
              file.size <= 50 * 1024 * 1024 ? await file.arrayBuffer() : sampleBuf
            );
            const hashArray = Array.from(new Uint8Array(hashBuf));
            sha256 = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
          }
        } else {
          sha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
        }
      } catch (hashErr) {
        console.warn("Client hash calculation skipped:", hashErr);
      }

      // Step 1: Request Presigned URL (with retry on 429 or transient error)
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const authHeaders = await getAuthHeaders();
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
              sha256,
              headerSample,
            }),
          });

          if (apiRes.status === 429) {
            const errJson = await apiRes.json().catch(() => ({}));
            const delay = errJson.retryAfterMs || Math.min(1000 * Math.pow(2, attempt), 8000);
            console.warn(`Rate limit on presigned URL attempt ${attempt}, waiting ${delay}ms...`);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }

          if (apiRes.ok) {
            const data = await apiRes.json();
            uploadUrl = data.uploadUrl;
            currentFileId = data.fileId;
            if (data.fileId) {
              activeFileIdsRef.current[transferId] = data.fileId;
            }
            break; // Presigned URL successfully acquired!
          } else {
            const errData = await apiRes.json().catch(() => ({}));
            const errMsg = errData.error || `Upload initiation failed (${apiRes.status})`;
            if (
              errMsg.includes("quota") ||
              errMsg.includes("plan") ||
              errMsg.includes("Zararlı") ||
              errMsg.includes("Malware")
            ) {
              throw new Error(errMsg);
            }
            if (attempt < MAX_RETRIES) {
              await new Promise((r) => setTimeout(r, 1000 * attempt));
              continue;
            }
            throw new Error(errMsg);
          }
        } catch (presignedErr: any) {
          lastError = presignedErr;
          if (
            presignedErr?.message === "Upload cancelled" ||
            presignedErr?.message?.includes("quota") ||
            presignedErr?.message?.includes("plan") ||
            presignedErr?.message?.includes("Zararlı") ||
            presignedErr?.message?.includes("Malware")
          ) {
            break;
          }
        }
      }

      // Step 2: Direct XHR PUT to presigned R2 URL (with retry if network drops)
      if (uploadUrl && !uploadSucceeded && !lastError?.message?.includes("quota") && !lastError?.message?.includes("Zararlı")) {
        for (let putAttempt = 1; putAttempt <= MAX_RETRIES; putAttempt++) {
          try {
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

              xhr.open("PUT", uploadUrl!);
              xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
              xhr.send(file);
            });

            if (uploadSucceeded) {
              lastError = null;
              break;
            }
          } catch (putErr: any) {
            lastError = putErr;
            if (putErr?.message === "Upload cancelled") break;
            if (putAttempt < MAX_RETRIES) {
              console.warn(`XHR direct upload retry ${putAttempt}/${MAX_RETRIES} for ${fullFilename}...`);
              await new Promise((r) => setTimeout(r, 1000 * putAttempt));
            }
          }
        }
      }

      // Step 3: Fallback to server proxy upload for files (<= 100 MB) if direct upload failed
      if (!uploadSucceeded && file.size <= 100 * 1024 * 1024 && lastError?.message !== "Upload cancelled" && !lastError?.message?.includes("quota") && !lastError?.message?.includes("Zararlı")) {
        try {
          const authHeaders = await getAuthHeaders();
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

          if (uploadSucceeded) {
            lastError = null;
          }
        } catch (fallbackErr: any) {
          lastError = fallbackErr;
        }
      }

      delete activeXHRsRef.current[transferId];

      if (uploadSucceeded) {
        delete activeFileIdsRef.current[transferId];
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
                  errorMessage: undefined,
                }
              : t
          )
        );
      } else {
        const err = lastError;
        const isCancelled = err?.message === "Upload cancelled";
        console.error(`Upload permanently failed for ${fullFilename}:`, err);

        const isMalware = err?.message?.includes("Zararlı") || err?.message?.includes("Malware") || err?.message?.includes("threat");
        if (isMalware) {
          SoundManager.play("error");
          toast.error(err.message || "Zararlı dosya tespit edildi. Yükleme engellendi.", { duration: 6000 });
        }

        // Clean up aborted file DB record if exists
        const fileIdToClean = currentFileId || activeFileIdsRef.current[transferId];
        if (fileIdToClean) {
          delete activeFileIdsRef.current[transferId];
          getAuthHeaders().then((headers) => {
            fetch(`/api/upload?fileId=${fileIdToClean}`, {
              method: "DELETE",
              headers,
            }).catch((e) => console.warn("Failed to cleanup aborted file record:", e));
          });
        }

        setTransfers((prev) =>
          prev.map((t) =>
            t.id === transferId
              ? {
                  ...t,
                  status: isCancelled ? "cancelled" : "failed",
                  speed: 0,
                  eta: undefined,
                  errorMessage: err?.message || "Upload failed",
                }
              : t
          )
        );
      }
    },
    [getAuthHeaders]
  );

  // Concurrency pool runner (processes up to 3 files simultaneously)
  const runUploadQueue = useCallback(
    async (items: TransferItem[]) => {
      const queue = [...items];
      const CONCURRENCY_LIMIT = 3;
      const workerCount = Math.min(CONCURRENCY_LIMIT, queue.length);

      const worker = async () => {
        while (queue.length > 0) {
          const item = queue.shift();
          if (!item) break;
          await uploadSingleItem(item);
        }
      };

      await Promise.all(Array.from({ length: workerCount }, () => worker()));
      await fetchFiles();
    },
    [uploadSingleItem, fetchFiles]
  );

  // Upload handler for new files
  const uploadFiles = useCallback(
    async (fileList: File[] | FileList) => {
      const rawFiles = Array.from(fileList);
      if (!rawFiles.length || !user) return;

      // 1. Register all files into transfers state as "pending"
      const initialTransfers: TransferItem[] = rawFiles.map((file, idx) => {
        const fullFilename = (file as any).relativePath || file.webkitRelativePath || file.name;
        const transferId = `tr_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`;

        let folderGroup: string | undefined;
        const pathParts = fullFilename.split("/").filter(Boolean);
        if (pathParts.length > 1) {
          folderGroup = pathParts[0];
        }

        return {
          id: transferId,
          filename: fullFilename,
          size: file.size,
          progress: 0,
          transferredBytes: 0,
          speed: 0,
          eta: undefined,
          status: "pending",
          direction: "upload",
          startedAt: Date.now(),
          file,
          folderGroup,
        };
      });

      setTransfers((prev) => [...initialTransfers, ...prev]);

      // 2. Execute upload queue
      await runUploadQueue(initialTransfers);
    },
    [user, runUploadQueue]
  );

  const createShareLink = async (params: {
    cloudFileId?: string;
    folderPath?: string;
    title?: string;
    description?: string;
    expiresInHours?: number;
    maxDownloads?: number;
    password?: string;
    burnAfterRead?: boolean;
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
    SoundManager.play("success");
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

    SoundManager.play("error");
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

  const saveFileContent = async (fileId: string, content: string) => {
    const authHeaders = await getAuthHeaders();
    const res = await fetch("/api/files/save", {
      method: "PUT",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileId, content }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Save failed");
    }

    const { size } = await res.json();
    // Optimistic update file size
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, size } : f))
    );
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
    const fileId = activeFileIdsRef.current[transferId];
    if (fileId) {
      delete activeFileIdsRef.current[transferId];
      getAuthHeaders().then((headers) => {
        fetch(`/api/upload?fileId=${fileId}`, {
          method: "DELETE",
          headers,
        }).catch((e) => console.warn("Error cleaning up aborted file:", e));
      });
    }
    setTransfers((prev) =>
      prev.map((t) =>
        t.id === transferId
          ? { ...t, status: "cancelled", speed: 0, eta: undefined }
          : t
      )
    );
  };

  const retryTransfer = useCallback(
    async (transferId: string) => {
      const item = transfersRef.current.find((t) => t.id === transferId);
      if (!item || !item.file) return;

      // Refresh files & quota first in case storage quota was upgraded/freed
      fetchFiles().catch(() => {});

      setTransfers((prev) =>
        prev.map((t) =>
          t.id === transferId
            ? {
                ...t,
                status: "pending",
                progress: 0,
                transferredBytes: 0,
                speed: 0,
                eta: undefined,
                errorMessage: undefined,
              }
            : t
        )
      );

      await uploadSingleItem(item);
      await fetchFiles();
    },
    [uploadSingleItem, fetchFiles]
  );

  const retryAllFailed = useCallback(
    async (folderGroup?: string) => {
      const failedItems = transfersRef.current.filter(
        (t) =>
          (t.status === "failed" || t.status === "cancelled") &&
          Boolean(t.file) &&
          (!folderGroup || t.folderGroup === folderGroup)
      );

      if (failedItems.length === 0) return;

      // Refresh files & quota first in case storage quota was upgraded/freed
      fetchFiles().catch(() => {});

      setTransfers((prev) =>
        prev.map((t) => {
          const isTarget = failedItems.some((f) => f.id === t.id);
          if (isTarget) {
            return {
              ...t,
              status: "pending",
              progress: 0,
              transferredBytes: 0,
              speed: 0,
              eta: undefined,
              errorMessage: undefined,
            };
          }
          return t;
        })
      );

      await runUploadQueue(failedItems);
      await fetchFiles();
    },
    [runUploadQueue, fetchFiles]
  );

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
  const quotaBytes = user?.quotaBytes || 2 * 1024 * 1024 * 1024; // 2 GB (Free starter)
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
        saveFileContent,
        downloadFolder,
        cancelTransfer,
        retryTransfer,
        retryAllFailed,
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
