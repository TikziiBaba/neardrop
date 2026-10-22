import { NextRequest, NextResponse } from "next/server";
import { fetchUserTickets, createTicket } from "@/lib/tickets/service";
import { getAuthUser, getSessionProfile } from "@/lib/supabase/auth-helper";
import type { UserRole } from "@/types";

export const dynamic = "force-dynamic";

// Kullanıcı kimliği ve rolü her zaman oturumdan alınır; istekteki userId/userRole yok sayılır.
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getSessionProfile(user);
    const tickets = await fetchUserTickets(profile.id);
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, department, priority, message } = body;

    if (!title || !message) {
      return NextResponse.json({ success: false, error: "Missing required ticket fields" }, { status: 400 });
    }

    const profile = await getSessionProfile(user);
    const ticket = await createTicket({
      userId: profile.id,
      userEmail: profile.email || "User",
      userName: profile.displayName,
      userRole: profile.role as UserRole,
      title,
      department: department || "general",
      priority: priority || "medium",
      message,
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to create ticket" }, { status: 500 });
  }
}
