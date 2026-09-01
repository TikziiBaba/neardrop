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
    const { userId, userEmail, planId, billingCycle, cardHolder, cardLastFour } = body;

    if (!userId || !planId) {
      return NextResponse.json({ success: false, error: "Gerekli sipariş parametreleri eksik." }, { status: 400 });
    }

    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ success: false, error: "Geçersiz abonelik paketi seçildi." }, { status: 400 });
    }

    const limits = TIER_LIMITS[plan.id];
    const amount = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
    const currency = "TRY";

    const supabase = getServiceClient();

    // Get current profile
    const { data: currentProfile } = await supabase.from("profiles").select("role, email").eq("id", userId).single();
    const currentRole = currentProfile?.role;

    // 1. Free plan downgrade/activation
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
        userEmail: userEmail || currentProfile?.email || "Kullanıcı",
        resourceId: planId,
        details: `Ücretsiz Başlangıç paketine geçildi (${limits.quotaLabel})`,
        status: "success",
      });

      return NextResponse.json({
        success: true,
        planId,
        planName: plan.name,
        quotaBytes: limits.quotaBytes,
        quotaLabel: limits.quotaLabel,
        role: newRole,
        message: `Ücretsiz paket aktif edildi. Depolama kotanız: ${limits.quotaLabel}.`,
      });
    }

    // 2. Sanal POS Order Reference Generation
    const merchantOid = `ND_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const renewsDate = new Date();
    if (billingCycle === "yearly") {
      renewsDate.setFullYear(renewsDate.getFullYear() + 1);
    } else {
      renewsDate.setMonth(renewsDate.getMonth() + 1);
    }

    // Check if Virtual POS live keys or mock simulation is active
    const isMockCheckoutAllowed = process.env.ENABLE_MOCK_CHECKOUT !== "false"; // Default true for seamless development until tomorrow's live POS keys are added

    if (!isMockCheckoutAllowed) {
      logAdminAction({
        action: "PAYMENT_INTENT_WAITLIST",
        resourceType: "billing",
        userId,
        userEmail: userEmail || currentProfile?.email || "Kullanıcı",
        resourceId: planId,
        details: `Kullanıcı ${plan.name} (${billingCycle || "aylık"} - ${amount} ₺) için ödeme başlattı. Sanal POS anahtarları bekleniyor. Sipariş No: ${merchantOid}`,
        status: "warning",
      });

      return NextResponse.json(
        {
          success: false,
          merchantOid,
          amount,
          currency,
          gatewayStatus: "pos_pending",
          message:
            "Sanal POS bağlantısı kuruluyor. Yarın banka/ödeme kuruluşu bilgileri sisteme bağlandığında otomatik tahsilat gerçekleştirilecektir.",
        },
        { status: 400 }
      );
    }

    // 3. Complete Checkout & Activate Tier
    const newRole = (currentRole === "admin" || currentRole === "moderator") ? currentRole : "premium";

    const { error: updateErr } = await supabase
      .from("profiles")
      .update({
        quota_bytes: limits.quotaBytes,
        role: newRole,
        subscription_tier: plan.id,
        subscription_status: "active",
        subscription_renews_at: renewsDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateErr) {
      console.error("Failed to update profile quota in DB:", updateErr);
      throw updateErr;
    }

    logAdminAction({
      action: "SUBSCRIPTION_UPGRADE",
      resourceType: "billing",
      userId,
      userEmail: userEmail || currentProfile?.email || "Kullanıcı",
      resourceId: planId,
      details: `${plan.name} (${billingCycle || "aylık"} - ${amount} ₺) aboneliği aktif edildi. Sipariş No: ${merchantOid}, Kart: **** ${cardLastFour || "0000"}`,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      orderId: merchantOid,
      amount,
      currency,
      planId: plan.id,
      planName: plan.name,
      quotaBytes: limits.quotaBytes,
      quotaLabel: limits.quotaLabel,
      role: newRole,
      renewsAt: renewsDate.toISOString(),
      message: `${plan.name} (${limits.quotaLabel}) aboneliğiniz başarıyla aktif edildi!`,
    });
  } catch (error: any) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json({ success: false, error: error.message || "Ödeme işlemi gerçekleştirilemedi" }, { status: 500 });
  }
}
