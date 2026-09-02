import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from "https://esm.sh/@aws-sdk/client-s3@3.370.0";

/**
 * NearDrop R2 Garbage Collection — Enhanced Cloud Cleanup
 * 
 * 1. Deletes expired files (expires_at < NOW())
 * 2. Cleans orphaned soft-deleted files (is_deleted=true, still on R2)
 * 3. Removes files belonging to deleted users
 * 4. Returns detailed cleanup report with stats
 */
serve(async (req: Request) => {
  const startTime = Date.now();

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const r2AccountId = Deno.env.get("R2_ACCOUNT_ID") ?? "";
    const r2AccessKeyId = Deno.env.get("R2_ACCESS_KEY_ID") ?? "";
    const r2SecretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY") ?? "";
    const r2BucketName = Deno.env.get("R2_BUCKET_NAME") ?? "neardrop-files";

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });

    const report = {
      expiredDeleted: 0,
      orphanDeleted: 0,
      userlessCleaned: 0,
      totalFreedBytes: 0,
      errors: [] as string[],
      durationMs: 0,
    };

    // Helper: delete R2 object and mark DB record
    async function cleanFile(file: { id: string; r2_object_key: string; size?: number; filename?: string }) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: r2BucketName,
            Key: file.r2_object_key,
          })
        );
        await supabaseClient
          .from("cloud_files")
          .update({ is_deleted: true })
          .eq("id", file.id);

        report.totalFreedBytes += file.size || 0;
        return true;
      } catch (delErr: any) {
        report.errors.push(`Failed to delete ${file.r2_object_key}: ${delErr.message}`);
        return false;
      }
    }

    // === 1. Expired files (expires_at < NOW(), not yet deleted) ===
    const { data: expiredFiles } = await supabaseClient
      .from("cloud_files")
      .select("id, r2_object_key, filename, size")
      .lt("expires_at", new Date().toISOString())
      .eq("is_deleted", false)
      .limit(500);

    for (const file of expiredFiles || []) {
      const ok = await cleanFile(file);
      if (ok) report.expiredDeleted++;
    }

    // === 2. Orphaned soft-deleted files (is_deleted=true, but R2 object may exist) ===
    // These are files that were soft-deleted in DB but we want to ensure R2 cleanup
    const { data: orphanFiles } = await supabaseClient
      .from("cloud_files")
      .select("id, r2_object_key, filename, size")
      .eq("is_deleted", true)
      .limit(500);

    for (const file of orphanFiles || []) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: r2BucketName,
            Key: file.r2_object_key,
          })
        );
        report.orphanDeleted++;
        report.totalFreedBytes += file.size || 0;
      } catch {
        // Object may already be deleted from R2, that's fine
      }
    }

    // === 3. Files belonging to deleted users ===
    // Find cloud_files where user_id no longer exists in auth.users
    const { data: userlessFiles } = await supabaseClient
      .rpc("find_userless_cloud_files")
      .limit(200);

    // If the RPC doesn't exist, gracefully skip
    if (userlessFiles && Array.isArray(userlessFiles)) {
      for (const file of userlessFiles) {
        const ok = await cleanFile(file);
        if (ok) report.userlessCleaned++;
      }
    }

    // === 4. Deactivate expired share links ===
    await supabaseClient
      .from("share_links")
      .update({ is_active: false })
      .lt("expires_at", new Date().toISOString())
      .eq("is_active", true);

    // === 5. Deactivate share links that exceeded max downloads ===
    const { data: overLimitLinks } = await supabaseClient
      .from("share_links")
      .select("id, download_count, max_downloads")
      .eq("is_active", true)
      .not("max_downloads", "is", null);

    for (const link of overLimitLinks || []) {
      if (link.max_downloads && link.download_count >= link.max_downloads) {
        await supabaseClient
          .from("share_links")
          .update({ is_active: false })
          .eq("id", link.id);
      }
    }

    report.durationMs = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        message: "Enhanced cleanup completed",
        ...report,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err.message,
        durationMs: Date.now() - startTime,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
