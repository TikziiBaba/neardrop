import { NextRequest, NextResponse } from "next/server";
import { fetchUserFullDetail, updateUserStorageQuota } from "@/lib/admin/service";
import { getServiceClient } from "@/lib/supabase/auth-helper";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing user ID" }, { status: 400 });
    }

    const data = await fetchUserFullDetail(userId);
    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    console.error("Admin user detail GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await req.json();
    const { quotaBytes, displayName, role, status } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing user ID" }, { status: 400 });
    }

    if (quotaBytes !== undefined) {
      await updateUserStorageQuota(userId, Number(quotaBytes));
    }

    if (displayName) {
      const supabase = getServiceClient();
      await supabase.from("profiles").update({ display_name: displayName }).eq("id", userId);
    }

    return NextResponse.json({ success: true, message: "User updated successfully" });
  } catch (error: any) {
    console.error("Admin user detail PATCH error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}
