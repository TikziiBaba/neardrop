import { NextRequest, NextResponse } from "next/server";
import { fetchAdminShares, revokeAdminShare } from "@/lib/admin/service";
import { requireStaff } from "@/lib/supabase/auth-helper";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const denied = await requireStaff(req);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const shares = await fetchAdminShares(userId);
    return NextResponse.json({ success: true, shares });
  } catch (error: any) {
    console.error("Admin shares GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch shares" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireStaff(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { shareId, isActive } = body;

    if (!shareId) {
      return NextResponse.json({ success: false, error: "Missing shareId" }, { status: 400 });
    }

    await revokeAdminShare(shareId, isActive);
    return NextResponse.json({
      success: true,
      message: `Share link ${isActive ? "activated" : "revoked"} successfully`,
    });
  } catch (error: any) {
    console.error("Admin shares PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update share" }, { status: 500 });
  }
}
