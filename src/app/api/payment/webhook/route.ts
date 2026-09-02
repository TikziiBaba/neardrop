import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, mapEventToTier } from "@/lib/payment/lemonsqueezy";
import { createClient } from "@supabase/supabase-js";
import { TIER_LIMITS } from "@/lib/subscription/permissions";

// Use service role for webhook processing
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    // Verify webhook signature
    const valid = await verifyWebhookSignature(rawBody, signature);
    if (!valid) {
      console.error("Invalid LemonSqueezy webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta?.event_name;
    const customData = event.meta?.custom_data || {};
    const userId = customData.user_id;

    if (!userId || !eventName) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const tierUpdate = mapEventToTier(eventName, customData);
    if (!tierUpdate) {
      // Unknown event — acknowledge but do nothing
      return NextResponse.json({ received: true });
    }

    const supabase = getServiceClient();

    // Get new tier limits
    const tierKey = tierUpdate.tier as keyof typeof TIER_LIMITS;
    const limits = TIER_LIMITS[tierKey] || TIER_LIMITS.free;

    // Update user profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_tier: tierUpdate.tier,
        subscription_status: tierUpdate.status,
        quota_bytes: limits.quotaBytes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
    }

    // Log the event in audit_logs
    await supabase.from("audit_logs").insert({
      id: `billing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      action: eventName,
      resource_type: "billing",
      details: `Subscription ${eventName}: ${tierUpdate.tier} plan (${tierUpdate.status})`,
      metadata: {
        plan_id: tierUpdate.tier,
        status: tierUpdate.status,
        lemon_event: eventName,
      },
      status: "success",
    });

    return NextResponse.json({ received: true, updated: tierUpdate });
  } catch (err: any) {
    console.error("Webhook processing error:", err);
    return NextResponse.json(
      { error: err.message || "Webhook error" },
      { status: 500 }
    );
  }
}
