import { NextRequest, NextResponse } from "next/server";
import { fetchAuditLogs } from "@/lib/admin/service";

export async function GET(req: NextRequest) {
  try {
    const logs = await fetchAuditLogs();
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    console.error("Admin logs error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch logs" }, { status: 500 });
  }
}
