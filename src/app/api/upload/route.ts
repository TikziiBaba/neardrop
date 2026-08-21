import { NextRequest, NextResponse } from "next/server";
import { createPresignedUploadUrl, isR2Configured } from "@/lib/r2/s3-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, serviceKey);
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { filename, size, mimeType } = body;

    if (!filename || !size) {
      return NextResponse.json({ error: "Filename and size are required" }, { status: 400 });
    }

    const fileId = crypto.randomUUID();
    const r2ObjectKey = `users/${userId}/${fileId}/${filename}`;

    // Generate presigned upload URL
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
        user_id: userId,
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
    return NextResponse.json({ error: error.message || "Failed to generate upload URL" }, { status: 500 });
  }
}
