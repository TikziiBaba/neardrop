import { NextRequest, NextResponse } from "next/server";
import { deleteR2Object, isR2Configured } from "@/lib/r2/s3-client";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";
import { extractClientInfo, recordAuditLog } from "@/lib/admin/audit";
import { formatBytes } from "@/lib/utils";

// GET: List files for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = getServiceClient();
    const { data: files, error } = await serviceClient
      .from("cloud_files")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Fetch share counts
    const { data: shares } = await serviceClient
      .from("share_links")
      .select("cloud_file_id, id, is_active")
      .eq("user_id", user.id);

    const shareCountMap: Record<string, number> = {};
    if (shares) {
      shares.forEach((s: any) => {
        if (s.is_active) {
          shareCountMap[s.cloud_file_id] = (shareCountMap[s.cloud_file_id] || 0) + 1;
        }
      });
    }

    const mappedFiles = (files || []).map((f: any) => ({
      id: f.id,
      userId: f.user_id,
      filename: f.filename,
      r2ObjectKey: f.r2_object_key,
      size: f.size,
      mimeType: f.mime_type,
      checksum: f.checksum,
      isDeleted: f.is_deleted,
      createdAt: f.created_at,
      expiresAt: f.expires_at,
      downloadsCount: 0,
      activeSharesCount: shareCountMap[f.id] || 0,
    }));

    return NextResponse.json({ files: mappedFiles });
  } catch (error: any) {
    console.error("Fetch files error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

// DELETE: Delete a file (DB + R2)
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await req.json();
    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    const serviceClient = getServiceClient();

    // Get file record to find R2 key
    const { data: file, error: fetchErr } = await serviceClient
      .from("cloud_files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete associated share links
    await serviceClient
      .from("share_links")
      .delete()
      .eq("cloud_file_id", fileId)
      .eq("user_id", user.id);

    // Delete from R2
    if (isR2Configured() && file.r2_object_key) {
      try {
        await deleteR2Object(file.r2_object_key);
      } catch (r2Err) {
        console.error("R2 delete error:", r2Err);
      }
    }

    // Delete from DB
    const { error: delErr } = await serviceClient
      .from("cloud_files")
      .delete()
      .eq("id", fileId)
      .eq("user_id", user.id);

    if (delErr) throw delErr;

    // Record audit log for deletion
    const client = extractClientInfo(req);
    recordAuditLog({
      action: "FILE_DELETE",
      resourceType: "file",
      userId: user.id,
      userEmail: user.email,
      resourceId: fileId,
      fileName: file.filename,
      fileSize: file.size,
      ipAddress: client.ipAddress,
      deviceInfo: client.deviceInfo,
      platform: client.platform,
      browser: client.browser,
      details: `${user.email || "User"} deleted "${file.filename}" (${formatBytes(file.size)}). [Device: ${client.deviceInfo}, IP: ${client.ipAddress}]`,
      metadata: { fileId, filename: file.filename, size: file.size, r2ObjectKey: file.r2_object_key },
      status: "warning",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete file error:", error);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}

// PATCH: Rename a file
export async function PATCH(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId, filename: newFilename } = await req.json();
    if (!fileId || !newFilename) {
      return NextResponse.json({ error: "fileId and filename are required" }, { status: 400 });
    }

    const serviceClient = getServiceClient();

    // Get old filename for logging
    const { data: oldFile } = await serviceClient
      .from("cloud_files")
      .select("filename, size")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    const { error } = await serviceClient
      .from("cloud_files")
      .update({ filename: newFilename })
      .eq("id", fileId)
      .eq("user_id", user.id);

    if (error) throw error;

    // Record audit log for rename
    const client = extractClientInfo(req);
    recordAuditLog({
      action: "FILE_RENAME",
      resourceType: "file",
      userId: user.id,
      userEmail: user.email,
      resourceId: fileId,
      fileName: newFilename,
      ipAddress: client.ipAddress,
      deviceInfo: client.deviceInfo,
      platform: client.platform,
      browser: client.browser,
      details: `${user.email || "User"} renamed file: "${oldFile?.filename || "old"}" ➔ "${newFilename}". [Device: ${client.deviceInfo}, IP: ${client.ipAddress}]`,
      metadata: { fileId, oldFilename: oldFile?.filename, newFilename },
      status: "success",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Rename file error:", error);
    return NextResponse.json({ error: "Failed to rename file" }, { status: 500 });
  }
}
