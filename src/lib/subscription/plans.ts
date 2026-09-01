import { PricingPlan } from "@/types";
import { TIER_LIMITS } from "./permissions";

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
    badge: "En Popüler",
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
    badge: "Üreticiler İçin",
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
    badge: "Maksimum Güç",
    features: TIER_LIMITS.enterprise.features,
  },
];
