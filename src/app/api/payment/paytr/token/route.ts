import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";
import { createPaytrIframeToken } from "@/lib/payment/paytr";
import { PRICING_PLANS } from "@/lib/subscription/plans";
import { TIER_LIMITS } from "@/lib/subscription/permissions";
import { checkRateLimit, tooManyRequestsResponse } from "@/lib/utils/rate-limiter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Rate limit
  const ip =
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const rl = checkRateLimit(ip, "/api/payment/paytr/token");
  if (!rl.allowed) {
    return tooManyRequestsResponse(rl);
  }

  try {
    const user = await getAuthUser(req);
    const body = await req.json();
    const { planId, billingCycle = "monthly", userPhone, userAddress } = body;

    const targetUserId = user?.id || body.userId;
    const targetEmail = user?.email || body.userEmail;

    if (!targetUserId || !targetEmail) {
      return NextResponse.json({ success: false, error: "Giriş yapmanız gerekmektedir" }, { status: 401 });
    }

    if (!planId || !["pro", "ultra", "enterprise"].includes(planId)) {
      return NextResponse.json({ success: false, error: "Geçersiz paket seçimi" }, { status: 400 });
    }

    const plan = PRICING_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return NextResponse.json({ success: false, error: "Paket bulunamadı" }, { status: 404 });
    }

    const amount = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;

    const supabase = getServiceClient();

    // Fetch user profile for name
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", targetUserId)
      .single();

    const userName = profile?.display_name || body.userName || targetEmail.split("@")[0];

    // Generate PayTR token
    const tokenResult = await createPaytrIframeToken({
      userId: targetUserId,
      userEmail: targetEmail,
      userName,
      userPhone: userPhone || "05555555555",
      userAddress: userAddress || "Türkiye",
      userIp: ip,
      planId,
      planName: plan.name,
      billingCycle,
      amount,
    });

    if (!tokenResult.success || !tokenResult.token || !tokenResult.merchantOid) {
      return NextResponse.json(
        { success: false, error: tokenResult.error || "PayTR token oluşturulamadı" },
        { status: 500 }
      );
    }

    // Record pending payment in payments table
    try {
      await supabase.from("payments").insert({
        id: tokenResult.merchantOid,
        user_id: targetUserId,
        user_email: targetEmail,
        plan_id: planId,
        billing_cycle: billingCycle,
        amount,
        currency: "TL",
        status: "pending",
        paytr_token: tokenResult.token,
      });
    } catch (dbErr) {
      console.warn("Could not insert payment record into Supabase (table might not exist yet):", dbErr);
    }

    return NextResponse.json({
      success: true,
      token: tokenResult.token,
      iframeUrl: tokenResult.iframeUrl,
      merchantOid: tokenResult.merchantOid,
      amount,
      planName: plan.name,
    });
  } catch (err: any) {
    console.error("PayTR Token API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Ödeme oturumu başlatılamadı" },
      { status: 500 }
    );
  }
}
