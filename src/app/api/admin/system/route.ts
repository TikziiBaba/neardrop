import { NextRequest, NextResponse } from "next/server";
import { checkSystemHealth } from "@/lib/admin/service";

export async function GET(req: NextRequest) {
  try {
    const health = await checkSystemHealth();
    return NextResponse.json({ success: true, health });
  } catch (error: any) {
    console.error("Admin system health error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to check system health" }, { status: 500 });
  }
}
