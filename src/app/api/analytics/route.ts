import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";
import { checkRateLimit, tooManyRequestsResponse } from "@/lib/utils/rate-limiter";

/**
 * GET /api/analytics
 * Returns download statistics for the authenticated user's files.
 * Query params:
 *   - fileId (optional): Filter by specific file
 *   - shareId (optional): Filter by specific share link
 *   - days (optional, default 30): Number of days to look back
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(ip, "/api/files");
  if (!rl.allowed) return tooManyRequestsResponse(rl);

  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceClient();

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");
    const shareId = searchParams.get("shareId");
    const days = parseInt(searchParams.get("days") || "30", 10);

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Base query
    let query = supabase
      .from("download_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (fileId) query = query.eq("cloud_file_id", fileId);
    if (shareId) query = query.eq("share_link_id", shareId);

    const { data: events, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allEvents = events || [];

    // Aggregate by country
    const byCountry: Record<string, number> = {};
    // Aggregate by browser
    const byBrowser: Record<string, number> = {};
    // Aggregate by OS
    const byOS: Record<string, number> = {};
    // Aggregate by device type
    const byDevice: Record<string, number> = {};
    // Daily download counts
    const byDay: Record<string, number> = {};

    for (const evt of allEvents) {
      const country = evt.country || "Unknown";
      byCountry[country] = (byCountry[country] || 0) + 1;

      const browser = evt.browser || "Unknown";
      byBrowser[browser] = (byBrowser[browser] || 0) + 1;

      const os = evt.os || "Unknown";
      byOS[os] = (byOS[os] || 0) + 1;

      const device = evt.device_type || "desktop";
      byDevice[device] = (byDevice[device] || 0) + 1;

      const day = new Date(evt.created_at).toISOString().split("T")[0];
      byDay[day] = (byDay[day] || 0) + 1;
    }

    // Sort daily data
    const dailyDownloads = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Top referrers
    const byReferrer: Record<string, number> = {};
    for (const evt of allEvents) {
      const ref = evt.referrer || "Direct";
      byReferrer[ref] = (byReferrer[ref] || 0) + 1;
    }

    return NextResponse.json({
      totalDownloads: allEvents.length,
      totalBandwidth: allEvents.reduce((sum, e) => sum + (e.bytes_downloaded || 0), 0),
      dailyDownloads,
      byCountry: Object.entries(byCountry)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      byBrowser: Object.entries(byBrowser)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      byOS: Object.entries(byOS)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      byDevice: Object.entries(byDevice)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      byReferrer: Object.entries(byReferrer)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20),
      recentEvents: allEvents.slice(0, 50).map((e) => ({
        id: e.id,
        country: e.country,
        city: e.city,
        browser: e.browser,
        os: e.os,
        deviceType: e.device_type,
        referrer: e.referrer,
        createdAt: e.created_at,
      })),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
