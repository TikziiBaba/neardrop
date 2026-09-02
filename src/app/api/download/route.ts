import { NextRequest, NextResponse } from "next/server";
import { createPresignedDownloadUrl, isR2Configured } from "@/lib/r2/s3-client";
import { createClient } from "@supabase/supabase-js";
import { extractClientInfo, recordAuditLog } from "@/lib/admin/audit";
import { formatBytes } from "@/lib/utils";
import { checkRateLimit, tooManyRequestsResponse } from "@/lib/utils/rate-limiter";
import crypto from "crypto";

function serverSHA256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, serviceKey);
}

// GET: Fetch share metadata for public share landing page
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(ip, "/s/");
  if (!rl.allowed) return tooManyRequestsResponse(rl);

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token || token.length < 8 || token.length > 64) {
      return NextResponse.json({ error: "Invalid share token." }, { status: 400 });
    }

    const serviceClient = getServiceClient();

    const { data: share, error: shareErr } = await serviceClient
      .from("share_links")
      .select("*, cloud_files(*)")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (shareErr || !share) {
      return NextResponse.json({ error: "Share link not found or has been revoked." }, { status: 404 });
    }

    if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "This share link has expired." }, { status: 410 });
    }

    if (share.max_downloads && share.download_count >= share.max_downloads) {
      return NextResponse.json({ error: "This link has reached its maximum download limit." }, { status: 410 });
    }

    const isFolder = Boolean(share.folder_path);

    const shareData = {
      id: share.id,
      userId: share.user_id,
      cloudFileId: share.cloud_file_id,
      folderPath: share.folder_path || undefined,
      title: share.title || (isFolder ? share.folder_path?.split("/").pop() : undefined),
      description: share.description || undefined,
      token: share.token,
      passwordProtected: Boolean(share.password_hash),
      expiresAt: share.expires_at,
      downloadCount: share.download_count,
      maxDownloads: share.max_downloads,
      isActive: share.is_active,
      createdAt: share.created_at,
      isFolder,
    };

    if (isFolder && share.folder_path) {
      // Query all files for user matching this folder path
      const prefix = `${share.folder_path}/`;
      const { data: folderFiles, error: filesErr } = await serviceClient
        .from("cloud_files")
        .select("*")
        .eq("user_id", share.user_id)
        .eq("is_deleted", false)
        .or(`filename.eq."${share.folder_path}",filename.ilike."${prefix}%"`)
        .order("filename", { ascending: true });

      if (filesErr) throw filesErr;

      const activeFiles = (folderFiles || []).map((f: any) => ({
        id: f.id,
        userId: f.user_id,
        filename: f.filename,
        size: f.size,
        mimeType: f.mime_type,
        checksum: f.checksum,
        isDeleted: f.is_deleted,
        createdAt: f.created_at,
      }));

      const totalSize = activeFiles.reduce((acc: number, f: any) => acc + (f.size || 0), 0);

      return NextResponse.json({
        share: shareData,
        isFolder: true,
        folderPath: share.folder_path,
        title: share.title || share.folder_path.split("/").pop(),
        description: share.description,
        files: activeFiles,
        totalSize,
        totalCount: activeFiles.length,
      });
    }

    // Single File share
    const file = share.cloud_files;
    if (!file || file.is_deleted) {
      return NextResponse.json({ error: "The underlying file was removed." }, { status: 404 });
    }

    return NextResponse.json({
      share: shareData,
      isFolder: false,
      file: {
        id: file.id,
        userId: file.user_id,
        filename: file.filename,
        size: file.size,
        mimeType: file.mime_type,
        checksum: file.checksum,
        isDeleted: file.is_deleted,
        createdAt: file.created_at,
      },
    });
  } catch (error: any) {
    console.error("Share fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch share info" }, { status: 500 });
  }
}

// POST: Validate password, increment download count, return presigned R2 download URL(s)
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(ip, "/api/download");
  if (!rl.allowed) return tooManyRequestsResponse(rl);

  try {
    const body = await req.json();
    const { token, password, fileId, batch } = body;

    if (!token || token.length < 8 || token.length > 64) {
      return NextResponse.json({ error: "Invalid share token." }, { status: 400 });
    }

    const serviceClient = getServiceClient();

    // Fetch share link by token
    const { data: share, error: shareErr } = await serviceClient
      .from("share_links")
      .select("*, cloud_files(*)")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (shareErr || !share) {
      return NextResponse.json({ error: "Share link not found or has been revoked." }, { status: 404 });
    }

    // Check expiry
    if (share.expires_at && new Date(share.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "This share link has expired." }, { status: 410 });
    }

    // Check max downloads
    if (share.max_downloads && share.download_count >= share.max_downloads) {
      return NextResponse.json({ error: "This link has reached its maximum download limit." }, { status: 410 });
    }

    // Check password
    if (share.password_hash) {
      if (!password) {
        return NextResponse.json(
          {
            error: "This share is password protected. Please provide a password.",
            passwordRequired: true,
          },
          { status: 403 }
        );
      }
      const hash = serverSHA256(password.trim());
      if (hash !== share.password_hash) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 403 });
      }
    }

    if (!isR2Configured()) {
      return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
    }

    const isFolder = Boolean(share.folder_path);
    const client = extractClientInfo(req);

    // Atomically increment download count helper & burn-after-read
    const incrementDownloadCount = async () => {
      const newCount = (share.download_count || 0) + 1;
      const shouldDeactivate = share.burn_after_read || (share.max_downloads && newCount >= share.max_downloads);

      await serviceClient
        .from("share_links")
        .update({
          download_count: newCount,
          is_active: !shouldDeactivate,
        })
        .eq("id", share.id);
    };

    // Helper: record download event for analytics
    const recordDownloadEvent = async (targetFileId?: string, downloadedBytes?: number) => {
      try {
        await serviceClient.from("download_events").insert({
          share_link_id: share.id,
          cloud_file_id: targetFileId || share.cloud_file_id || null,
          user_id: share.user_id,
          downloader_ip: client.ipAddress,
          country: req.headers.get("cf-ipcountry") || "TR",
          city: req.headers.get("cf-ipcity") || "Istanbul",
          browser: client.browser,
          os: client.platform,
          device_type: client.deviceInfo.toLowerCase().includes("mobile") ? "mobile" : "desktop",
          referrer: req.headers.get("referer") || "Direct",
          user_agent: req.headers.get("user-agent") || "",
          bytes_downloaded: downloadedBytes || 0,
        });
      } catch (err) {
        console.error("Failed to record download analytics event:", err);
      }
    };

    // Case 1: Folder Share with batch download request (for ZIP generator or bulk download)
    if (isFolder && batch) {
      const prefix = `${share.folder_path}/`;
      const { data: folderFiles, error: filesErr } = await serviceClient
        .from("cloud_files")
        .select("*")
        .eq("user_id", share.user_id)
        .eq("is_deleted", false)
        .or(`filename.eq."${share.folder_path}",filename.ilike."${prefix}%"`);

      if (filesErr || !folderFiles || folderFiles.length === 0) {
        return NextResponse.json({ error: "No files found in this shared folder." }, { status: 404 });
      }

      let totalFolderBytes = 0;
      // Generate presigned URLs for all files
      const items = await Promise.all(
        folderFiles.map(async (f: any) => {
          totalFolderBytes += f.size || 0;
          const downloadUrl = await createPresignedDownloadUrl(f.r2_object_key, f.filename, 1800);
          let relativePath = f.filename;
          if (f.filename.startsWith(prefix)) {
            relativePath = f.filename.slice(prefix.length);
          } else if (f.filename === share.folder_path) {
            relativePath = f.filename.split("/").pop() || f.filename;
          }
          return {
            id: f.id,
            filename: f.filename.split("/").pop() || f.filename,
            fullPath: f.filename,
            relativePath,
            size: f.size,
            mimeType: f.mime_type,
            downloadUrl,
          };
        })
      );

      await incrementDownloadCount();
      await recordDownloadEvent(undefined, totalFolderBytes);

      return NextResponse.json({
        isFolder: true,
        folderName: share.folder_path.split("/").pop() || "download",
        items,
      });
    }

    // Case 2: Folder Share with single file download requested (fileId provided)
    if (isFolder && fileId) {
      const { data: specificFile, error: fileErr } = await serviceClient
        .from("cloud_files")
        .select("*")
        .eq("id", fileId)
        .eq("user_id", share.user_id)
        .eq("is_deleted", false)
        .single();

      if (fileErr || !specificFile) {
        return NextResponse.json({ error: "File not found." }, { status: 404 });
      }

      const downloadUrl = await createPresignedDownloadUrl(
        specificFile.r2_object_key,
        specificFile.filename,
        900
      );

      await incrementDownloadCount();
      await recordDownloadEvent(specificFile.id, specificFile.size);

      return NextResponse.json({
        downloadUrl,
        filename: specificFile.filename.split("/").pop() || specificFile.filename,
        size: specificFile.size,
      });
    }

    // Case 3: Single File Share
    const file = share.cloud_files;
    if (!file || file.is_deleted) {
      return NextResponse.json({ error: "The underlying file was removed." }, { status: 404 });
    }

    const downloadUrl = await createPresignedDownloadUrl(file.r2_object_key, file.filename, 900);
    await incrementDownloadCount();
    await recordDownloadEvent(file.id, file.size);

    // Record audit log for public share download
    recordAuditLog({
      action: "SHARE_DOWNLOAD",
      resourceType: "download",
      userId: share.user_id,
      resourceId: share.id,
      fileName: file.filename,
      fileSize: file.size,
      ipAddress: client.ipAddress,
      deviceInfo: client.deviceInfo,
      platform: client.platform,
      browser: client.browser,
      details: `File downloaded via share link: "${file.filename}" (${formatBytes(file.size)}) [Link: /s/${token}, Device: ${client.deviceInfo}, IP: ${client.ipAddress}]`,
      metadata: { token, fileId: file.id, filename: file.filename, size: file.size },
      status: "success",
    });

    return NextResponse.json({
      downloadUrl,
      filename: file.filename.split("/").pop() || file.filename,
      size: file.size,
      isEncrypted: file.is_encrypted || false,
      encryptionIv: file.encryption_iv || undefined,
      burnAfterRead: share.burn_after_read || false,
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download request failed" }, { status: 500 });
  }
}
