import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard?verified=true";
  const origin = requestUrl.origin;

  let response = NextResponse.redirect(new URL(next, origin));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(new URL("/login?error=supabase_not_configured", origin));
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // Handle token_hash verification
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && data?.user) {
      // Ensure user profile is registered and initialized
      try {
        const user = data.user;
        const meta = user.user_metadata || {};
        const email = user.email || "";
        const displayName = meta.full_name || meta.user_name || meta.display_name || email.split("@")[0] || "User";

        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existing) {
          await supabase.from("profiles").insert({
            id: user.id,
            email,
            display_name: displayName,
            avatar_url: meta.avatar_url || meta.picture || "",
            quota_bytes: 1099511627776, // 1 TB Free
            used_bytes: 0,
            role: "member",
            subscription_tier: "free",
            subscription_status: "active",
          });
        }
      } catch (err) {
        console.error("Profile auto-creation error on confirm:", err);
      }

      return response;
    }
  }

  // Handle PKCE code exchange
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      return response;
    }
  }

  // If verification failed or params missing, redirect to verify-email page with error
  return NextResponse.redirect(new URL("/verify-email?error=invalid_token", origin));
}
