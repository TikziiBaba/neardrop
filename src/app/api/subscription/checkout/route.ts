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

    // Get current profile
    const { data: currentProfile } = await supabase.from("profiles").select("role, email").eq("id", userId).single();
    const currentRole = currentProfile?.role;

    // Allow free plan downgrade without payment
    if (planId === "free") {
      const newRole = (currentRole === "admin" || currentRole === "moderator") ? currentRole : "member";
      await supabase
        .from("profiles")
        .update({
          quota_bytes: plan.quotaBytes,
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      logAdminAction({
        action: "SUBSCRIPTION_DOWNGRADE",
        resourceType: "billing",
        userId,
        userEmail: userEmail || currentProfile?.email || "User",
        resourceId: planId,
        details: `Switched to Free Starter plan (${plan.quotaLabel})`,
        status: "success",
      });

      return NextResponse.json({
        success: true,
        planId,
        planName: plan.name,
        quotaBytes: plan.quotaBytes,
        quotaLabel: plan.quotaLabel,
        role: newRole,
        message: `Free plan activated. Storage quota set to ${plan.quotaLabel}.`,
      });
    }

    // Check if live payment gateway mock is explicitly enabled or if requester is admin
    const isMockCheckoutAllowed = process.env.ENABLE_MOCK_CHECKOUT === "true" || currentRole === "admin";

    if (!isMockCheckoutAllowed) {
      // Record user interest / checkout intent in audit logs
      logAdminAction({
        action: "PAYMENT_INTENT_WAITLIST",
        resourceType: "billing",
        userId,
        userEmail: userEmail || currentProfile?.email || "User",
        resourceId: planId,
        details: `User attempted checkout for ${plan.name} (${billingCycle || "monthly"}). Payment gateway is pending integration.`,
        status: "warning",
      });

      return NextResponse.json(
        {
          success: false,
          gatewayStatus: "pending_integration",
          message:
            "Ödeme altyapısı entegrasyon aşamasındadır. Kredi kartı ve güvenli ödeme yöntemleri çok yakında aktif edilecektir.",
          messageEn:
            "Payment gateway integration is currently in progress. Direct card payments will be active very soon.",
        },
        { status: 400 }
      );
    }

    // SANDBOX / ADMIN TESTING ONLY:
    // Calculate renewal date
    const renewsDate = new Date();
    if (billingCycle === "yearly") {
      renewsDate.setFullYear(renewsDate.getFullYear() + 1);
    } else {
      renewsDate.setMonth(renewsDate.getMonth() + 1);
    }

    const newRole = (currentRole === "admin" || currentRole === "moderator") ? currentRole : "premium";

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

    logAdminAction({
      action: "SUBSCRIPTION_UPGRADE_SANDBOX",
      resourceType: "billing",
      userId,
      userEmail: userEmail || currentProfile?.email || "User",
      resourceId: planId,
      details: `[Sandbox/Admin] Subscribed to ${plan.name} (${billingCycle || "monthly"}) with ${plan.quotaLabel} storage`,
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
      message: `[Sandbox] Upgraded to ${plan.name}! Storage quota: ${plan.quotaLabel}.`,
    });
  } catch (error: any) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json({ success: false, error: error.message || "Checkout failed" }, { status: 500 });
  }
}
