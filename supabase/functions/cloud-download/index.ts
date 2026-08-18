import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { S3Client, GetObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.370.0";
import { getSignedUrl } from "https://esm.sh/@aws-sdk/s3-request-presigner@3.370.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { fileId, token, password } = await req.json();

    let r2ObjectKey = "";
    let filename = "";
    let size = 0;

    if (token) {
      // 1. Download via Public Share Link
      const { data: link, error: linkError } = await supabaseClient
        .from("share_links")
        .select("*, cloud_files(*)")
        .eq("token", token)
        .eq("is_active", true)
        .single();

      if (linkError || !link || !link.cloud_files) {
        return new Response(JSON.stringify({ error: "Share link not found or inactive" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (link.expires_at && new Date(link.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Share link has expired" }), {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (link.max_downloads !== null && link.download_count >= link.max_downloads) {
        return new Response(JSON.stringify({ error: "Maximum download limit reached" }), {
          status: 410,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (link.password_hash) {
        // Simple hash comparison (SHA-256)
        const encoder = new TextEncoder();
        const data = encoder.encode(password || "");
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const computedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

        if (computedHash !== link.password_hash) {
          return new Response(JSON.stringify({ error: "Invalid password for share link" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      r2ObjectKey = link.cloud_files.r2_object_key;
      filename = link.cloud_files.filename;
      size = link.cloud_files.size;

      // Increment download counter
      await supabaseClient
        .from("share_links")
        .update({ download_count: link.download_count + 1 })
        .eq("id", link.id);
    } else if (fileId) {
      // 2. Direct authenticated download by file owner
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const clientWithAuth = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: authError } = await clientWithAuth.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: file, error: fileError } = await clientWithAuth
        .from("cloud_files")
        .select("*")
        .eq("id", fileId)
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .single();

      if (fileError || !file) {
        return new Response(JSON.stringify({ error: "File not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      r2ObjectKey = file.r2_object_key;
      filename = file.filename;
      size = file.size;
    } else {
      return new Response(JSON.stringify({ error: "Either fileId or token must be provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Configure Cloudflare R2 S3 Client
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

    const getCommand = new GetObjectCommand({
      Bucket: r2BucketName,
      Key: r2ObjectKey,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(filename)}"`,
    });

    // Generate presigned download URL valid for 15 minutes
    const downloadUrl = await getSignedUrl(s3, getCommand, { expiresIn: 900 });

    return new Response(
      JSON.stringify({
        downloadUrl,
        filename,
        size,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
