import { NextRequest, NextResponse } from "next/server";
import { createCheckoutUrl } from "@/lib/payment/lemonsqueezy";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";
import { checkRateLimit, tooManyRequestsResponse } from "@/lib/utils/rate-limiter";

export async function POST(req: NextRequest) {
  // Rate limit
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(ip, "/api/payment/checkout");
  if (!rl.allowed) {
    return tooManyRequestsResponse(rl);
  }

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceClient();

    const { planId, billingCycle } = await req.json();

    if (!planId || !["pro", "ultra", "enterprise"].includes(planId)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Fetch user profile for name
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const result = await createCheckoutUrl({
      planId,
      userId: user.id,
      userEmail: user.email || "",
      userName: profile?.display_name || "",
      billingCycle: billingCycle || "monthly",
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: result.checkoutUrl });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
