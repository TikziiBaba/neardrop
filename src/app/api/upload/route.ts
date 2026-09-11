import { NextRequest, NextResponse } from "next/server";
import { createPresignedUploadUrl, getR2Client, isR2Configured } from "@/lib/r2/s3-client";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";
import { sanitizeFilename, isFileSizeValid, MAX_UPLOAD_SIZE } from "@/lib/utils/sanitize";
import { validateUploadSize } from "@/lib/subscription/permissions";
import { extractClientInfo, recordAuditLog } from "@/lib/admin/audit";
import { formatBytes } from "@/lib/utils";
import { checkRateLimit, tooManyRequestsResponse } from "@/lib/utils/rate-limiter";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { scanFileBuffer } from "@/lib/security/malware-scanner";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit per authenticated user (generous sliding window for bulk uploads)
    const rl = checkRateLimit(user.id, "/api/upload");
    if (!rl.allowed) return tooManyRequestsResponse(rl);

    const serviceClient = getServiceClient();
    const { data: profile } = await serviceClient
      .from("profiles")
      .select("quota_bytes, used_bytes, role, subscription_tier")
      .eq("id", user.id)
      .single();

    const userTier = profile?.subscription_tier || "free";
    const userRole = profile?.role || "member";
    const quotaBytes = profile?.quota_bytes || 2147483648; // 2 GB default
    let usedBytes = profile?.used_bytes || 0;

    const contentType = req.headers.get("content-type") || "";

    // 1. Direct Multipart Form-Data Upload (Proxy to R2, for small files)
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

      // Security: Prevent server heap exhaustion on large tunnel uploads
      if (size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Files larger than 100 MB must be uploaded via direct storage." },
          { status: 413 }
        );
      }

      // Security: Read buffer for security scan and upload
      const buffer = Buffer.from(await file.arrayBuffer());

      // Security: Multi-layer malware, webshell & threat scan
      const scanResult = await scanFileBuffer({
        buffer,
        filename,
        mimeType,
      });

      if (scanResult.isMalicious) {
        const client = extractClientInfo(req);
        recordAuditLog({
          action: "MALWARE_BLOCKED",
          resourceType: "file",
          userId: user.id,
          userEmail: user.email,
          fileName: filename,
          fileSize: size,
          ipAddress: client.ipAddress,
          deviceInfo: client.deviceInfo,
          platform: client.platform,
          browser: client.browser,
          details: `Threat detected in "${filename}". Threat: ${scanResult.threatName}. Upload blocked.`,
          metadata: {
            threatName: scanResult.threatName,
            threatCategory: scanResult.threatCategory,
            sha256: scanResult.sha256,
            scanEngine: scanResult.scanEngine,
          },
          status: "danger",
        });

        return NextResponse.json(
          {
            error: `Zararlı dosya tespit edildi (${scanResult.threatName}). Güvenliğiniz için bu dosya yüklenemez.`,
            threat: scanResult.threatName,
            details: scanResult.details,
          },
          { status: 422 }
        );
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
      if (usedBytes + size > quotaBytes) {
        return NextResponse.json(
          { error: "Your storage quota is full. Delete some files or upgrade your plan to upload new files." },
          { status: 413 }
        );
      }

      const fileId = crypto.randomUUID();
      const r2ObjectKey = `users/${user.id}/${fileId}/${filename}`;

      if (!isR2Configured()) {
        return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
      }

      // Upload directly from server to R2
      const s3 = getR2Client();
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
          checksum: scanResult.sha256,
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

    // 2. Presigned Upload URL generation (JSON request - single or batch)
    const body = await req.json();

    if (!isR2Configured()) {
      return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
    }

    // BATCH MODE: Handles multiple files in a single network roundtrip
    if (body.files && Array.isArray(body.files)) {
      const batchItems = body.files;
      const results: Array<{
        fileId?: string;
        uploadUrl?: string;
        r2ObjectKey?: string;
        filename: string;
        size: number;
        error?: string;
      }> = [];

      for (const item of batchItems) {
        const { filename: rawFilename, size, mimeType, isEncrypted, encryptionIv, sha256, headerSample } = item;
        if (!rawFilename || typeof size !== "number" || size < 0) {
          results.push({ filename: rawFilename || "unknown", size: size ?? 0, error: "Filename and valid size are required" });
          continue;
        }

        const filename = sanitizeFilename(rawFilename);

        // Security: Multi-layer malware and header inspection
        const sampleBuf = headerSample ? Buffer.from(headerSample, "base64") : Buffer.alloc(0);
        const scanResult = await scanFileBuffer({
          buffer: sampleBuf,
          filename,
          mimeType,
          sha256,
        });

        if (scanResult.isMalicious) {
          const client = extractClientInfo(req);
          recordAuditLog({
            action: "MALWARE_BLOCKED",
            resourceType: "file",
            userId: user.id,
            userEmail: user.email,
            fileName: filename,
            fileSize: size,
            ipAddress: client.ipAddress,
            deviceInfo: client.deviceInfo,
            platform: client.platform,
            browser: client.browser,
            details: `Malware detected in batch item "${filename}". Threat: ${scanResult.threatName}. Upload rejected.`,
            metadata: { threatName: scanResult.threatName, threatCategory: scanResult.threatCategory, sha256: scanResult.sha256 },
            status: "danger",
          });

          results.push({
            filename,
            size,
            error: `Zararlı dosya tespit edildi: ${scanResult.threatName}`,
          });
          continue;
        }

        if (!isFileSizeValid(size)) {
          results.push({
            filename,
            size,
            error: `Dosya boyutu 0 ile ${Math.round(MAX_UPLOAD_SIZE / (1024 * 1024 * 1024))} GB arasında olmalıdır.`,
          });
          continue;
        }

        const sizeValidation = validateUploadSize(size, userTier, userRole);
        if (!sizeValidation.allowed) {
          results.push({ filename, size, error: sizeValidation.error });
          continue;
        }

        if (usedBytes + size > quotaBytes) {
          results.push({ filename, size, error: "Storage quota would be exceeded." });
          continue;
        }

        const fileId = crypto.randomUUID();
        const r2ObjectKey = `users/${user.id}/${fileId}/${filename}`;

        try {
          const uploadUrl = await createPresignedUploadUrl(
            r2ObjectKey,
            mimeType || "application/octet-stream",
            size
          );

          await serviceClient.from("cloud_files").insert({
            id: fileId,
            user_id: user.id,
            filename,
            r2_object_key: r2ObjectKey,
            size,
            mime_type: mimeType || "application/octet-stream",
            checksum: scanResult.sha256,
            is_deleted: false,
            is_encrypted: Boolean(isEncrypted),
            encryption_iv: encryptionIv || null,
          });

          usedBytes += size; // track cumulative usage in this batch

          results.push({
            fileId,
            uploadUrl,
            r2ObjectKey,
            filename,
            size,
          });
        } catch (itemErr: any) {
          results.push({ filename, size, error: itemErr.message || "Failed to generate upload URL" });
        }
      }

      return NextResponse.json({ success: true, results });
    }

    // SINGLE FILE MODE
    const { filename: rawFilename, size, mimeType, isEncrypted, encryptionIv, sha256, headerSample } = body;

    if (!rawFilename || typeof size !== "number" || size < 0) {
      return NextResponse.json({ error: "Filename and valid size are required" }, { status: 400 });
    }

    const filename = sanitizeFilename(rawFilename);

    // Security: Multi-layer malware, webshell & header inspection
    const sampleBuf = headerSample ? Buffer.from(headerSample, "base64") : Buffer.alloc(0);
    const scanResult = await scanFileBuffer({
      buffer: sampleBuf,
      filename,
      mimeType,
      sha256,
    });

    if (scanResult.isMalicious) {
      const client = extractClientInfo(req);
      recordAuditLog({
        action: "MALWARE_BLOCKED",
        resourceType: "file",
        userId: user.id,
        userEmail: user.email,
        fileName: filename,
        fileSize: size,
        ipAddress: client.ipAddress,
        deviceInfo: client.deviceInfo,
        platform: client.platform,
        browser: client.browser,
        details: `Malware detected in presigned upload "${filename}". Threat: ${scanResult.threatName}. Upload rejected.`,
        metadata: {
          threatName: scanResult.threatName,
          threatCategory: scanResult.threatCategory,
          sha256: scanResult.sha256,
          scanEngine: scanResult.scanEngine,
        },
        status: "danger",
      });

      return NextResponse.json(
        {
          error: `Zararlı dosya tespit edildi (${scanResult.threatName}). Güvenliğiniz için bu dosya yüklenemez.`,
          threat: scanResult.threatName,
          details: scanResult.details,
        },
        { status: 422 }
      );
    }

    // Security: Validate file size
    if (!isFileSizeValid(size)) {
      return NextResponse.json(
        { error: `Dosya boyutu 0 ile ${Math.round(MAX_UPLOAD_SIZE / (1024 * 1024 * 1024))} GB arasında olmalıdır.` },
        { status: 400 }
      );
    }

    // Tier check: Validate single file upload size for user's tier
    const sizeValidation = validateUploadSize(size, userTier, userRole);
    if (!sizeValidation.allowed) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 400 });
    }

    // Security: Check user quota
    if (usedBytes + size > quotaBytes) {
      return NextResponse.json(
        { error: "Your storage quota is full. Delete some files or upgrade your plan to upload new files." },
        { status: 413 }
      );
    }

    const fileId = crypto.randomUUID();
    const r2ObjectKey = `users/${user.id}/${fileId}/${filename}`;

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
        checksum: scanResult.sha256,
        is_deleted: false,
        is_encrypted: Boolean(isEncrypted),
        encryption_iv: encryptionIv || null,
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

// DELETE: Cleanup aborted or failed uploads to restore quota and eliminate phantom records
export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let fileId = searchParams.get("fileId");
    if (!fileId) {
      const body = await req.json().catch(() => ({}));
      fileId = body.fileId;
    }

    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    const serviceClient = getServiceClient();

    // Delete pending/aborted file record (triggers DB trigger to restore used_bytes quota)
    const { error: delError } = await serviceClient
      .from("cloud_files")
      .delete()
      .eq("id", fileId)
      .eq("user_id", user.id);

    if (delError) {
      console.error("Failed to cleanup aborted file record:", delError);
      return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true, cleanedUpFileId: fileId });
  } catch (error: any) {
    console.error("Upload cleanup error:", error);
    return NextResponse.json({ error: "Upload cleanup failed" }, { status: 500 });
  }
}
