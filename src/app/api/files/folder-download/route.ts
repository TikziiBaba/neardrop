import { NextRequest, NextResponse } from "next/server";
import { createPresignedDownloadUrl, isR2Configured } from "@/lib/r2/s3-client";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";

// POST: Generate presigned download URLs for all files in a folder
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { folderPath } = await req.json();
    if (!folderPath) {
      return NextResponse.json({ error: "folderPath is required" }, { status: 400 });
    }

    if (!isR2Configured()) {
      return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
    }

    const serviceClient = getServiceClient();
    const prefix = `${folderPath}/`;

    // Fetch all files under this folder path
    const { data: files, error } = await serviceClient
      .from("cloud_files")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_deleted", false)
      .or(`filename.eq.${folderPath},filename.like.${prefix}%`);

    if (error) throw error;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files found in folder" }, { status: 404 });
    }

    // Generate presigned URLs for each file
    const items = await Promise.all(
      files.map(async (f: any) => {
        const downloadUrl = await createPresignedDownloadUrl(f.r2_object_key, f.filename, 900);
        // Build relative path within the folder
        const relativePath = f.filename.startsWith(prefix)
          ? f.filename.slice(prefix.length)
          : f.filename.split("/").pop() || f.filename;

        return {
          id: f.id,
          filename: f.filename.split("/").pop() || f.filename,
          fullPath: f.filename,
          relativePath,
          size: f.size,
          mimeType: f.mime_type,
          downloadUrl,
        };
      })
    );

    return NextResponse.json({
      folderName: folderPath.split("/").pop() || folderPath,
      folderPath,
      totalCount: items.length,
      totalSize: items.reduce((acc, i) => acc + (i.size || 0), 0),
      items,
    });
  } catch (error: any) {
    console.error("Folder download error:", error);
    return NextResponse.json({ error: "Folder download failed" }, { status: 500 });
  }
}
