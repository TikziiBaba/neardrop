"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Oturum token'ı eklenmiş fetch. Sunucu kullanıcıyı bu token'dan (getAuthUser) belirler;
 * /api/admin/* için requireStaff ayrıca admin/moderatör rolünü doğrular.
 */
export async function sessionFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const supabase = createClient();
  if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) headers.set("Authorization", `Bearer ${session.access_token}`);
  }
  return fetch(input, { ...init, headers });
}
