import { NextRequest, NextResponse } from "next/server";
import { getR2Client, isR2Configured } from "@/lib/r2/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";

// PUT: Save edited text/code content back to R2
export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId, content } = await req.json();
    if (!fileId || content === undefined || content === null) {
      return NextResponse.json({ error: "fileId and content are required" }, { status: 400 });
    }

    if (!isR2Configured()) {
      return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
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

    // Write the updated content to R2
    const s3 = getR2Client();
    const bucketName = process.env.R2_BUCKET_NAME || "neardrop-files";
    const contentBuffer = Buffer.from(content, "utf-8");

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: file.r2_object_key,
      Body: contentBuffer,
      ContentType: file.mime_type || "text/plain",
    });

    await s3.send(command);

    // Update file size in database
    const newSize = contentBuffer.byteLength;
    await serviceClient
      .from("cloud_files")
      .update({ size: newSize })
      .eq("id", fileId)
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      size: newSize,
    });
  } catch (error: any) {
    console.error("File save error:", error);
    return NextResponse.json({ error: "Failed to save file" }, { status: 500 });
  }
}
