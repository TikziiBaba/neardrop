import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";
import { extractClientInfo, recordAuditLog } from "@/lib/admin/audit";
import { purgeFiles, TRASH_RETENTION_DAYS } from "@/lib/storage/purge";
import { formatBytes } from "@/lib/utils";

export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

// GET: Çöp kutusundaki dosyalar (süresi dolanlar önce kalıcı silinir)
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const serviceClient = getServiceClient();
    const cutoff = new Date(Date.now() - TRASH_RETENTION_DAYS * DAY_MS).toISOString();

    // 30 günü geçenleri temizle (zamanlanmış görev çalışmasa bile çöp kutusu kendini temiz tutar)
    const { data: expired } = await serviceClient
      .from("cloud_files")
      .select("id, r2_object_key, thumbnail_key")
      .eq("user_id", user.id)
      .eq("is_deleted", true)
      .lt("deleted_at", cutoff);
    if (expired?.length) await purgeFiles(serviceClient, user.id, expired);

    const { data, error } = await serviceClient
      .from("cloud_files")
      .select("id, filename, size, mime_type, deleted_at, created_at")
      .eq("user_id", user.id)
      .eq("is_deleted", true)
      .order("deleted_at", { ascending: false, nullsFirst: false });
    if (error) throw error;

    const files = (data || []).map((f: any) => {
      // deleted_at olmayan eski kayıtlar (bu özellikten önce silinmiş) için tam süre gösterilir
      const deletedAt = f.deleted_at || f.created_at;
      const purgeAt = new Date(new Date(deletedAt).getTime() + TRASH_RETENTION_DAYS * DAY_MS);
      return {
        id: f.id,
        filename: f.filename,
        size: f.size,
        mimeType: f.mime_type,
        deletedAt,
        daysLeft: Math.max(0, Math.ceil((purgeAt.getTime() - Date.now()) / DAY_MS)),
      };
    });

    return NextResponse.json({ files, retentionDays: TRASH_RETENTION_DAYS });
  } catch (error) {
    console.error("Trash list error:", error);
    return NextResponse.json({ error: "Failed to load trash" }, { status: 500 });
  }
}

// POST: { action: "restore" | "purge", fileIds?: string[], all?: boolean }
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { action, fileIds, all } = await req.json().catch(() => ({}));
    if (action !== "restore" && action !== "purge") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    if (!all && (!Array.isArray(fileIds) || fileIds.length === 0)) {
      return NextResponse.json({ error: "fileIds is required" }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    let query = serviceClient
      .from("cloud_files")
      .select("id, filename, size, r2_object_key, thumbnail_key")
      .eq("user_id", user.id)
      .eq("is_deleted", true);
    if (!all) query = query.in("id", fileIds.slice(0, 500));
    const { data: rows, error } = await query;
    if (error) throw error;
    if (!rows?.length) return NextResponse.json({ error: "No matching files in trash" }, { status: 404 });

    const client = extractClientInfo(req);
    const totalBytes = rows.reduce((sum: number, r: any) => sum + (r.size || 0), 0);

    if (action === "restore") {
      // Geri yüklenen dosyalar kotaya tekrar eklenir; kota yetmiyorsa hiçbiri geri yüklenmez
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("quota_bytes, used_bytes")
        .eq("id", user.id)
        .single();
      const quota = profile?.quota_bytes || 2147483648;
      const used = profile?.used_bytes || 0;
      if (used + totalBytes > quota) {
        return NextResponse.json(
          { error: `Geri yüklemek için ${formatBytes(used + totalBytes - quota)} daha boş alan gerekiyor.` },
          { status: 413 }
        );
      }

      const { error: restoreErr } = await serviceClient
        .from("cloud_files")
        .update({ is_deleted: false, deleted_at: null })
        .eq("user_id", user.id)
        .in(
          "id",
          rows.map((r: any) => r.id)
        );
      if (restoreErr) throw restoreErr;

      recordAuditLog({
        action: "FILE_RESTORE",
        resourceType: "file",
        userId: user.id,
        userEmail: user.email,
        ipAddress: client.ipAddress,
        deviceInfo: client.deviceInfo,
        platform: client.platform,
        browser: client.browser,
        details: `${user.email || "User"} restored ${rows.length} file(s) (${formatBytes(totalBytes)}) from trash.`,
        metadata: { fileIds: rows.map((r: any) => r.id) },
        status: "success",
      });
      return NextResponse.json({ success: true, restored: rows.length });
    }

    const purged = await purgeFiles(serviceClient, user.id, rows);
    recordAuditLog({
      action: "FILE_DELETE",
      resourceType: "file",
      userId: user.id,
      userEmail: user.email,
      ipAddress: client.ipAddress,
      deviceInfo: client.deviceInfo,
      platform: client.platform,
      browser: client.browser,
      details: `${user.email || "User"} permanently deleted ${purged} file(s) (${formatBytes(totalBytes)}) from trash.`,
      metadata: { fileIds: rows.map((r: any) => r.id), filenames: rows.map((r: any) => r.filename) },
      status: "warning",
    });
    return NextResponse.json({ success: true, purged });
  } catch (error) {
    console.error("Trash action error:", error);
    return NextResponse.json({ error: "Trash action failed" }, { status: 500 });
  }
}
