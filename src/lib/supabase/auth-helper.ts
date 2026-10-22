import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient, type User } from "@supabase/supabase-js";

export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, serviceKey);
}

export async function getAuthUser(req: NextRequest) {
  // 1. Try Bearer token from Authorization header
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const serviceClient = getServiceClient();
      const { data: { user }, error } = await serviceClient.auth.getUser(token);
      if (user && !error) {
        return user;
      }
    }
  }

  // 2. Fallback to SSR cookie-based session
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return user;
    }
  } catch (e) {
    // Cookie parsing error handled
  }

  return null;
}

export interface SessionProfile {
  /** Profil kimliği: Google/GitHub ile bağlanmış hesaplarda auth kullanıcısından farklı olabilir */
  id: string;
  email: string;
  displayName: string;
  role: string;
}

/**
 * Oturumdaki kullanıcının profili. auth/context.tsx ile aynı eşleme: önce kimlikle, yoksa aynı e-postalı en eski profil.
 * ADMIN_EMAILS listesindeki e-postalar admin sayılır (lib/admin/service.ts ile aynı).
 */
export async function getSessionProfile(user: User): Promise<SessionProfile> {
  const email = (user.email || "").toLowerCase();
  const serviceClient = getServiceClient();
  let { data: profile } = await serviceClient
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile && email) {
    ({ data: profile } = await serviceClient
      .from("profiles")
      .select("id, email, display_name, role")
      .eq("email", email)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle());
  }

  const envAdmins = (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .toLowerCase()
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  return {
    id: profile?.id || user.id,
    email: profile?.email || user.email || "",
    displayName: profile?.display_name || user.user_metadata?.display_name || email.split("@")[0] || "User",
    role: email && envAdmins.includes(email) ? "admin" : profile?.role || "member",
  };
}

export const isStaffRole = (role: string) => role === "admin" || role === "moderator";

/**
 * /api/admin/* uçları için yetki kontrolü: oturum yoksa 401, admin/moderatör değilse 403 yanıtı döner.
 * Kullanım: `const denied = await requireStaff(req); if (denied) return denied;`
 */
export async function requireStaff(req: NextRequest): Promise<NextResponse | null> {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  const profile = await getSessionProfile(user);
  if (isStaffRole(profile.role)) return null;
  return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
}
