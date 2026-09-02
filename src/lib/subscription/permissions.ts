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
    name: "Free Unlimited",
    tagline: "All features unlocked. 100% free and open for everyone.",
    currency: "TRY",
    currencySymbol: "₺",
    quotaBytes: 1099511627776, // 1 TB Free Storage
    quotaLabel: "1 TB",
    priceMonthly: 0,
    priceYearly: 0,
    maxUploadSizeBytes: 53687091200, // 50 GB
    maxUploadSizeLabel: "50 GB",
    maxActiveShares: 9999, // Unlimited
    maxLinkLifespanHours: -1, // Permanent / Indefinite
    allowPasswordProtection: true, // Fully unlocked
    allowCustomDownloadLimit: true,
    allowFolderSharing: true,
    allowPermanentLinks: true,
    allowCustomBranding: true,
    allowAnalytics: true,
    prioritySupport: true,
    transferSpeed: "ultra",
    features: [
      "1 TB High-Speed Secure Cloud Storage",
      "Up to 50 GB Single File Upload",
      "Unlimited Active Share Links",
      "Permanent & Custom Link Lifespan",
      "End-to-End AES-256-GCM & SHA-256 Encryption",
      "Password & PIN Protected Share Links",
      "Folder Sharing & Bulk ZIP Downloads",
      "Custom Download Counters & Limits",
      "Accelerated Global CDN Delivery",
      "Detailed Link Analytics & Geo Stats",
    ],
    limitations: [],
  },
  pro: {
    id: "pro",
    name: "Pro Unlimited",
    tagline: "Expanded power, permanent links, and high-speed delivery.",
    currency: "TRY",
    currencySymbol: "₺",
    quotaBytes: 1099511627776, // 1 TB
    quotaLabel: "1 TB",
    priceMonthly: 0,
    priceYearly: 0,
    maxUploadSizeBytes: 53687091200, // 50 GB
    maxUploadSizeLabel: "50 GB",
    maxActiveShares: 9999,
    maxLinkLifespanHours: -1,
    allowPasswordProtection: true,
    allowCustomDownloadLimit: true,
    allowFolderSharing: true,
    allowPermanentLinks: true,
    allowCustomBranding: true,
    allowAnalytics: true,
    prioritySupport: true,
    transferSpeed: "ultra",
    features: [
      "1 TB High-Speed Cloud Capacity",
      "Up to 50 GB Single File Upload",
      "Unlimited Active Share Links",
      "Permanent Share Links",
      "Password & PIN Protected Links",
      "Custom Download Limits",
      "Folder Sharing & Bulk ZIP Downloads",
      "Accelerated CDN Transfer Speeds",
    ],
    limitations: [],
  },
  ultra: {
    id: "ultra",
    name: "Ultra Creator",
    tagline: "Massive bandwidth and unlimited storage for creators & developers.",
    currency: "TRY",
    currencySymbol: "₺",
    quotaBytes: 2199023255552, // 2 TB
    quotaLabel: "2 TB",
    priceMonthly: 0,
    priceYearly: 0,
    maxUploadSizeBytes: 53687091200, // 50 GB
    maxUploadSizeLabel: "50 GB",
    maxActiveShares: 9999,
    maxLinkLifespanHours: -1,
    allowPasswordProtection: true,
    allowCustomDownloadLimit: true,
    allowFolderSharing: true,
    allowPermanentLinks: true,
    allowCustomBranding: true,
    allowAnalytics: true,
    prioritySupport: true,
    transferSpeed: "ultra",
    features: [
      "2 TB Ultra Cloud Storage Space",
      "Up to 50 GB Single File Upload",
      "Permanent Indefinite Share Links",
      "Cryptographic Password Protection",
      "Detailed Link Analytics & Geo Stats",
      "Direct Folder Multi-File Streaming",
      "VIP Fast-Track Support",
    ],
    limitations: [],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Infinite",
    tagline: "Unlimited scale, permanent links, and maximum speed.",
    currency: "TRY",
    currencySymbol: "₺",
    quotaBytes: 2199023255552, // 2 TB
    quotaLabel: "2 TB",
    priceMonthly: 0,
    priceYearly: 0,
    maxUploadSizeBytes: 53687091200, // 50 GB
    maxUploadSizeLabel: "50 GB",
    maxActiveShares: 9999,
    maxLinkLifespanHours: -1,
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
      "Unlimited Global CDN Bandwidth",
      "Team Management & RBAC Permissions",
      "Complete Security Audit Trail",
      "100% Free & Open Access",
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
  const limits = getTierLimits(tier, role);
  if (fileSizeBytes > limits.maxUploadSizeBytes) {
    return {
      allowed: false,
      error: `Single file upload exceeds the ${limits.maxUploadSizeLabel} maximum limit.`,
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
  const limits = getTierLimits(tier, role);

  // Check active share count limit
  if (limits.maxActiveShares > 0 && options.activeSharesCount >= limits.maxActiveShares) {
    return {
      allowed: false,
      error: `You have reached the maximum active share link limit (${limits.maxActiveShares}). Please revoke an older link.`,
    };
  }

  // Check expiration hours limit (if maxLinkLifespanHours > 0)
  if (limits.maxLinkLifespanHours > 0 && options.expiresInHours && options.expiresInHours > limits.maxLinkLifespanHours) {
    return {
      allowed: false,
      error: `The maximum link lifespan is ${limits.maxLinkLifespanHours} hours.`,
    };
  }

  return { allowed: true };
}
