import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/auth-helper";
import { logAdminAction } from "@/lib/admin/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const supabase = getServiceClient();

    if (action === "purge_expired_shares") {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("share_links")
        .update({ is_active: false })
        .lt("expires_at", now)
        .eq("is_active", true);

      if (error) throw error;

      logAdminAction({
        action: "PURGE_EXPIRED_SHARES",
        resourceType: "share",
        details: "Deactivated all expired share links",
        status: "success",
      });

      return NextResponse.json({ success: true, message: "Expired share links purged successfully" });
    }

    if (action === "recalculate_quotas") {
      const { data: profiles } = await supabase.from("profiles").select("id");
      if (profiles) {
        for (const p of profiles) {
          const { data: files } = await supabase
            .from("cloud_files")
            .select("size")
            .eq("user_id", p.id)
            .eq("is_deleted", false);

          const actualUsed = files?.reduce((acc, f) => acc + Number(f.size || 0), 0) || 0;
          await supabase.from("profiles").update({ used_bytes: actualUsed }).eq("id", p.id);
        }
      }

      logAdminAction({
        action: "RECALCULATE_QUOTAS",
        resourceType: "system",
        details: `Recalculated storage quotas for ${profiles?.length || 0} user accounts`,
        status: "success",
      });

      return NextResponse.json({ success: true, message: "Storage quotas recalculated successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin maintenance error:", error);
    return NextResponse.json({ success: false, error: error.message || "Maintenance task failed" }, { status: 500 });
  }
}
