import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/auth-helper";
import { logAdminAction } from "@/lib/admin/service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, deviceId, deviceName, deviceType, platform, browser, userAgent } = body;

    if (!userId || !deviceId) {
      return NextResponse.json({ success: false, error: "Missing required device parameters" }, { status: 400 });
    }

    // Extract real client IP
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    const supabase = getServiceClient();
    const now = new Date().toISOString();

    // 1. Check if device exists for this user
    const { data: existingDevice } = await supabase
      .from("devices")
      .select("id")
      .eq("user_id", userId)
      .eq("device_id", deviceId)
      .single();

    if (existingDevice) {
      // Update existing device with new IP and last_seen
      await supabase
        .from("devices")
        .update({
          device_name: deviceName || "Unknown Device",
          device_type: deviceType || "desktop",
          platform: platform || "windows",
          last_seen: now,
          updated_at: now,
        })
        .eq("id", existingDevice.id);
    } else {
      // Insert new device
      await supabase.from("devices").insert({
        user_id: userId,
        device_id: deviceId,
        device_name: deviceName || "Unknown Device",
        device_type: deviceType || "desktop",
        platform: platform || "windows",
        public_key: `pk_${deviceId.substring(0, 16)}`,
        last_seen: now,
      });
    }

    // 2. Log device sync / login event in admin audit trail with the IP address
    logAdminAction({
      action: "DEVICE_LOGIN",
      resourceType: "auth",
      userId,
      userEmail: email || "User",
      resourceId: deviceId,
      details: `${deviceName || "Client Device"} authenticated (${platform || "desktop"}) from IP ${clientIp}`,
      ipAddress: clientIp,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      ip: clientIp,
      deviceId,
      lastSeen: now,
    });
  } catch (error: any) {
    console.error("Device sync API error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to sync device" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceRecordId = searchParams.get("id");

    if (!deviceRecordId) {
      return NextResponse.json({ success: false, error: "Missing device ID" }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { error } = await supabase.from("devices").delete().eq("id", deviceRecordId);
    if (error) throw error;

    logAdminAction({
      action: "REVOKE_DEVICE",
      resourceType: "auth",
      resourceId: deviceRecordId,
      details: `Revoked device pairing ${deviceRecordId}`,
      status: "warning",
    });

    return NextResponse.json({ success: true, message: "Device disconnected successfully" });
  } catch (error: any) {
    console.error("Device delete error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to disconnect device" }, { status: 500 });
  }
}
