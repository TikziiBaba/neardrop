import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/auth-helper";
import { uploadR2Buffer, isR2Configured, createPresignedDownloadUrl } from "@/lib/r2/s3-client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file || !userId) {
      return NextResponse.json({ success: false, error: "Missing avatar file or user ID" }, { status: 400 });
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: "Invalid image format. Allowed: PNG, JPG, WEBP, GIF" }, { status: 400 });
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: "Avatar size exceeds 5 MB limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let avatarUrl = "";
    const ext = file.name.split(".").pop() || "png";
    const r2Key = `avatars/${userId}_${Date.now()}.${ext}`;

    if (isR2Configured()) {
      try {
        await uploadR2Buffer(r2Key, buffer, file.type);
        // If R2 public domain configured or generate long-life URL
        const publicUrl = process.env.R2_PUBLIC_URL;
        if (publicUrl) {
          avatarUrl = `${publicUrl.replace(/\/$/, "")}/${r2Key}`;
        } else {
          // Generate 7-day presigned URL
          avatarUrl = await createPresignedDownloadUrl(r2Key, `avatar.${ext}`, 604800);
        }
      } catch (r2Err) {
        console.warn("R2 avatar upload failed, falling back to data URI:", r2Err);
        avatarUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
      }
    } else {
      // Fallback base64 data URI if R2 not configured
      avatarUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    // Update in Supabase
    const supabase = getServiceClient();
    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (dbError) {
      console.error("Failed to update profile avatar in DB:", dbError);
    }

    return NextResponse.json({
      success: true,
      avatarUrl,
    });
  } catch (error: any) {
    console.error("Avatar upload API error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to upload avatar" }, { status: 500 });
  }
}
