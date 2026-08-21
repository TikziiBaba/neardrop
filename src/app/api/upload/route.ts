import { NextRequest, NextResponse } from "next/server";
import { createPresignedUploadUrl, getR2Client, isR2Configured } from "@/lib/r2/s3-client";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    // 1. Direct Multipart Form-Data Upload (Proxy to R2)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const fileId = crypto.randomUUID();
      const filename = file.name;
      const size = file.size;
      const mimeType = file.type || "application/octet-stream";
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
      const serviceClient = getServiceClient();
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
        throw new Error(dbError.message);
      }

      return NextResponse.json({
        success: true,
        fileId,
        r2ObjectKey,
      });
    }

    // 2. Presigned Upload URL generation (JSON request)
    const body = await req.json();
    const { filename, size, mimeType } = body;

    if (!filename || !size) {
      return NextResponse.json({ error: "Filename and size are required" }, { status: 400 });
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
    const serviceClient = getServiceClient();
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
      throw new Error(dbError.message);
    }

    return NextResponse.json({
      uploadUrl,
      r2ObjectKey,
      fileId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload request failed" }, { status: 500 });
  }
}
