import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.370.0";
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
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { filename, size, mimeType, checksum, expiresInHours } = await req.json();

    if (!filename || !size) {
      return new Response(JSON.stringify({ error: "Missing filename or size" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check user quota in database
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("quota_bytes, used_bytes")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Could not fetch user profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (profile.used_bytes + size > profile.quota_bytes) {
      return new Response(
        JSON.stringify({ error: "Cloud storage quota exceeded. Please free up space." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

    const fileId = crypto.randomUUID();
    const r2ObjectKey = `users/${user.id}/${fileId}/${filename}`;

    const putCommand = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: r2ObjectKey,
      ContentType: mimeType || "application/octet-stream",
      ContentLength: size,
    });

    // Generate presigned upload URL valid for 30 minutes
    const uploadUrl = await getSignedUrl(s3, putCommand, { expiresIn: 1800 });

    let expiresAt: string | null = null;
    if (expiresInHours && expiresInHours > 0) {
      expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();
    }

    // Insert metadata record in Supabase
    const { data: cloudFile, error: insertError } = await supabaseClient
      .from("cloud_files")
      .insert({
        id: fileId,
        user_id: user.id,
        filename,
        r2_object_key: r2ObjectKey,
        size,
        mime_type: mimeType || "application/octet-stream",
        checksum: checksum || null,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        uploadUrl,
        cloudFile,
        r2ObjectKey,
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
