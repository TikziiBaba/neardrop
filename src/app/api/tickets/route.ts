import { NextRequest, NextResponse } from "next/server";
import { fetchUserTickets, createTicket } from "@/lib/tickets/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing user ID parameter" }, { status: 400 });
    }

    const tickets = await fetchUserTickets(userId);
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, userName, userRole, title, department, priority, message } = body;

    if (!userId || !title || !message) {
      return NextResponse.json({ success: false, error: "Missing required ticket fields" }, { status: 400 });
    }

    const ticket = await createTicket({
      userId,
      userEmail: userEmail || "User",
      userName: userName || "User",
      userRole: userRole || "member",
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
