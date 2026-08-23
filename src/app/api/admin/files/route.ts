import { NextRequest, NextResponse } from "next/server";
import { fetchAdminFiles, adminDeleteFileRecord } from "@/lib/admin/service";
import { createPresignedDownloadUrl } from "@/lib/r2/s3-client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const files = await fetchAdminFiles(userId);
    return NextResponse.json({ success: true, files });
  } catch (error: any) {
    console.error("Admin files GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch files" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json({ success: false, error: "Missing fileId" }, { status: 400 });
    }

    await adminDeleteFileRecord(fileId);
    return NextResponse.json({ success: true, message: "File deleted successfully from R2 and database" });
  } catch (error: any) {
    console.error("Admin files DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete file" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { r2ObjectKey, filename } = body;

    if (!r2ObjectKey || !filename) {
      return NextResponse.json({ success: false, error: "Missing r2ObjectKey or filename" }, { status: 400 });
    }

    const downloadUrl = await createPresignedDownloadUrl(r2ObjectKey, filename, 3600);
    return NextResponse.json({ success: true, downloadUrl });
  } catch (error: any) {
    console.error("Admin files download link error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to generate download link" }, { status: 500 });
  }
}
