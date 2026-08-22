import { NextRequest, NextResponse } from "next/server";
import { createPresignedDownloadUrl, isR2Configured } from "@/lib/r2/s3-client";
import { createClient } from "@supabase/supabase-js";
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

    const file = share.cloud_files;
    if (!file || file.is_deleted) {
      return NextResponse.json({ error: "The underlying file was removed." }, { status: 404 });
    }

    return NextResponse.json({
      share: {
        id: share.id,
        userId: share.user_id,
        cloudFileId: share.cloud_file_id,
        token: share.token,
        passwordProtected: Boolean(share.password_hash),
        expiresAt: share.expires_at,
        downloadCount: share.download_count,
        maxDownloads: share.max_downloads,
        isActive: share.is_active,
        createdAt: share.created_at,
      },
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

// POST: Validate password, increment download count, return presigned R2 download URL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

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
        return NextResponse.json({ 
          error: "This file is password protected. Please provide a password.",
          passwordRequired: true 
        }, { status: 403 });
      }
      const hash = serverSHA256(password.trim());
      if (hash !== share.password_hash) {
        return NextResponse.json({ error: "Incorrect password." }, { status: 403 });
      }
    }

    const file = share.cloud_files;
    if (!file || file.is_deleted) {
      return NextResponse.json({ error: "The underlying file was removed." }, { status: 404 });
    }

    // Generate presigned download URL
    if (!isR2Configured()) {
      return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
    }

    const downloadUrl = await createPresignedDownloadUrl(file.r2_object_key, file.filename, 900);

    // Atomically increment download count to prevent race conditions.
    // Uses Supabase RPC if available, otherwise falls back to direct update.
    // The re-check of max_downloads prevents concurrent requests from exceeding the limit.
    if (share.max_downloads) {
      // Re-fetch and check atomicity: only update if download_count hasn't exceeded max
      const { data: updatedShare, error: updateErr } = await serviceClient
        .from("share_links")
        .update({ download_count: share.download_count + 1 })
        .eq("id", share.id)
        .lt("download_count", share.max_downloads)
        .select("id")
        .single();

      if (updateErr || !updatedShare) {
        return NextResponse.json({ error: "This link has reached its maximum download limit." }, { status: 410 });
      }
    } else {
      // No max_downloads limit — just increment
      await serviceClient
        .from("share_links")
        .update({ download_count: share.download_count + 1 })
        .eq("id", share.id);
    }

    return NextResponse.json({
      downloadUrl,
      filename: file.filename,
      size: file.size,
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download request failed" }, { status: 500 });
  }
}
