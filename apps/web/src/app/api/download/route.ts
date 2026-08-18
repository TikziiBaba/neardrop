import { NextRequest, NextResponse } from "next/server";
import { createPresignedDownloadUrl, isR2Configured } from "@/lib/r2/s3-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, fileId, filename, password } = body;

    if (!token && !fileId) {
      return NextResponse.json({ error: "Token or fileId is required" }, { status: 400 });
    }

    // In a live Supabase deployment, this queries `share_links` and `cloud_files`.
    // When R2 is configured:
    let downloadUrl = "";
    if (isR2Configured() && body.r2ObjectKey && filename) {
      downloadUrl = await createPresignedDownloadUrl(body.r2ObjectKey, filename, 900);
    } else {
      downloadUrl = `/api/download/file?token=${encodeURIComponent(token || "")}`;
    }

    return NextResponse.json({
      downloadUrl,
      filename: filename || "downloaded-file",
      size: body.size || 1024,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Download request failed" }, { status: 500 });
  }
}
