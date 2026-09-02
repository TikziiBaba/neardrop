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

    const newRole = currentRole === "admin" || currentRole === "moderator" ? currentRole : "member";

    await supabase
      .from("profiles")
      .update({
        quota_bytes: limits.quotaBytes,
        role: newRole,
        subscription_tier: plan.id,
        subscription_status: "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    logAdminAction({
      action: "SUBSCRIPTION_ACTIVATE_FREE",
      resourceType: "billing",
      userId,
      userEmail: userEmail || currentProfile?.email || "User",
      resourceId: planId,
      details: `Activated ${plan.name} (100% Free - ${limits.quotaLabel})`,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      planId: plan.id,
      planName: plan.name,
      quotaBytes: limits.quotaBytes,
      quotaLabel: limits.quotaLabel,
      role: newRole,
      message: `${plan.name} activated for 0 ₺. Enjoy 100% free unlimited access!`,
    });
  } catch (error: any) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json({ success: false, error: error.message || "Checkout failed" }, { status: 500 });
  }
}
