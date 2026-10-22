import { NextRequest, NextResponse } from "next/server";
import { fetchAuditLogs } from "@/lib/admin/service";
import { requireStaff } from "@/lib/supabase/auth-helper";

export async function GET(req: NextRequest) {
  const denied = await requireStaff(req);
  if (denied) return denied;

  try {
    const logs = await fetchAuditLogs();
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("Admin logs error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch logs" }, { status: 500 });
  }
}
