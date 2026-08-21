import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

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
