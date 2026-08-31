import { NextRequest, NextResponse } from "next/server";
import { createPresignedPreviewUrl, isR2Configured, getR2Client } from "@/lib/r2/s3-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getAuthUser, getServiceClient } from "@/lib/supabase/auth-helper";

// Text/code file extensions that should be fetched as text content
const TEXT_EXTENSIONS = new Set([
  "txt", "md", "markdown", "json", "xml", "csv", "tsv", "log",
  "js", "jsx", "ts", "tsx", "mjs", "cjs",
  "py", "pyw", "rb", "go", "rs", "c", "cpp", "h", "hpp", "cs",
  "java", "kt", "swift", "scala", "clj",
  "html", "htm", "css", "scss", "sass", "less",
  "yaml", "yml", "toml", "ini", "cfg", "conf", "env",
  "sh", "bash", "zsh", "fish", "ps1", "bat", "cmd",
  "sql", "graphql", "gql",
  "dockerfile", "makefile", "gitignore", "editorconfig",
  "r", "lua", "dart", "php", "pl", "pm",
  "vue", "svelte", "astro",
]);

const MAX_TEXT_SIZE = 512 * 1024; // 512 KB max for text preview

// POST: Generate presigned preview URL (inline) for authenticated file owner
export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
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
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!isR2Configured()) {
      return NextResponse.json({ error: "R2 storage is not configured" }, { status: 500 });
    }

    const ext = (file.filename || "").split(".").pop()?.toLowerCase() || "";
    const mimeType = file.mime_type || "application/octet-stream";
    const isTextFile = TEXT_EXTENSIONS.has(ext) || mimeType.startsWith("text/");

    // For text/code files, fetch the raw content directly
    let textContent: string | null = null;
    if (isTextFile && file.size <= MAX_TEXT_SIZE) {
      try {
        const s3 = getR2Client();
        const bucketName = process.env.R2_BUCKET_NAME || "neardrop-files";
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: file.r2_object_key,
        });
        const response = await s3.send(command);
        if (response.Body) {
          const chunks: Uint8Array[] = [];
          const reader = response.Body.transformToWebStream().getReader();
          let done = false;
          while (!done) {
            const { value, done: d } = await reader.read();
            if (value) chunks.push(value);
            done = d;
          }
          const combined = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
          let offset = 0;
          for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
          }
          textContent = new TextDecoder("utf-8").decode(combined);
        }
      } catch (textErr) {
        console.error("Failed to fetch text content:", textErr);
      }
    }

    const previewUrl = await createPresignedPreviewUrl(
      file.r2_object_key,
      file.filename,
      mimeType,
      900
    );

    return NextResponse.json({
      previewUrl,
      filename: file.filename,
      size: file.size,
      mimeType,
      textContent,
      isTextFile,
    });
  } catch (error: any) {
    console.error("File preview error:", error);
    return NextResponse.json({ error: "Preview request failed" }, { status: 500 });
  }
}
