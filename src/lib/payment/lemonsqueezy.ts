/**
 * NearDrop LemonSqueezy Payment Integration
 *
 * Handles checkout URL generation, subscription management,
 * and webhook signature verification.
 *
 * Set these environment variables:
 *   LEMONSQUEEZY_API_KEY       — API key from LemonSqueezy dashboard
 *   LEMONSQUEEZY_STORE_ID      — Your store ID
 *   LEMONSQUEEZY_WEBHOOK_SECRET — Webhook signing secret
 *   LEMONSQUEEZY_PRO_VARIANT_ID      — Variant ID for Pro plan
 *   LEMONSQUEEZY_ULTRA_VARIANT_ID    — Variant ID for Ultra plan
 *   LEMONSQUEEZY_ENTERPRISE_VARIANT_ID — Variant ID for Enterprise plan
 */

const LEMON_API_BASE = "https://api.lemonsqueezy.com/v1";

function getApiKey(): string {
  return process.env.LEMONSQUEEZY_API_KEY || "";
}

function getHeaders() {
  return {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${getApiKey()}`,
  };
}

// Map plan IDs to LemonSqueezy variant IDs
const VARIANT_MAP: Record<string, string> = {
  pro: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || "",
  ultra: process.env.LEMONSQUEEZY_ULTRA_VARIANT_ID || "",
  enterprise: process.env.LEMONSQUEEZY_ENTERPRISE_VARIANT_ID || "",
};

/**
 * Create a LemonSqueezy checkout URL for the given plan
 */
export async function createCheckoutUrl(params: {
  planId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  billingCycle?: "monthly" | "yearly";
}): Promise<{ checkoutUrl: string } | { error: string }> {
  const variantId = VARIANT_MAP[params.planId];

  if (!variantId) {
    return { error: `No LemonSqueezy variant configured for plan: ${params.planId}` };
  }

  const storeId = process.env.LEMONSQUEEZY_STORE_ID || "";

  try {
    const res = await fetch(`${LEMON_API_BASE}/checkouts`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: params.userEmail,
              name: params.userName || "",
              custom: {
                user_id: params.userId,
                plan_id: params.planId,
              },
            },
            product_options: {
              redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://neardrop.bekirr.dev"}/settings?payment=success`,
            },
          },
          relationships: {
            store: {
              data: { type: "stores", id: storeId },
            },
            variant: {
              data: { type: "variants", id: variantId },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("LemonSqueezy checkout error:", errBody);
      return { error: "Failed to create checkout session" };
    }

    const json = await res.json();
    const checkoutUrl = json.data?.attributes?.url;

    if (!checkoutUrl) {
      return { error: "No checkout URL returned from LemonSqueezy" };
    }

    return { checkoutUrl };
  } catch (err: any) {
    console.error("LemonSqueezy API error:", err);
    return { error: err.message || "Payment service unavailable" };
  }
}

/**
 * Verify LemonSqueezy webhook signature (HMAC SHA-256)
 */
export async function verifyWebhookSignature(
  rawBody: string,
  signature: string
): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";
  if (!secret || !signature) return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const computed = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return computed === signature;
  } catch {
    return false;
  }
}

/**
 * Map LemonSqueezy subscription event to NearDrop tier
 */
export function mapEventToTier(eventName: string, customData: Record<string, any>): {
  tier: string;
  status: string;
} | null {
  const planId = customData?.plan_id;
  if (!planId) return null;

  switch (eventName) {
    case "subscription_created":
    case "subscription_resumed":
      return { tier: planId, status: "active" };
    case "subscription_updated":
      return { tier: planId, status: "active" };
    case "subscription_cancelled":
      return { tier: planId, status: "cancelled" };
    case "subscription_expired":
      return { tier: "free", status: "active" };
    case "subscription_paused":
      return { tier: planId, status: "past_due" };
    case "subscription_payment_failed":
      return { tier: planId, status: "past_due" };
    default:
      return null;
  }
}
