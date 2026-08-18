import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { cloudFileId, expiresInHours, maxDownloads, password } = await req.json();

    if (!cloudFileId) {
      return new Response(JSON.stringify({ error: "Missing cloudFileId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify file ownership
    const { data: file, error: fileError } = await supabaseClient
      .from("cloud_files")
      .select("id, filename")
      .eq("id", cloudFileId)
      .eq("user_id", user.id)
      .eq("is_deleted", false)
      .single();

    if (fileError || !file) {
      return new Response(JSON.stringify({ error: "File not found or access denied" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate random nanoid-like token (12 chars url safe)
    const randomBytes = new Uint8Array(9);
    crypto.getRandomValues(randomBytes);
    const token = Array.from(randomBytes, (b) => b.toString(36).padStart(2, "0")).join("").substring(0, 12);

    let passwordHash: string | null = null;
    if (password && password.trim().length > 0) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password.trim());
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    let expiresAt: string | null = null;
    if (expiresInHours && expiresInHours > 0) {
      expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();
    }

    const { data: shareLink, error: insertError } = await supabaseClient
      .from("share_links")
      .insert({
        user_id: user.id,
        cloud_file_id: cloudFileId,
        token,
        password_hash: passwordHash,
        expires_at: expiresAt,
        max_downloads: maxDownloads && maxDownloads > 0 ? maxDownloads : null,
        is_active: true,
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
        shareLink,
        token,
        hasPassword: !!passwordHash,
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
