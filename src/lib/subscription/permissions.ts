import { SubscriptionTier, UserRole } from "@/types";

export interface TierLimits {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  currency: string;
  currencySymbol: string;
  quotaBytes: number;
  quotaLabel: string;
  priceMonthly: number;
  priceYearly: number;
  maxUploadSizeBytes: number;
  maxUploadSizeLabel: string;
  maxActiveShares: number;
  maxLinkLifespanHours: number; // -1 for permanent
  allowPasswordProtection: boolean;
  allowCustomDownloadLimit: boolean;
  allowFolderSharing: boolean;
  allowPermanentLinks: boolean;
  allowCustomBranding: boolean;
  allowAnalytics: boolean;
  prioritySupport: boolean;
  transferSpeed: "standard" | "high" | "ultra" | "dedicated";
  features: string[];
  limitations: string[];
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    id: "free",
    name: "Free Starter",
    tagline: "Essential secure cloud storage for personal use.",
    currency: "TRY",
    currencySymbol: "₺",
    quotaBytes: 2147483648, // 2 GB
    quotaLabel: "2 GB",
    priceMonthly: 0,
    priceYearly: 0,
    maxUploadSizeBytes: 104857600, // 100 MB
    maxUploadSizeLabel: "100 MB",
    maxActiveShares: 1, // Max 1 active share link
    maxLinkLifespanHours: 12, // Max 12 hours
    allowPasswordProtection: false, // Locked on free tier
    allowCustomDownloadLimit: false,
    allowFolderSharing: false,
    allowPermanentLinks: false,
    allowCustomBranding: false,
    allowAnalytics: false,
    prioritySupport: false,
    transferSpeed: "standard",
    features: [
      "2 GB High-Speed Secure Cloud Storage",
      "Up to 100 MB Single File Upload",
      "1 Active Share Link",
      "Up to 12 Hours Link Lifespan",
      "End-to-End AES-256-GCM Encryption",
      "Unlimited Local Network (LAN) Transfers",
      "Photo & Video Media Preview",
    ],
    limitations: [
      "Password & PIN Protection (Disabled)",
      "Folder Sharing & Bulk ZIP (Disabled)",
      "Custom Download Limits (Disabled)",
      "Permanent Links (Disabled)",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Cloud",
    tagline: "Expanded storage, password protection, and high-speed delivery.",
    currency: "TRY",
    currencySymbol: "₺",
    quotaBytes: 107374182400, // 100 GB
    quotaLabel: "100 GB",
    priceMonthly: 99,
    priceYearly: 990, // 2 months free
    maxUploadSizeBytes: 5368709120, // 5 GB
    maxUploadSizeLabel: "5 GB",
    maxActiveShares: 9999, // Unlimited
    maxLinkLifespanHours: 168, // 7 Days
    allowPasswordProtection: true,
    allowCustomDownloadLimit: true,
    allowFolderSharing: true,
    allowPermanentLinks: false,
    allowCustomBranding: false,
    allowAnalytics: true,
    prioritySupport: true,
    transferSpeed: "high",
    features: [
      "100 GB Expanded Secure Cloud Storage",
      "Up to 5 GB Single File Upload",
      "Unlimited Active Share Links",
      "Up to 7 Days Custom Link Lifespan",
      "Password & PIN Protected Share Links",
      "Custom Download Counters & Limits",
      "Folder Sharing & Bulk ZIP Downloads",
      "Accelerated Global CDN Delivery",
      "Priority Ticket Support (< 12 Hours)",
    ],
    limitations: [
      "Permanent Links (Disabled)",
      "Custom Domain Branding (Disabled)",
    ],
  },
  ultra: {
    id: "ultra",
    name: "Ultra Creator",
    tagline: "Massive bandwidth and extended lifespan for creators & professionals.",
    currency: "TRY",
    currencySymbol: "₺",
    quotaBytes: 536870912000, // 500 GB
    quotaLabel: "500 GB",
    priceMonthly: 249,
    priceYearly: 2490,
    maxUploadSizeBytes: 26843545600, // 25 GB
    maxUploadSizeLabel: "25 GB",
    maxActiveShares: 9999, // Unlimited
    maxLinkLifespanHours: 720, // 30 Days
    allowPasswordProtection: true,
    allowCustomDownloadLimit: true,
    allowFolderSharing: true,
    allowPermanentLinks: true,
    allowCustomBranding: true,
    allowAnalytics: true,
    prioritySupport: true,
    transferSpeed: "ultra",
    features: [
      "500 GB Ultra Cloud Storage Space",
      "Up to 25 GB Single File Upload",
      "Up to 30 Days or Permanent Links",
      "Cryptographic Password Protection",
      "Custom Download Page Branding",
      "Detailed Link Analytics & Geo Stats",
      "Direct Folder Multi-File Streaming",
      "VIP Fast-Track Live Support (< 4 Hours)",
    ],
    limitations: [
      "Custom Domain (Enterprise Feature)",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Infinite",
    tagline: "Unlimited scale, permanent links, custom domains, and 24/7 SLA.",
    currency: "TRY",
    currencySymbol: "₺",
    quotaBytes: 2199023255552, // 2 TB
    quotaLabel: "2 TB",
    priceMonthly: 599,
    priceYearly: 5990,
    maxUploadSizeBytes: 53687091200, // 50 GB+
    maxUploadSizeLabel: "50 GB+",
    maxActiveShares: 9999, // Unlimited
    maxLinkLifespanHours: -1, // Permanent
    allowPasswordProtection: true,
    allowCustomDownloadLimit: true,
    allowFolderSharing: true,
    allowPermanentLinks: true,
    allowCustomBranding: true,
    allowAnalytics: true,
    prioritySupport: true,
    transferSpeed: "dedicated",
    features: [
      "2 TB Enterprise-Grade Cloud Capacity",
      "Permanent & Indefinite Share Links",
      "Custom Domain (share.yourcompany.com)",
      "Unlimited Global CDN Bandwidth",
      "Team Management & RBAC Permissions",
      "Complete Security Audit Trail Export",
      "24/7 Dedicated Account Manager & 1-Hour SLA",
    ],
    limitations: [],
  },
};

/**
 * Helper to get limits by user subscription tier or role
 */
export function getTierLimits(tier: SubscriptionTier = "free", role: UserRole = "member"): TierLimits {
  if (role === "admin" || role === "moderator") {
    return {
      ...TIER_LIMITS.enterprise,
      name: role === "admin" ? "System Administrator" : "Moderator",
    };
  }

  return TIER_LIMITS[tier] || TIER_LIMITS.free;
}

/**
 * Validates single file upload against user tier limits
 */
export function validateUploadSize(
  fileSizeBytes: number,
  tier: SubscriptionTier = "free",
  role: UserRole = "member"
): { allowed: boolean; error?: string } {
  if (role === "admin" || role === "moderator") {
    return { allowed: true };
  }

  const limits = getTierLimits(tier, role);
  if (fileSizeBytes > limits.maxUploadSizeBytes) {
    return {
      allowed: false,
      error: `Single file upload exceeds the ${limits.maxUploadSizeLabel} limit on the ${limits.name} plan. Upgrade to Pro or Ultra for larger uploads.`,
    };
  }

  return { allowed: true };
}

/**
 * Validates share creation options (password, expiry, active share counts)
 */
export function validateShareCreation(
  options: {
    activeSharesCount: number;
    hasPassword?: boolean;
    expiresInHours?: number;
    isFolder?: boolean;
  },
  tier: SubscriptionTier = "free",
  role: UserRole = "member"
): { allowed: boolean; error?: string } {
  if (role === "admin" || role === "moderator") {
    return { allowed: true };
  }

  const limits = getTierLimits(tier, role);

  // Check active share count limit
  if (options.activeSharesCount >= limits.maxActiveShares) {
    return {
      allowed: false,
      error: `The ${limits.name} plan allows a maximum of ${limits.maxActiveShares} active share link. Please revoke your existing link or upgrade to Pro.`,
    };
  }

  // Check password protection
  if (options.hasPassword && !limits.allowPasswordProtection) {
    return {
      allowed: false,
      error: "Password-protected share links are exclusive to Pro and Ultra plans. Please upgrade your subscription.",
    };
  }

  // Check folder sharing
  if (options.isFolder && !limits.allowFolderSharing) {
    return {
      allowed: false,
      error: "Folder sharing is exclusive to Pro and Ultra plans. Please upgrade your subscription.",
    };
  }

  // Check expiration hours limit
  if (limits.maxLinkLifespanHours > 0 && options.expiresInHours && options.expiresInHours > limits.maxLinkLifespanHours) {
    return {
      allowed: false,
      error: `The maximum link lifespan on the ${limits.name} plan is ${limits.maxLinkLifespanHours} hours. Upgrade for longer or permanent links.`,
    };
  }

  return { allowed: true };
}
