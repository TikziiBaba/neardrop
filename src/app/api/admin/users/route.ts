import { NextRequest, NextResponse } from "next/server";
import { fetchAdminUsers, updateUserStorageQuota, logAdminAction } from "@/lib/admin/service";
import { getServiceClient } from "@/lib/supabase/auth-helper";

export async function GET(req: NextRequest) {
  try {
    const users = await fetchAdminUsers();
    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role, subscriptionTier, quotaBytes, status, displayName, notes } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const { updateAdminUser } = await import("@/lib/admin/service");
    const updated = await updateAdminUser(userId, {
      role,
      subscriptionTier,
      quotaBytes,
      status,
      displayName,
      notes,
    });

    return NextResponse.json({ success: true, message: "User updated successfully", user: updated });
  } catch (error: any) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const supabase = getServiceClient();
    // Delete profile (cascades to devices, transfers, shares, cloud_files in supabase schema)
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) throw error;

    logAdminAction({
      action: "DELETE_USER",
      resourceType: "user",
      resourceId: userId,
      details: `User ${userId} deleted by administrator`,
      status: "danger",
    });

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Admin users DELETE error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete user" }, { status: 500 });
  }
}
