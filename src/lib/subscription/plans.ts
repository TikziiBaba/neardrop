import { PricingPlan } from "@/types";
import { TIER_LIMITS } from "./permissions";

export interface LocalizedPlan extends PricingPlan {
  badge?: string;
  limitations?: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: TIER_LIMITS.free.name,
    tagline: TIER_LIMITS.free.tagline,
    quotaBytes: TIER_LIMITS.free.quotaBytes,
    quotaLabel: TIER_LIMITS.free.quotaLabel,
    priceMonthly: TIER_LIMITS.free.priceMonthly,
    priceYearly: TIER_LIMITS.free.priceYearly,
    features: TIER_LIMITS.free.features,
  },
  {
    id: "pro",
    name: TIER_LIMITS.pro.name,
    tagline: TIER_LIMITS.pro.tagline,
    quotaBytes: TIER_LIMITS.pro.quotaBytes,
    quotaLabel: TIER_LIMITS.pro.quotaLabel,
    priceMonthly: TIER_LIMITS.pro.priceMonthly,
    priceYearly: TIER_LIMITS.pro.priceYearly,
    popular: true,
    badge: "Most Popular",
    features: TIER_LIMITS.pro.features,
  },
  {
    id: "ultra",
    name: TIER_LIMITS.ultra.name,
    tagline: TIER_LIMITS.ultra.tagline,
    quotaBytes: TIER_LIMITS.ultra.quotaBytes,
    quotaLabel: TIER_LIMITS.ultra.quotaLabel,
    priceMonthly: TIER_LIMITS.ultra.priceMonthly,
    priceYearly: TIER_LIMITS.ultra.priceYearly,
    badge: "For Creators",
    features: TIER_LIMITS.ultra.features,
  },
  {
    id: "enterprise",
    name: TIER_LIMITS.enterprise.name,
    tagline: TIER_LIMITS.enterprise.tagline,
    quotaBytes: TIER_LIMITS.enterprise.quotaBytes,
    quotaLabel: TIER_LIMITS.enterprise.quotaLabel,
    priceMonthly: TIER_LIMITS.enterprise.priceMonthly,
    priceYearly: TIER_LIMITS.enterprise.priceYearly,
    badge: "Maximum Power",
    features: TIER_LIMITS.enterprise.features,
  },
];

export function getPricingPlans(isTr: boolean): LocalizedPlan[] {
  if (isTr) {
    return [
      {
        id: "free",
        name: "Ücretsiz Başlangıç",
        tagline: "Kişisel kullanım için temel güvenli bulut depolama.",
        quotaBytes: TIER_LIMITS.free.quotaBytes,
        quotaLabel: "2 GB",
        priceMonthly: 0,
        priceYearly: 0,
        features: [
          "2 GB Yüksek Hızlı Güvenli Bulut Depolama",
          "2 GB'a Kadar Tek Dosya Yükleme",
          "1 Aktif Paylaşım Bağlantısı",
          "12 Saate Kadar Bağlantı Ömrü",
          "Uçtan Uca AES-256-GCM Şifreleme",
          "Sınırsız Yerel Ağ (LAN) Aktarımı",
          "Fotoğraf ve Video Medya Önizleme",
        ],
        limitations: [
          "Şifre & PIN Koruması (Devre Dışı)",
          "Klasör Paylaşımı & Toplu ZIP (Devre Dışı)",
          "Özel İndirme Limitleri (Devre Dışı)",
          "Kalıcı Bağlantılar (Devre Dışı)",
        ],
      },
      {
        id: "pro",
        name: "Pro Bulut",
        tagline: "Genişletilmiş depolama, parola koruması ve yüksek hızlı aktarım.",
        quotaBytes: TIER_LIMITS.pro.quotaBytes,
        quotaLabel: "100 GB",
        priceMonthly: 99,
        priceYearly: 990,
        popular: true,
        badge: "En Popüler",
        features: [
          "100 GB Genişletilmiş Güvenli Bulut Depolama",
          "5 GB'a Kadar Tek Dosya Yükleme",
          "Sınırsız Aktif Paylaşım Bağlantısı",
          "7 Güne Kadar Özel Bağlantı Ömrü",
          "Şifre & PIN Korumalı Paylaşım Linkleri",
          "Özel İndirme Sayaçları ve Limitleri",
          "Klasör Paylaşımı ve Toplu ZIP İndirme",
          "Hızlandırılmış Küresel CDN Dağıtımı",
          "Öncelikli Destek Bileti (< 12 Saat)",
        ],
        limitations: [
          "Kalıcı Bağlantılar (Devre Dışı)",
          "Özel Alan Adı Markalama (Devre Dışı)",
        ],
      },
      {
        id: "ultra",
        name: "Ultra İçerik Üretici",
        tagline: "İçerik üreticileri ve profesyoneller için yüksek bant genişliği.",
        quotaBytes: TIER_LIMITS.ultra.quotaBytes,
        quotaLabel: "500 GB",
        priceMonthly: 249,
        priceYearly: 2490,
        badge: "Üreticiler İçin",
        features: [
          "500 GB Ultra Bulut Depolama Alanı",
          "25 GB'a Kadar Tek Dosya Yükleme",
          "30 Güne Kadar veya Kalıcı Bağlantılar",
          "Kriptografik Şifre Koruması",
          "Özel İndirme Sayfası Markalama",
          "Ayrıntılı Bağlantı Analitiği ve Konum İstatistikleri",
          "Doğrudan Klasör Çoklu Dosya Akışı",
          "VIP Hızlı Canlı Destek (< 4 Saat)",
        ],
        limitations: [
          "Özel Alan Adı (Kurumsal Özellik)",
        ],
      },
      {
        id: "enterprise",
        name: "Kurumsal Sınırsız",
        tagline: "Sınırsız ölçek, kalıcı bağlantılar, özel alan adları ve 7/24 SLA.",
        quotaBytes: TIER_LIMITS.enterprise.quotaBytes,
        quotaLabel: "2 TB",
        priceMonthly: 599,
        priceYearly: 5990,
        badge: "Maksimum Güç",
        features: [
          "2 TB Kurumsal Düzeyde Bulut Kapasitesi",
          "Kalıcı ve Süresiz Paylaşım Bağlantıları",
          "Özel Alan Adı (paylas.sirketiniz.com)",
          "Sınırsız Küresel CDN Bant Genişliği",
          "Takım Yönetimi ve Rol Tabanlı İzinler",
          "Eksiksiz Güvenlik Denetim Günlüğü Dışa Aktarma",
          "24/7 Özel Müşteri Temsilcisi & SLA",
        ],
        limitations: [],
      },
    ];
  }

  return PRICING_PLANS.map((plan) => ({
    ...plan,
    limitations: TIER_LIMITS[plan.id]?.limitations || [],
  }));
}
