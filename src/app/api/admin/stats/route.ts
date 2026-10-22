import { NextRequest, NextResponse } from "next/server";
import { fetchAdminStats } from "@/lib/admin/service";
import { requireStaff } from "@/lib/supabase/auth-helper";

export async function GET(req: NextRequest) {
  const denied = await requireStaff(req);
  if (denied) return denied;

  try {
    const stats = await fetchAdminStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch stats" }, { status: 500 });
  }
}
