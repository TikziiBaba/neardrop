import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/auth-helper";
import { logAdminAction } from "@/lib/admin/service";
import { PRICING_PLANS } from "@/lib/subscription/plans";
import { TIER_LIMITS } from "@/lib/subscription/permissions";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, planId, billingCycle, cardLastFour } = body;

    if (!userId || !planId) {
      return NextResponse.json({ success: false, error: "Missing required checkout parameters" }, { status: 400 });
    }

    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ success: false, error: "Invalid subscription plan selected" }, { status: 400 });
    }

    const limits = TIER_LIMITS[plan.id];
    const amount = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
    const currency = "TRY";

    const supabase = getServiceClient();

    // Get current profile
    const { data: currentProfile } = await supabase.from("profiles").select("role, email").eq("id", userId).single();
    const currentRole = currentProfile?.role;

    // 1. Free Plan Activation (Instant)
    if (planId === "free") {
      const newRole = (currentRole === "admin" || currentRole === "moderator") ? currentRole : "member";
      await supabase
        .from("profiles")
        .update({
          quota_bytes: limits.quotaBytes,
          role: newRole,
          subscription_tier: "free",
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      logAdminAction({
        action: "SUBSCRIPTION_DOWNGRADE",
        resourceType: "billing",
        userId,
        userEmail: userEmail || currentProfile?.email || "User",
        resourceId: planId,
        details: `Switched to Free Starter plan (${limits.quotaLabel})`,
        status: "success",
      });

      return NextResponse.json({
        success: true,
        planId,
        planName: plan.name,
        quotaBytes: limits.quotaBytes,
        quotaLabel: limits.quotaLabel,
        role: newRole,
        message: `Free Starter plan activated. Storage quota set to ${limits.quotaLabel}.`,
      });
    }

    // 2. Paid Plan Checkout: Inform that Virtual POS integration is currently in progress
    const merchantOid = `ND_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Log the user's payment intent
    logAdminAction({
      action: "PAYMENT_INTENT_WAITLIST",
      resourceType: "billing",
      userId,
      userEmail: userEmail || currentProfile?.email || "User",
      resourceId: planId,
      details: `User attempted checkout for ${plan.name} (${billingCycle || "monthly"} - ${amount} ₺). Virtual POS gateway integration is pending. Order Ref: ${merchantOid}`,
      status: "warning",
    });

    // Plan purchasing is strictly paused until Virtual POS is connected
    return NextResponse.json(
      {
        success: false,
        gatewayStatus: "pos_pending",
        orderId: merchantOid,
        amount,
        currency,
        planName: plan.name,
        error: "Sanal POS entegrasyonu devam etmektedir. Satın alımlar şu an için kapalıdır.",
        message:
          "Banka Sanal POS ve 3D Secure entegrasyon çalışmaları sürmektedir. Bu süreçte test veya canlı paket satın alımları kapalıdır. Talebiniz öncelikli bildirim listesine kaydedildi!",
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json({ success: false, error: error.message || "Checkout failed" }, { status: 500 });
  }
}
