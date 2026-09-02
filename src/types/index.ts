export type UserRole = 'admin' | 'moderator' | 'premium' | 'member';
export type SubscriptionTier = 'free' | 'pro' | 'ultra' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trial';

export interface UserDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'laptop' | 'mobile' | 'tablet';
  platform: 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'web';
  browser?: string;
  ipAddress?: string;
  userAgent?: string;
  lastSeen: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  quotaBytes: number;
  usedBytes: number;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionRenewsAt?: string;
  status?: 'active' | 'suspended' | 'banned';
  isEmailVerified?: boolean;
  emailConfirmedAt?: string | null;
  lastIpAddress?: string;
  lastDevice?: string;
  lastBrowser?: string;
  lastPlatform?: string;
  lastCountry?: string;
  lastCity?: string;
  notes?: string;
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
  isEncrypted?: boolean;
  encryptionIv?: string;
  createdAt: string;
  expiresAt?: string | null;
  downloadsCount?: number;
  activeSharesCount?: number;
  userEmail?: string;
  userDisplayName?: string;
}

export interface ShareLink {
  id: string;
  userId: string;
  cloudFileId?: string;
  folderPath?: string;
  title?: string;
  description?: string;
  token: string;
  passwordProtected: boolean;
  passwordHash?: string | null;
  expiresAt?: string | null;
  downloadCount: number;
  maxDownloads?: number | null;
  isActive: boolean;
  burnAfterRead?: boolean;
  isEncrypted?: boolean;
  createdAt: string;
  cloudFile?: CloudFile;
  userEmail?: string;
  folderFilesCount?: number;
  folderTotalBytes?: number;
  isFolder?: boolean;
}

export interface DownloadEvent {
  id: string;
  shareLinkId?: string;
  cloudFileId?: string;
  userId?: string;
  downloaderIp?: string;
  country?: string;
  city?: string;
  browser?: string;
  os?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  referrer?: string;
  userAgent?: string;
  bytesDownloaded?: number;
  createdAt: string;
}

export interface TransferItem {
  id: string;
  filename: string;
  size: number;
  progress: number; // 0 - 100
  transferredBytes: number;
  speed: number; // bytes per second
  eta?: number; // estimated seconds remaining
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
  soundEnabled?: boolean;
  emailOnDownload: boolean;
  emailOnExpire: boolean;
  twoFactorEnabled?: boolean;
}

export interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  quotaBytes: number;
  quotaLabel: string;
  priceMonthly: number;
  priceYearly: number;
  popular?: boolean;
  badge?: string;
  features: string[];
}

export type TicketDepartment = 'technical' | 'billing' | 'storage' | 'general';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

export interface Ticket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole?: UserRole;
  title: string;
  department: TicketDepartment;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  lastReplyAt?: string;
  messagesCount?: number;
  assignedTo?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  isStaff: boolean;
  attachments?: {
    filename: string;
    url: string;
    size?: number;
  }[];
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalFiles: number;
  totalStorageBytes: number;
  totalQuotaBytes: number;
  totalShares: number;
  activeShares: number;
  totalDownloads: number;
  totalBandwidthBytes: number;
  r2Status: 'healthy' | 'degraded' | 'error';
  supabaseStatus: 'healthy' | 'degraded' | 'error';
  dailyActivity: {
    date: string;
    uploads: number;
    downloads: number;
    bytes: number;
  }[];
  storageDistribution: {
    category: string;
    count: number;
    bytes: number;
    percentage: number;
    color: string;
  }[];
}

export interface AdminUser extends UserProfile {
  filesCount: number;
  sharesCount: number;
  lastLogin?: string;
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resourceType: 'user' | 'file' | 'share' | 'transfer' | 'download' | 'system' | 'auth' | 'ticket' | 'billing';
  resourceId?: string;
  fileName?: string;
  fileSize?: number;
  ipAddress?: string;
  deviceInfo?: string;
  platform?: string;
  browser?: string;
  details: string;
  metadata?: Record<string, any>;
  status: 'success' | 'warning' | 'danger';
}

export interface SystemHealth {
  r2: {
    status: 'connected' | 'error';
    latencyMs: number;
    bucketName: string;
    objectCount: number;
    totalSizeBytes: number;
  };
  supabase: {
    status: 'connected' | 'error';
    latencyMs: number;
    profilesCount: number;
    filesCount: number;
    transfersCount: number;
    sharesCount: number;
  };
  server: {
    uptimeSeconds: number;
    nodeVersion: string;
    environment: string;
    memoryUsageMb: number;
  };
}
