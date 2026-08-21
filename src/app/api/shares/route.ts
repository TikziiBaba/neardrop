import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function serverSHA256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function generateSecureToken(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, serviceKey);
}

// GET: List share links for authenticated user
export async function GET(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = getServiceClient();
    const { data: shares, error } = await serviceClient
      .from("share_links")
      .select("*, cloud_files(filename, size, mime_type)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const mapped = (shares || []).map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      cloudFileId: s.cloud_file_id,
      token: s.token,
      passwordProtected: Boolean(s.password_hash),
      passwordHash: s.password_hash,
      expiresAt: s.expires_at,
      downloadCount: s.download_count,
      maxDownloads: s.max_downloads,
      isActive: s.is_active,
      createdAt: s.created_at,
      cloudFile: s.cloud_files ? {
        filename: s.cloud_files.filename,
        size: s.cloud_files.size,
        mimeType: s.cloud_files.mime_type,
      } : undefined,
    }));

    return NextResponse.json({ shares: mapped });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch shares" }, { status: 500 });
  }
}

// POST: Create a new share link
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { cloudFileId, expiresInHours, maxDownloads, password } = body;

    if (!cloudFileId) {
      return NextResponse.json({ error: "Missing cloudFileId" }, { status: 400 });
    }

    const token = generateSecureToken(12);
    let passwordHash: string | null = null;

    if (password && password.trim().length > 0) {
      passwordHash = serverSHA256(password.trim());
    }

    let expiresAt: string | null = null;
    if (expiresInHours && expiresInHours > 0) {
      expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();
    }

    const serviceClient = getServiceClient();
    const { data: share, error } = await serviceClient
      .from("share_links")
      .insert({
        user_id: session.user.id,
        cloud_file_id: cloudFileId,
        token,
        password_hash: passwordHash,
        expires_at: expiresAt,
        max_downloads: maxDownloads || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
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
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create share link" }, { status: 500 });
  }
}

// PATCH: Toggle active state or update expiry
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { shareId, isActive, expiresInHours } = body;

    if (!shareId) {
      return NextResponse.json({ error: "shareId is required" }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    const updates: Record<string, any> = {};

    if (typeof isActive === "boolean") {
      updates.is_active = isActive;
    }

    if (typeof expiresInHours === "number") {
      updates.expires_at = expiresInHours > 0
        ? new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString()
        : null;
    }

    const { error } = await serviceClient
      .from("share_links")
      .update(updates)
      .eq("id", shareId)
      .eq("user_id", session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update share" }, { status: 500 });
  }
}

// DELETE: Delete a share link
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shareId } = await req.json();
    if (!shareId) {
      return NextResponse.json({ error: "shareId is required" }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    const { error } = await serviceClient
      .from("share_links")
      .delete()
      .eq("id", shareId)
      .eq("user_id", session.user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete share" }, { status: 500 });
  }
}
