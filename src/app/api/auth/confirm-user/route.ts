import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/auth-helper";

export const dynamic = "force-dynamic";

/**
 * Server-side helper to confirm a user's email directly via Service Role Key
 * Solves Supabase free tier email rate-limits (3/hr) and deliverability issues.
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Geçerli bir e-posta adresi belirtilmedi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = getServiceClient();

    // Find the user in auth.users
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error("Failed to list users:", listError);
      return NextResponse.json(
        { success: false, error: "Kullanıcı veritabanına erişilemedi." },
        { status: 500 }
      );
    }

    const targetUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Bu e-posta adresine ait kayıt bulunamadı." },
        { status: 404 }
      );
    }

    // Confirm email in Supabase Auth
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error("Failed to confirm user email:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message || "E-posta doğrulanamadı." },
        { status: 500 }
      );
    }

    // Ensure profile row exists in public.profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", targetUser.id)
      .maybeSingle();

    if (!profile) {
      const meta = targetUser.user_metadata || {};
      const displayName =
        meta.display_name ||
        meta.full_name ||
        cleanEmail.split("@")[0] ||
        "User";

      await supabase.from("profiles").insert({
        id: targetUser.id,
        email: cleanEmail,
        display_name: displayName,
        avatar_url: meta.avatar_url || "",
        quota_bytes: 2147483648, // 2 GB
        used_bytes: 0,
        role: cleanEmail.includes("admin") ? "admin" : "member",
        subscription_tier: "free",
        subscription_status: "active",
      });
    }

    return NextResponse.json({
      success: true,
      message: "E-posta adresi başarıyla onaylandı.",
      userId: targetUser.id,
    });
  } catch (err: any) {
    console.error("Confirm user endpoint error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Sunucu hatası oluştu." },
      { status: 500 }
    );
  }
}
