import { NextRequest, NextResponse } from "next/server";
import { createPresignedUploadUrl, isR2Configured } from "@/lib/r2/s3-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, size, mimeType, expiresInHours } = body;

    if (!filename || !size) {
      return NextResponse.json({ error: "Filename and size are required" }, { status: 400 });
    }

    const fileId = crypto.randomUUID();
    const userId = "usr_demo_88294"; // Or from Supabase auth
    const r2ObjectKey = `users/${userId}/${fileId}/${filename}`;

    let uploadUrl = "";
    if (isR2Configured()) {
      uploadUrl = await createPresignedUploadUrl(r2ObjectKey, mimeType, size);
    } else {
      // Direct mock upload URL for standalone preview
      uploadUrl = `/api/upload/mock?key=${encodeURIComponent(r2ObjectKey)}`;
    }

    let expiresAt: string | null = null;
    if (expiresInHours && expiresInHours > 0) {
      expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();
    }

    return NextResponse.json({
      uploadUrl,
      r2ObjectKey,
      fileId,
      expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate upload URL" }, { status: 500 });
  }
}
