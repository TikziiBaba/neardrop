import { NextRequest, NextResponse } from "next/server";
import { createPresignedDownloadUrl, isR2Configured } from "@/lib/r2/s3-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, serviceKey);
}

// POST: Generate presigned download URL for authenticated file owner
export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
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
      .eq("user_id", session.user.id)
      .single();

    if (fetchErr || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!isR2Configured()) {
      return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
    }

    const downloadUrl = await createPresignedDownloadUrl(file.r2_object_key, file.filename, 900);

    return NextResponse.json({
      downloadUrl,
      filename: file.filename,
      size: file.size,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Download request failed" }, { status: 500 });
  }
}
