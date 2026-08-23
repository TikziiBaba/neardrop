import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/auth-helper";
import { logAdminAction } from "@/lib/admin/service";
import { PRICING_PLANS } from "@/lib/subscription/plans";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, planId, billingCycle } = body;

    if (!userId || !planId) {
      return NextResponse.json({ success: false, error: "Missing required checkout parameters" }, { status: 400 });
    }

    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ success: false, error: "Invalid subscription plan selected" }, { status: 400 });
    }

    const supabase = getServiceClient();

    // Calculate renewal date
    const renewsDate = new Date();
    if (billingCycle === "yearly") {
      renewsDate.setFullYear(renewsDate.getFullYear() + 1);
    } else {
      renewsDate.setMonth(renewsDate.getMonth() + 1);
    }

    // Get current profile
    const { data: currentProfile } = await supabase.from("profiles").select("role").eq("id", userId).single();
    const currentRole = currentProfile?.role;
    // Don't downgrade admin or moderator role
    const newRole = (currentRole === "admin" || currentRole === "moderator") ? currentRole : (planId === "free" ? "member" : "premium");

    // Update profile with new quota and subscription
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        quota_bytes: plan.quotaBytes,
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateErr) {
      console.error("Failed to update profile quota in DB:", updateErr);
      throw updateErr;
    }

    // Audit log
    logAdminAction({
      action: "SUBSCRIPTION_UPGRADE",
      resourceType: "billing",
      userId,
      userEmail: userEmail || "User",
      resourceId: planId,
      details: `Subscribed to ${plan.name} (${billingCycle || "monthly"}) with ${plan.quotaLabel} storage`,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      planId,
      planName: plan.name,
      quotaBytes: plan.quotaBytes,
      quotaLabel: plan.quotaLabel,
      role: newRole,
      renewsAt: renewsDate.toISOString(),
      message: `Successfully upgraded to ${plan.name}! Your storage quota is now ${plan.quotaLabel}.`,
    });
  } catch (error: any) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json({ success: false, error: error.message || "Checkout failed" }, { status: 500 });
  }
}
