import { NextRequest, NextResponse } from "next/server";
import { fetchTicketById, addTicketReply, updateTicketStatus } from "@/lib/tickets/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const { ticket, messages } = await fetchTicketById(ticketId);

    if (!ticket) {
      return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch ticket" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const body = await req.json();
    const { senderId, senderEmail, senderName, senderRole, message } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: "Reply message cannot be empty" }, { status: 400 });
    }

    const newMsg = await addTicketReply({
      ticketId,
      senderId: senderId || "staff_admin",
      senderEmail: senderEmail || "support@neardrop.bekirr.dev",
      senderName: senderName || "NearDrop Support Staff",
      senderRole: senderRole || "moderator",
      message,
      isStaff: true,
    });

    return NextResponse.json({ success: true, message: newMsg });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to post staff reply" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const body = await req.json();
    const { status, priority } = body;

    await updateTicketStatus(ticketId, status, priority);
    return NextResponse.json({ success: true, message: "Ticket updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update ticket" }, { status: 500 });
  }
}
