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
    name: "Ücretsiz Başlangıç",
    tagline: "Bireysel ve temel bulut depolama için başlangıç paketi.",
    currency: "TRY",
    currencySymbol: "₺",
    quotaBytes: 2147483648, // 2 GB (kısıtlandı)
    quotaLabel: "2 GB",
    priceMonthly: 0,
    priceYearly: 0,
    maxUploadSizeBytes: 104857600, // 100 MB
    maxUploadSizeLabel: "100 MB",
    maxActiveShares: 1, // En fazla 1 aktif link
    maxLinkLifespanHours: 12, // Maksimum 12 saat
    allowPasswordProtection: false, // Ücretsiz planda kapalı
    allowCustomDownloadLimit: false,
    allowFolderSharing: false,
    allowPermanentLinks: false,
    allowCustomBranding: false,
    allowAnalytics: false,
    prioritySupport: false,
    transferSpeed: "standard",
    features: [
      "2 GB Yüksek Hızlı Güvenli Depolama",
      "100 MB'a Kadar Tekil Dosya Yükleme",
      "1 Adet Aktif Paylaşım Linki",
      "12 Saate Kadar Link Geçerlilik Süresi",
      "Uçtan Uca AES-256-GCM Şifreleme",
      "Sınırsız Yerel Ağ (LAN) Transferi",
      "Fotoğraf & Video Medya İnceleme",
    ],
    limitations: [
      "Şifre & PIN Korumalı Linkler (Kapalı)",
      "Klasör Paylaşımı (Kapalı)",
      "Özel İndirme Limitleri (Kapalı)",
      "Kalıcı / Süresiz Linkler (Kapalı)",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Bulut",
    tagline: "Geniş depolama, şifreli linkler ve yüksek hız isteyenler için.",
    currency: "TRY",
    currencySymbol: "₺",
    quotaBytes: 107374182400, // 100 GB
    quotaLabel: "100 GB",
    priceMonthly: 99,
    priceYearly: 990, // 2 ay bedava
    maxUploadSizeBytes: 5368709120, // 5 GB
    maxUploadSizeLabel: "5 GB",
    maxActiveShares: 9999, // Sınırsız
    maxLinkLifespanHours: 168, // 7 Gün
    allowPasswordProtection: true,
    allowCustomDownloadLimit: true,
    allowFolderSharing: true,
    allowPermanentLinks: false,
    allowCustomBranding: false,
    allowAnalytics: true,
    prioritySupport: true,
    transferSpeed: "high",
    features: [
      "100 GB Genişletilmiş Güvenli Depolama",
      "5 GB'a Kadar Tekil Dosya Yükleme",
      "Sınırsız Aktif Paylaşım Linki",
      "7 Güne Kadar Özel Link Süresi",
      "Şifre & PIN Korumalı Paylaşım Linkleri",
      "Özel İndirme Sayacı & İndirme Sınırı",
      "Klasör Paylaşımı & Toplu İndirme",
      "Yüksek Hızlı CDN Aktarımı",
      "Öncelikli Bilet Desteği (< 12 Saat)",
    ],
    limitations: [
      "Kalıcı / Süresiz Linkler (Kapalı)",
      "Özel Alan Adı (Custom Domain) (Kapalı)",
    ],
  },
  ultra: {
    id: "ultra",
    name: "Ultra Creator",
    tagline: "İçerik üreticileri ve profesyoneller için yüksek bant genişliği.",
    currency: "TRY",
    currencySymbol: "₺",
    quotaBytes: 536870912000, // 500 GB
    quotaLabel: "500 GB",
    priceMonthly: 249,
    priceYearly: 2490,
    maxUploadSizeBytes: 26843545600, // 25 GB
    maxUploadSizeLabel: "25 GB",
    maxActiveShares: 9999, // Sınırsız
    maxLinkLifespanHours: 720, // 30 Gün
    allowPasswordProtection: true,
    allowCustomDownloadLimit: true,
    allowFolderSharing: true,
    allowPermanentLinks: true,
    allowCustomBranding: true,
    allowAnalytics: true,
    prioritySupport: true,
    transferSpeed: "ultra",
    features: [
      "500 GB Ultra Bulut Depolama Alanı",
      "25 GB'a Kadar Tekil Dosya Yükleme",
      "30 Güne Kadar veya Kalıcı Linkler",
      "Şifre & Kriptografik PIN Koruması",
      "Özel İndirme Sayfası Markalama & Başlık",
      "Detaylı Link Analitiği & Coğrafi İstatistikler",
      "Toplu ZIP Arşivi Olarak İndirme",
      "Öncelikli VIP Canlı Destek (< 4 Saat)",
    ],
    limitations: [
      "Özel Alan Adı (Enterprise Özelliği)",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Infinite",
    tagline: "Ekipler ve şirketler için sınırsız ölçek, kalıcı linkler ve VIP SLA.",
    currency: "TRY",
    currencySymbol: "₺",
    quotaBytes: 2199023255552, // 2 TB
    quotaLabel: "2 TB",
    priceMonthly: 599,
    priceYearly: 5990,
    maxUploadSizeBytes: 53687091200, // 50 GB+
    maxUploadSizeLabel: "50 GB+",
    maxActiveShares: 9999, // Sınırsız
    maxLinkLifespanHours: -1, // Süresiz
    allowPasswordProtection: true,
    allowCustomDownloadLimit: true,
    allowFolderSharing: true,
    allowPermanentLinks: true,
    allowCustomBranding: true,
    allowAnalytics: true,
    prioritySupport: true,
    transferSpeed: "dedicated",
    features: [
      "2 TB Kurumsal Seviye Bulut Alanı",
      "Süresiz & Kalıcı Paylaşım Linkleri",
      "Özel Alan Adı (share.sirketiniz.com)",
      "Sınırsız İndirme Bant Genişliği & Global CDN",
      "Ekip Yönetimi & Rol Bazlı Yetkilendirme",
      "Detaylı Güvenlik & Denetim Günlüğü Dışa Aktarımı",
      "7/24 Özel Müşteri Temsilcisi & 1 Saat İçinde SLA",
    ],
    limitations: [],
  },
};

/**
 * Helper to get limits by user subscription tier or role
 */
export function getTierLimits(tier: SubscriptionTier = "free", role: UserRole = "member"): TierLimits {
  // Admin and Moderator have enterprise level permissions
  if (role === "admin" || role === "moderator") {
    return {
      ...TIER_LIMITS.enterprise,
      name: role === "admin" ? "Sistem Yöneticisi (Admin)" : "Moderatör",
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
      error: `${limits.name} paketinde maksimum tekil dosya yükleme boyutu ${limits.maxUploadSizeLabel}'dir. Daha büyük dosyalar yüklemek için Pro veya Ultra plana geçebilirsiniz.`,
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
      error: `${limits.name} paketinde aynı anda en fazla ${limits.maxActiveShares} aktif paylaşım linkine izin verilir. Yeni link oluşturmak için mevcut linkinizi sonlandırın veya Pro plana geçin.`,
    };
  }

  // Check password protection
  if (options.hasPassword && !limits.allowPasswordProtection) {
    return {
      allowed: false,
      error: "Şifre ve PIN korumalı paylaşım linkleri Pro ve üzeri paketlere özeldir. Lütfen paketinizi yükseltin.",
    };
  }

  // Check folder sharing
  if (options.isFolder && !limits.allowFolderSharing) {
    return {
      allowed: false,
      error: "Klasör paylaşımı Pro ve üzeri paketlere özeldir. Lütfen paketinizi yükseltin.",
    };
  }

  // Check expiration hours limit
  if (limits.maxLinkLifespanHours > 0 && options.expiresInHours && options.expiresInHours > limits.maxLinkLifespanHours) {
    return {
      allowed: false,
      error: `${limits.name} paketinde maksimum link süresi ${limits.maxLinkLifespanHours} saattir. Daha uzun süreli veya kalıcı linkler için paketinizi yükseltin.`,
    };
  }

  return { allowed: true };
}
