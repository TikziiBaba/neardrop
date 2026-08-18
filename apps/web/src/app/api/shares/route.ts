import { NextRequest, NextResponse } from "next/server";
import { generateSecureToken, computeSHA256 } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cloudFileId, expiresInHours, maxDownloads, password } = body;

    if (!cloudFileId) {
      return NextResponse.json({ error: "Missing cloudFileId" }, { status: 400 });
    }

    const token = generateSecureToken(12);
    let passwordHash: string | null = null;

    if (password && password.trim().length > 0) {
      passwordHash = await computeSHA256(password.trim());
    }

    let expiresAt: string | null = null;
    if (expiresInHours && expiresInHours > 0) {
      expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();
    }

    return NextResponse.json({
      token,
      cloudFileId,
      expiresAt,
      maxDownloads: maxDownloads || null,
      passwordProtected: Boolean(passwordHash),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create share link" }, { status: 500 });
  }
}
