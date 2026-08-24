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

    // Extract real client IP with priority on proxy/Cloudflare/Vercel headers
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      (forwardedFor ? forwardedFor.split(",")[0].trim() : null) ||
      req.headers.get("x-client-ip") ||
      req.headers.get("x-cluster-client-ip") ||
      "127.0.0.1";

    const rawUserAgent = req.headers.get("user-agent") || userAgent || "";
    let detectedBrowser = browser || "Web Browser";
    if (rawUserAgent.includes("Edg/")) detectedBrowser = "Edge";
    else if (rawUserAgent.includes("Chrome/") && !rawUserAgent.includes("Chromium/")) detectedBrowser = "Chrome";
    else if (rawUserAgent.includes("Safari/") && !rawUserAgent.includes("Chrome/")) detectedBrowser = "Safari";
    else if (rawUserAgent.includes("Firefox/")) detectedBrowser = "Firefox";
    else if (rawUserAgent.includes("Opera/") || rawUserAgent.includes("OPR/")) detectedBrowser = "Opera";

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
      try {
        await supabase
          .from("devices")
          .update({
            device_name: deviceName || "Unknown Device",
            device_type: deviceType || "desktop",
            platform: platform || "windows",
            ip_address: clientIp,
            browser: detectedBrowser,
            user_agent: rawUserAgent,
            last_seen: now,
            updated_at: now,
          })
          .eq("id", existingDevice.id);
      } catch {
        // Fallback for older schema without ip_address/browser columns
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
      }
    } else {
      try {
        await supabase.from("devices").insert({
          user_id: userId,
          device_id: deviceId,
          device_name: deviceName || "Unknown Device",
          device_type: deviceType || "desktop",
          platform: platform || "windows",
          ip_address: clientIp,
          browser: detectedBrowser,
          user_agent: rawUserAgent,
          public_key: `pk_${deviceId.substring(0, 16)}`,
          last_seen: now,
        });
      } catch {
        // Fallback for older schema
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
    }

    // 2. Sync to profiles table for fast admin user directory rendering
    try {
      await supabase
        .from("profiles")
        .update({
          last_ip: clientIp,
          last_device: deviceName || "Desktop Web",
          last_browser: detectedBrowser,
          last_platform: platform || "windows",
          updated_at: now,
        })
        .eq("id", userId);
    } catch (profErr) {
      console.warn("Could not sync last_ip to profiles:", profErr);
    }

    // 3. Log device sync / login event in admin audit trail with the IP address
    logAdminAction({
      action: "DEVICE_LOGIN",
      resourceType: "auth",
      userId,
      userEmail: email || "User",
      resourceId: deviceId,
      details: `${deviceName || "Client Device"} (${detectedBrowser} on ${platform || "windows"}) from IP ${clientIp}`,
      ipAddress: clientIp,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      ip: clientIp,
      browser: detectedBrowser,
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
