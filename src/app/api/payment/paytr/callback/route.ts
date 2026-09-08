import { NextRequest } from "next/server";
import { verifyPaytrCallback } from "@/lib/payment/paytr";
import { getServiceClient } from "@/lib/supabase/auth-helper";
import { TIER_LIMITS } from "@/lib/subscription/permissions";
import { SubscriptionTier } from "@/types";

export const dynamic = "force-dynamic";

/**
 * PayTR Callback / Webhook Endpoint
 * 
 * PayTR sends a POST request here upon payment completion (3D Secure completed).
 * PayTR expects a plain text "OK" response.
 */
export async function POST(req: NextRequest) {
  try {
    const rawText = await req.text();
    const params = new URLSearchParams(rawText);

    const merchant_oid = params.get("merchant_oid") || "";
    const status = params.get("status") || "";
    const total_amount = params.get("total_amount") || "";
    const hash = params.get("hash") || "";
    const failed_reason_code = params.get("failed_reason_code") || "";
    const failed_reason_msg = params.get("failed_reason_msg") || "";

    if (!merchant_oid || !status || !total_amount || !hash) {
      console.error("PayTR Callback: Missing required fields", { merchant_oid, status });
      return new Response("PAYTR notification failed: missing parameters", { status: 400 });
    }

    // 1. Verify Hash
    const isValid = verifyPaytrCallback({
      merchant_oid,
      status,
      total_amount,
      hash,
    });

    if (!isValid) {
      console.error("PayTR Callback: Bad hash signature for order:", merchant_oid);
      return new Response("PAYTR notification failed: bad hash", { status: 400 });
    }

    const supabase = getServiceClient();

    // 2. Fetch the corresponding payment record
    const { data: payment } = await supabase
      .from("payments")
      .select("*")
      .eq("id", merchant_oid)
      .single();

    const rawCallbackData = Object.fromEntries(params.entries());

    if (status === "success") {
      // Payment Successful
      let userId = payment?.user_id;
      let planId = payment?.plan_id;

      // Update payment record in database
      if (payment) {
        await supabase
          .from("payments")
          .update({
            status: "success",
            raw_callback: rawCallbackData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", merchant_oid);
      }

      // Upgrade User Subscription & Quota
      if (userId && planId) {
        const tierKey = planId as SubscriptionTier;
        const limits = TIER_LIMITS[tierKey] || TIER_LIMITS.pro;

        // Fetch current role to preserve admin/moderator roles
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        const currentRole = profile?.role;
        const newRole = (currentRole === "admin" || currentRole === "moderator") ? currentRole : "premium";

        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            subscription_tier: planId,
            subscription_status: "active",
            quota_bytes: limits.quotaBytes,
            role: newRole,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (profileError) {
          console.error("PayTR: Failed to update profile after payment:", profileError);
        }

        // Insert into audit logs
        await supabase.from("audit_logs").insert({
          id: `billing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          user_id: userId,
          action: "PAYTR_PAYMENT_SUCCESS",
          resource_type: "billing",
          details: `PayTR ödemesi tamamlandı: ${limits.name} (${Number(total_amount) / 100} TL). Sipariş No: ${merchant_oid}`,
          metadata: {
            merchant_oid,
            plan_id: planId,
            amount: Number(total_amount) / 100,
            status: "success",
          },
          status: "success",
        });
      }

      // PayTR strictly requires plain text "OK"
      return new Response("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } else {
      // Payment Failed
      console.warn(`PayTR Payment Failed for order ${merchant_oid}: ${failed_reason_msg} (${failed_reason_code})`);

      if (payment) {
        await supabase
          .from("payments")
          .update({
            status: "failed",
            error_message: `${failed_reason_code}: ${failed_reason_msg}`,
            raw_callback: rawCallbackData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", merchant_oid);

        await supabase.from("audit_logs").insert({
          id: `billing_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          user_id: payment.user_id,
          action: "PAYTR_PAYMENT_FAILED",
          resource_type: "billing",
          details: `PayTR ödeme başarısız: ${failed_reason_msg} (Kod: ${failed_reason_code}). Sipariş No: ${merchant_oid}`,
          metadata: {
            merchant_oid,
            plan_id: payment.plan_id,
            error_code: failed_reason_code,
            error_msg: failed_reason_msg,
          },
          status: "failed",
        });
      }

      // Even on failure, acknowledge receipt to PayTR so it stops retrying
      return new Response("OK", {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  } catch (error: any) {
    console.error("PayTR Callback processing error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
