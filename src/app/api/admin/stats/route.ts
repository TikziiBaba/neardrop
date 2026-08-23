import { NextRequest, NextResponse } from "next/server";
import { fetchAdminStats } from "@/lib/admin/service";

export async function GET(req: NextRequest) {
  try {
    const stats = await fetchAdminStats();
    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch stats" }, { status: 500 });
  }
}
