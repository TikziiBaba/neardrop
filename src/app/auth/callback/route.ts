import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const origin = requestUrl.origin;

  if (code) {
    let response = NextResponse.redirect(new URL(next, origin));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      // Ensure profile exists in profiles table
      try {
        const user = data.user;
        const meta = user.user_metadata || {};
        const email = user.email || "";
        const displayName = meta.full_name || meta.user_name || meta.name || email.split("@")[0] || "User";
        const avatarUrl = meta.avatar_url || meta.picture || "";

        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingProfile) {
          await supabase.from("profiles").insert({
            id: user.id,
            email,
            display_name: displayName,
            avatar_url: avatarUrl,
            quota_bytes: 10737418240, // 10 GB Free starter
            used_bytes: 0,
            role: "member",
            subscription_tier: "free",
            subscription_status: "active",
          });
        }
      } catch (profileErr) {
        console.error("Error creating OAuth user profile:", profileErr);
      }

      return response;
    }
  }

  // Redirect to dashboard or login on fallback
  return NextResponse.redirect(new URL("/dashboard", origin));
}
