import { NextRequest, NextResponse } from "next/server";
import { fetchTicketById, addTicketReply, updateTicketStatus } from "@/lib/tickets/service";
import { getAuthUser, getSessionProfile, isStaffRole, type SessionProfile } from "@/lib/supabase/auth-helper";
import type { UserRole } from "@/types";

export const dynamic = "force-dynamic";

// Herkese gösterilen örnek "hoş geldin" talebinin sahibi (lib/tickets/service.ts)
const SYSTEM_TICKET_OWNER = "usr_system";

/** Talep yalnızca sahibine ve destek ekibine açıktır. Yanıt: talep + oturum profili, ya da hata yanıtı. */
async function loadOwnTicket(req: NextRequest, ticketId: string, allowSystemTicket = false) {
  const user = await getAuthUser(req);
  if (!user) {
    return { error: NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 }) };
  }

  const { ticket, messages } = await fetchTicketById(ticketId);
  if (!ticket) {
    return { error: NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 }) };
  }

  const profile: SessionProfile = await getSessionProfile(user);
  const isOwner = ticket.userId === profile.id || ticket.userId === user.id;
  const isSystem = allowSystemTicket && ticket.userId === SYSTEM_TICKET_OWNER;
  if (!isOwner && !isSystem && !isStaffRole(profile.role)) {
    // Başkasının talebinin varlığı da açığa çıkmasın
    return { error: NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 }) };
  }

  return { ticket, messages, profile };
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await loadOwnTicket(req, params.id, true);
    if ("error" in result) return result.error;

    return NextResponse.json({ success: true, ticket: result.ticket, messages: result.messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch ticket" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticketId = params.id;
    const result = await loadOwnTicket(req, ticketId);
    if ("error" in result) return result.error;

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ success: false, error: "Missing required message body" }, { status: 400 });
    }

    // Gönderen bilgisi oturumdan gelir; ekip yanıtları /api/admin/tickets/[id] üzerinden yazılır
    const newMsg = await addTicketReply({
      ticketId,
      senderId: result.profile.id,
      senderEmail: result.profile.email || "User",
      senderName: result.profile.displayName,
      senderRole: result.profile.role as UserRole,
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
    const result = await loadOwnTicket(req, ticketId);
    if ("error" in result) return result.error;

    const body = await req.json();
    const { status, priority } = body;

    if (!isStaffRole(result.profile.role)) {
      // Kullanıcı kendi talebini yalnızca kapatabilir; öncelik ve diğer durumlar ekibe aittir
      if (status !== "resolved" && status !== "closed") {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      await updateTicketStatus(ticketId, status);
      return NextResponse.json({ success: true, message: "Ticket updated successfully" });
    }

    await updateTicketStatus(ticketId, status, priority);
    return NextResponse.json({ success: true, message: "Ticket updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to update ticket" }, { status: 500 });
  }
}
