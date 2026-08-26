import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";
import crypto from "crypto";

function serverSHA256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function generateSecureToken(length = 12): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
}

// GET: List share links for authenticated user
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = getServiceClient();

    // Fetch user's active files to calculate folder metrics
    const [sharesRes, filesRes] = await Promise.all([
      serviceClient
        .from("share_links")
        .select("*, cloud_files(filename, size, mime_type)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      serviceClient
        .from("cloud_files")
        .select("id, filename, size")
        .eq("user_id", user.id)
        .eq("is_deleted", false),
    ]);

    if (sharesRes.error) throw sharesRes.error;

    const allUserFiles = filesRes.data || [];

    const mapped = (sharesRes.data || []).map((s: any) => {
      const isFolder = Boolean(s.folder_path);
      let folderFilesCount = 0;
      let folderTotalBytes = 0;

      if (isFolder && s.folder_path) {
        const prefix = `${s.folder_path}/`;
        const matchingFiles = allUserFiles.filter(
          (f: any) => f.filename === s.folder_path || f.filename.startsWith(prefix)
        );
        folderFilesCount = matchingFiles.length;
        folderTotalBytes = matchingFiles.reduce((acc: number, cur: any) => acc + (cur.size || 0), 0);
      }

      return {
        id: s.id,
        userId: s.user_id,
        cloudFileId: s.cloud_file_id,
        folderPath: s.folder_path || undefined,
        title: s.title || (isFolder ? s.folder_path?.split("/").pop() : undefined),
        description: s.description || undefined,
        isFolder,
        folderFilesCount,
        folderTotalBytes,
        token: s.token,
        passwordProtected: Boolean(s.password_hash),
        passwordHash: s.password_hash,
        expiresAt: s.expires_at,
        downloadCount: s.download_count,
        maxDownloads: s.max_downloads,
        isActive: s.is_active,
        createdAt: s.created_at,
        cloudFile: s.cloud_files
          ? {
              filename: s.cloud_files.filename,
              size: s.cloud_files.size,
              mimeType: s.cloud_files.mime_type,
            }
          : undefined,
      };
    });

    return NextResponse.json({ shares: mapped });
  } catch (error: any) {
    console.error("Fetch shares error:", error);
    return NextResponse.json({ error: "Failed to fetch shares" }, { status: 500 });
  }
}

// POST: Create a new share link (supports both single file and folder)
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { cloudFileId, folderPath, title, description, expiresInHours, maxDownloads, password } = body;

    if (!cloudFileId && !folderPath) {
      return NextResponse.json({ error: "Either cloudFileId or folderPath is required" }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    let effectiveCloudFileId = cloudFileId || null;

    // If it's a folder share and cloud_file_id is null, find the first file inside folder as a safe fallback
    if (folderPath && !effectiveCloudFileId) {
      const prefix = `${folderPath}/`;
      const { data: sampleFiles } = await serviceClient
        .from("cloud_files")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .or(`filename.eq."${folderPath}",filename.ilike."${prefix}%"`)
        .limit(1);

      if (sampleFiles && sampleFiles.length > 0) {
        effectiveCloudFileId = sampleFiles[0].id;
      }
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

    const insertPayload: Record<string, any> = {
      user_id: user.id,
      cloud_file_id: effectiveCloudFileId,
      token,
      password_hash: passwordHash,
      expires_at: expiresAt,
      max_downloads: maxDownloads || null,
      is_active: true,
    };

    if (folderPath) {
      insertPayload.folder_path = folderPath;
      insertPayload.title = title || folderPath.split("/").pop();
      insertPayload.description = description || null;
    }

    const { data: share, error } = await serviceClient
      .from("share_links")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      // If error was due to unknown columns (in case migration is not run), fallback without new columns
      if (error.message?.includes("column") && error.message?.includes("folder_path")) {
        delete insertPayload.folder_path;
        delete insertPayload.title;
        delete insertPayload.description;
        const fallbackRes = await serviceClient
          .from("share_links")
          .insert(insertPayload)
          .select()
          .single();
        if (fallbackRes.error) throw fallbackRes.error;
        return NextResponse.json({
          id: fallbackRes.data.id,
          userId: fallbackRes.data.user_id,
          cloudFileId: fallbackRes.data.cloud_file_id,
          folderPath: folderPath || undefined,
          token: fallbackRes.data.token,
          passwordProtected: Boolean(fallbackRes.data.password_hash),
          expiresAt: fallbackRes.data.expires_at,
          downloadCount: fallbackRes.data.download_count,
          maxDownloads: fallbackRes.data.max_downloads,
          isActive: fallbackRes.data.is_active,
          createdAt: fallbackRes.data.created_at,
        });
      }
      throw error;
    }

    return NextResponse.json({
      id: share.id,
      userId: share.user_id,
      cloudFileId: share.cloud_file_id,
      folderPath: share.folder_path,
      title: share.title,
      description: share.description,
      token: share.token,
      passwordProtected: Boolean(share.password_hash),
      expiresAt: share.expires_at,
      downloadCount: share.download_count,
      maxDownloads: share.max_downloads,
      isActive: share.is_active,
      createdAt: share.created_at,
    });
  } catch (error: any) {
    console.error("Create share error:", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}

// PATCH: Toggle active state or update expiry
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
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
      updates.expires_at =
        expiresInHours > 0 ? new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString() : null;
    }

    const { error } = await serviceClient
      .from("share_links")
      .update(updates)
      .eq("id", shareId)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update share error:", error);
    return NextResponse.json({ error: "Failed to update share" }, { status: 500 });
  }
}

// DELETE: Delete a share link
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
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
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete share error:", error);
    return NextResponse.json({ error: "Failed to delete share" }, { status: 500 });
  }
}
