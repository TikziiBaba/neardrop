import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { S3Client, DeleteObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.370.0";

serve(async (req: Request) => {
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

    // Find expired files
    const { data: expiredFiles, error: queryError } = await supabaseClient
      .from("cloud_files")
      .select("id, r2_object_key, filename")
      .lt("expires_at", new Date().toISOString())
      .eq("is_deleted", false);

    if (queryError) {
      return new Response(JSON.stringify({ error: queryError.message }), { status: 500 });
    }

    let deletedCount = 0;
    for (const file of expiredFiles || []) {
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

        deletedCount++;
      } catch (delErr) {
        console.error(`Failed to delete ${file.r2_object_key}:`, delErr);
      }
    }

    return new Response(
      JSON.stringify({ message: "Cleanup completed", deletedCount }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
