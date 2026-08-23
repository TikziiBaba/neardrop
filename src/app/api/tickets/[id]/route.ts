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

    if (!senderId || !message) {
      return NextResponse.json({ success: false, error: "Missing required message body" }, { status: 400 });
    }

    const newMsg = await addTicketReply({
      ticketId,
      senderId,
      senderEmail: senderEmail || "User",
      senderName: senderName || "User",
      senderRole: senderRole || "member",
      message,
      isStaff: false,
    });

    return NextResponse.json({ success: true, message: newMsg });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to add reply" }, { status: 500 });
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
