import { NextRequest, NextResponse } from "next/server";
import { createPresignedDownloadUrl, isR2Configured } from "@/lib/r2/s3-client";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";
import { extractClientInfo, recordAuditLog } from "@/lib/admin/audit";
import { formatBytes } from "@/lib/utils";

// POST: Generate presigned download URL for authenticated file owner
export async function POST(req: NextRequest) {
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
    const { data: file, error: fetchErr } = await serviceClient
      .from("cloud_files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!isR2Configured()) {
      return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
    }

    const downloadUrl = await createPresignedDownloadUrl(file.r2_object_key, file.filename, 900);

    // Record audit log for file download
    const client = extractClientInfo(req);
    recordAuditLog({
      action: "FILE_DOWNLOAD",
      resourceType: "download",
      userId: user.id,
      userEmail: user.email,
      resourceId: fileId,
      fileName: file.filename,
      fileSize: file.size,
      ipAddress: client.ipAddress,
      deviceInfo: client.deviceInfo,
      platform: client.platform,
      browser: client.browser,
      details: `${user.email || "User"} downloaded "${file.filename}" (${formatBytes(file.size)}). [Device: ${client.deviceInfo}, IP: ${client.ipAddress}]`,
      metadata: { fileId, filename: file.filename, size: file.size },
      status: "success",
    });

    return NextResponse.json({
      downloadUrl,
      filename: file.filename,
      size: file.size,
    });
  } catch (error: any) {
    console.error("File download error:", error);
    return NextResponse.json({ error: "Download request failed" }, { status: 500 });
  }
}
