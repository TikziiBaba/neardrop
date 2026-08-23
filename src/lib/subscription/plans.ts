import { PricingPlan } from "@/types";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free Starter",
    tagline: "Essential cloud sharing and LAN transfers for individuals.",
    quotaBytes: 10737418240, // 10 GB
    quotaLabel: "10 GB",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "10 GB Cloudflare R2 Storage",
      "24-Hour Link Lifespan",
      "Unlimited Local LAN Transfers (450+ Mbps)",
      "Standard End-to-End Encryption",
      "Up to 3 Active Share Links",
      "Community & Web Support",
    ],
  },
  {
    id: "pro",
    name: "Pro Cloud",
    tagline: "High-speed transfers, larger quota, and advanced link controls.",
    quotaBytes: 107374182400, // 100 GB
    quotaLabel: "100 GB",
    priceMonthly: 4.99,
    priceYearly: 49,
    popular: true,
    badge: "Most Popular",
    features: [
      "100 GB Cloudflare R2 Storage",
      "7-Day Link Lifespan",
      "Password Protected Share Links",
      "Custom Download Limits & Expiry",
      "Priority Cloud Transfer Speeds",
      "Unlimited Active Share Links",
      "Standard Ticket Support (< 12h)",
    ],
  },
  {
    id: "ultra",
    name: "Ultra Creator",
    tagline: "Unmatched performance and large bandwidth for power creators.",
    quotaBytes: 536870912000, // 500 GB
    quotaLabel: "500 GB",
    priceMonthly: 12.99,
    priceYearly: 129,
    badge: "Creator Choice",
    features: [
      "500 GB Cloudflare R2 Storage",
      "30-Day Link Lifespan",
      "Cryptographic Password & Pin Locks",
      "Custom Slug & Branded Download Pages",
      "Multi-File Batch Downloads (.zip)",
      "Detailed Link Analytics & Geo-Stats",
      "Priority Ticket & Live Support (< 4h)",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise Infinite",
    tagline: "Massive scale, permanent links, and dedicated infrastructure.",
    quotaBytes: 2199023255552, // 2 TB
    quotaLabel: "2 TB",
    priceMonthly: 29.99,
    priceYearly: 299,
    badge: "Maximum Power",
    features: [
      "2 TB High-Performance Cloud Storage",
      "Permanent Link Lifespan (No Expiry)",
      "Unlimited Bandwidth & Downloads",
      "Custom Domain Support (e.g. share.yourdomain.com)",
      "Team Device Management & Multi-User Admin",
      "Audit Log Exports & Webhook Triggers",
      "24/7 Dedicated Priority VIP Support (< 1h)",
    ],
  },
];
