import { NextRequest, NextResponse } from "next/server";
import { fetchAllTickets } from "@/lib/tickets/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const priority = searchParams.get("priority");

    let tickets = await fetchAllTickets();

    if (status && status !== "all") {
      tickets = tickets.filter((t) => t.status === status);
    }
    if (department && department !== "all") {
      tickets = tickets.filter((t) => t.department === department);
    }
    if (priority && priority !== "all") {
      tickets = tickets.filter((t) => t.priority === priority);
    }

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch all tickets" }, { status: 500 });
  }
}
