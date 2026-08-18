export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  quotaBytes: number;
  usedBytes: number;
  createdAt: string;
  updatedAt: string;
}

export interface CloudFile {
  id: string;
  userId: string;
  filename: string;
  r2ObjectKey: string;
  size: number;
  mimeType: string;
  checksum?: string;
  isDeleted: boolean;
  createdAt: string;
  expiresAt?: string | null;
  downloadsCount?: number;
  activeSharesCount?: number;
}

export interface ShareLink {
  id: string;
  userId: string;
  cloudFileId: string;
  token: string;
  passwordProtected: boolean;
  passwordHash?: string | null;
  expiresAt?: string | null;
  downloadCount: number;
  maxDownloads?: number | null;
  isActive: boolean;
  createdAt: string;
  cloudFile?: CloudFile;
}

export interface TransferItem {
  id: string;
  filename: string;
  size: number;
  progress: number; // 0 - 100
  transferredBytes: number;
  speed: number; // bytes per second
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled';
  direction: 'upload' | 'download';
  errorMessage?: string;
  startedAt: number;
  completedAt?: number;
  file?: File;
  shareToken?: string;
}

export interface StorageStats {
  usedBytes: number;
  quotaBytes: number;
  filesCount: number;
  sharedCount: number;
  totalDownloads: number;
  categories: {
    category: string;
    bytes: number;
    count: number;
    color: string;
  }[];
}

export interface UserSettings {
  userId: string;
  downloadPath?: string;
  defaultExpirationHours?: number;
  defaultMaxDownloads?: number;
  theme: 'dark' | 'light' | 'system';
  emailOnDownload: boolean;
  emailOnExpire: boolean;
  twoFactorEnabled?: boolean;
}
