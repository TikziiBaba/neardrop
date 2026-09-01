import { NextRequest, NextResponse } from "next/server";
import { createPresignedUploadUrl, getR2Client, isR2Configured } from "@/lib/r2/s3-client";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";
import { sanitizeFilename, isDangerousExtension, isFileSizeValid, MAX_UPLOAD_SIZE } from "@/lib/utils/sanitize";
import { validateUploadSize } from "@/lib/subscription/permissions";
import { extractClientInfo, recordAuditLog } from "@/lib/admin/audit";
import { formatBytes } from "@/lib/utils";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = getServiceClient();
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("quota_bytes, used_bytes, role, subscription_tier")
      .eq("id", user.id)
      .single();

    const userTier = profile?.subscription_tier || "free";
    const userRole = profile?.role || "member";

    const contentType = req.headers.get("content-type") || "";

    // 1. Direct Multipart Form-Data Upload (Proxy to R2)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const rawFilename = (formData.get("filename") as string) || file.name;
      const filename = sanitizeFilename(rawFilename);
      const size = file.size;
      const mimeType = file.type || "application/octet-stream";

      // Security: Block dangerous file extensions
      if (isDangerousExtension(filename)) {
        return NextResponse.json({ error: "This file type is not allowed for security reasons." }, { status: 400 });
      }

      // Security: Validate file size
      if (!isFileSizeValid(size)) {
        return NextResponse.json(
          { error: `File size must be between 1 byte and ${Math.round(MAX_UPLOAD_SIZE / (1024 * 1024 * 1024))} GB.` },
          { status: 400 }
        );
      }

      // Tier check: Validate single file upload size for user's tier
      const sizeValidation = validateUploadSize(size, userTier, userRole);
      if (!sizeValidation.allowed) {
        return NextResponse.json({ error: sizeValidation.error }, { status: 400 });
      }

      // Security: Check user quota
      if (profile) {
        const quotaBytes = profile.quota_bytes || 2147483648; // 2 GB default
        const usedBytes = profile.used_bytes || 0;
        if (usedBytes + size > quotaBytes) {
          return NextResponse.json(
            { error: "Your storage quota is full. Delete some files or upgrade your plan to upload new files." },
            { status: 413 }
          );
        }
      }

      const fileId = crypto.randomUUID();
      const r2ObjectKey = `users/${user.id}/${fileId}/${filename}`;

      if (!isR2Configured()) {
        return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
      }

      // Upload directly from server to R2
      const s3 = getR2Client();
      const buffer = Buffer.from(await file.arrayBuffer());
      const bucketName = process.env.R2_BUCKET_NAME || "neardrop";

      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: r2ObjectKey,
          Body: buffer,
          ContentType: mimeType,
        })
      );

      // Insert record into Supabase
      const { error: dbError } = await serviceClient
        .from("cloud_files")
        .insert({
          id: fileId,
          user_id: user.id,
          filename,
          r2_object_key: r2ObjectKey,
          size,
          mime_type: mimeType,
          is_deleted: false,
        });

      if (dbError) {
        console.error("DB insert error:", dbError);
        return NextResponse.json({ error: "Failed to save file record." }, { status: 500 });
      }

      // Record detailed audit log
      const client = extractClientInfo(req);
      recordAuditLog({
        action: "FILE_UPLOAD",
        resourceType: "file",
        userId: user.id,
        userEmail: user.email,
        resourceId: fileId,
        fileName: filename,
        fileSize: size,
        ipAddress: client.ipAddress,
        deviceInfo: client.deviceInfo,
        platform: client.platform,
        browser: client.browser,
        details: `${user.email || "User"} uploaded "${filename}" (${formatBytes(size)}). [Device: ${client.deviceInfo}, IP: ${client.ipAddress}]`,
        metadata: { mimeType, r2ObjectKey, fileId, uploadMode: "direct_multipart" },
        status: "success",
      });

      return NextResponse.json({
        success: true,
        fileId,
        r2ObjectKey,
      });
    }

    // 2. Presigned Upload URL generation (JSON request)
    const body = await req.json();
    const { filename: rawFilename, size, mimeType } = body;

    if (!rawFilename || !size) {
      return NextResponse.json({ error: "Filename and size are required" }, { status: 400 });
    }

    const filename = sanitizeFilename(rawFilename);

    // Security: Block dangerous file extensions
    if (isDangerousExtension(filename)) {
      return NextResponse.json({ error: "This file type is not allowed for security reasons." }, { status: 400 });
    }

    // Security: Validate file size
    if (!isFileSizeValid(size)) {
      return NextResponse.json(
        { error: `File size must be between 1 byte and ${Math.round(MAX_UPLOAD_SIZE / (1024 * 1024 * 1024))} GB.` },
        { status: 400 }
      );
    }

    // Tier check: Validate single file upload size for user's tier
    const sizeValidation = validateUploadSize(size, userTier, userRole);
    if (!sizeValidation.allowed) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 400 });
    }

    // Security: Check user quota
    if (profile) {
      const quotaBytes = profile.quota_bytes || 2147483648;
      const usedBytes = profile.used_bytes || 0;
      if (usedBytes + size > quotaBytes) {
        return NextResponse.json(
          { error: "Your storage quota is full. Delete some files or upgrade your plan to upload new files." },
          { status: 413 }
        );
      }
    }

    const fileId = crypto.randomUUID();
    const r2ObjectKey = `users/${user.id}/${fileId}/${filename}`;

    if (!isR2Configured()) {
      return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
    }

    const uploadUrl = await createPresignedUploadUrl(
      r2ObjectKey,
      mimeType || "application/octet-stream",
      size
    );

    // Insert file record into Supabase
    const { error: dbError } = await serviceClient
      .from("cloud_files")
      .insert({
        id: fileId,
        user_id: user.id,
        filename,
        r2_object_key: r2ObjectKey,
        size,
        mime_type: mimeType || "application/octet-stream",
        is_deleted: false,
      });

    if (dbError) {
      console.error("DB insert error:", dbError);
      return NextResponse.json({ error: "Failed to save file record." }, { status: 500 });
    }

    // Record detailed audit log for presigned direct upload
    const client = extractClientInfo(req);
    recordAuditLog({
      action: "FILE_UPLOAD",
      resourceType: "file",
      userId: user.id,
      userEmail: user.email,
      resourceId: fileId,
      fileName: filename,
      fileSize: size,
      ipAddress: client.ipAddress,
      deviceInfo: client.deviceInfo,
      platform: client.platform,
      browser: client.browser,
      details: `${user.email || "User"} uploaded "${filename}" (${formatBytes(size)}) via direct presigned upload. [Device: ${client.deviceInfo}, IP: ${client.ipAddress}]`,
      metadata: { mimeType, r2ObjectKey, fileId, uploadMode: "presigned_direct" },
      status: "success",
    });

    return NextResponse.json({
      uploadUrl,
      r2ObjectKey,
      fileId,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload request failed" }, { status: 500 });
  }
}
