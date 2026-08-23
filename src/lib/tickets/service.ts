import { Ticket, TicketMessage, TicketStatus, TicketPriority, TicketDepartment, UserRole } from "@/types";
import { getServiceClient } from "@/lib/supabase/auth-helper";
import { logAdminAction } from "@/lib/admin/service";

// In-memory fallback cache for tickets when Supabase table isn't created yet
let inMemoryTickets: Ticket[] = [
  {
    id: "tkt_welcome",
    userId: "usr_system",
    userEmail: "bekir@neardrop.bekirr.dev",
    userName: "Bekir",
    userRole: "admin",
    title: "Welcome to NearDrop Support & Helpdesk",
    department: "general",
    priority: "low",
    status: "open",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    lastReplyAt: new Date(Date.now() - 3600000).toISOString(),
    messagesCount: 2,
  },
];

let inMemoryMessages: TicketMessage[] = [
  {
    id: "msg_welcome_1",
    ticketId: "tkt_welcome",
    senderId: "usr_system",
    senderEmail: "bekir@neardrop.bekirr.dev",
    senderName: "Bekir",
    senderRole: "admin",
    message: "Hello! This is a test support ticket. You can ask any question regarding storage, LAN transfers, or subscription upgrades.",
    isStaff: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "msg_welcome_2",
    ticketId: "tkt_welcome",
    senderId: "staff_1",
    senderEmail: "support@neardrop.bekirr.dev",
    senderName: "NearDrop Staff",
    senderRole: "moderator",
    message: "Thank you for reaching out! Our support team is online 24/7. How may we assist your workflow today?",
    isStaff: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export async function createTicket(data: {
  userId: string;
  userEmail: string;
  userName: string;
  userRole?: UserRole;
  title: string;
  department: TicketDepartment;
  priority: TicketPriority;
  message: string;
}): Promise<Ticket> {
  const ticketId = `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newTicket: Ticket = {
    id: ticketId,
    userId: data.userId,
    userEmail: data.userEmail,
    userName: data.userName,
    userRole: data.userRole || "member",
    title: data.title,
    department: data.department,
    priority: data.priority,
    status: "open",
    createdAt: now,
    updatedAt: now,
    lastReplyAt: now,
    messagesCount: 1,
  };

  const initialMessage: TicketMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ticketId,
    senderId: data.userId,
    senderEmail: data.userEmail,
    senderName: data.userName,
    senderRole: data.userRole || "member",
    message: data.message,
    isStaff: false,
    createdAt: now,
  };

  // Try saving in Supabase if table exists
  try {
    const supabase = getServiceClient();
    await supabase.from("tickets").insert({
      id: newTicket.id,
      user_id: newTicket.userId,
      user_email: newTicket.userEmail,
      user_name: newTicket.userName,
      title: newTicket.title,
      department: newTicket.department,
      priority: newTicket.priority,
      status: newTicket.status,
      created_at: newTicket.createdAt,
      updated_at: newTicket.updatedAt,
    });
    await supabase.from("ticket_messages").insert({
      id: initialMessage.id,
      ticket_id: initialMessage.ticketId,
      sender_id: initialMessage.senderId,
      sender_email: initialMessage.senderEmail,
      sender_name: initialMessage.senderName,
      message: initialMessage.message,
      is_staff: false,
      created_at: initialMessage.createdAt,
    });
  } catch (err) {
    // Save in in-memory list
  }

  inMemoryTickets.unshift(newTicket);
  inMemoryMessages.push(initialMessage);

  logAdminAction({
    action: "NEW_TICKET",
    resourceType: "ticket",
    userId: data.userId,
    userEmail: data.userEmail,
    resourceId: ticketId,
    details: `Created support ticket: "${data.title}" [${data.priority.toUpperCase()}]`,
    status: "warning",
  });

  return newTicket;
}

export async function fetchUserTickets(userId: string): Promise<Ticket[]> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (data && data.length > 0) {
      return data.map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        userEmail: t.user_email,
        userName: t.user_name || "User",
        title: t.title,
        department: t.department || "general",
        priority: t.priority || "medium",
        status: t.status || "open",
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));
    }
  } catch (err) {
    // fallback
  }

  return inMemoryTickets.filter((t) => t.userId === userId || t.userId === "usr_system");
}

export async function fetchAllTickets(): Promise<Ticket[]> {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .order("updated_at", { ascending: false });

    if (data && data.length > 0) {
      return data.map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        userEmail: t.user_email,
        userName: t.user_name || "User",
        title: t.title,
        department: t.department || "general",
        priority: t.priority || "medium",
        status: t.status || "open",
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));
    }
  } catch (err) {
    // fallback
  }

  return inMemoryTickets;
}

export async function fetchTicketById(ticketId: string): Promise<{ ticket: Ticket | null; messages: TicketMessage[] }> {
  let ticket: Ticket | null = null;
  let messages: TicketMessage[] = [];

  try {
    const supabase = getServiceClient();
    const { data: tData } = await supabase.from("tickets").select("*").eq("id", ticketId).single();
    if (tData) {
      ticket = {
        id: tData.id,
        userId: tData.user_id,
        userEmail: tData.user_email,
        userName: tData.user_name,
        title: tData.title,
        department: tData.department,
        priority: tData.priority,
        status: tData.status,
        createdAt: tData.created_at,
        updatedAt: tData.updated_at,
      };

      const { data: mData } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });

      if (mData) {
        messages = mData.map((m: any) => ({
          id: m.id,
          ticketId: m.ticket_id,
          senderId: m.sender_id,
          senderEmail: m.sender_email,
          senderName: m.sender_name,
          senderRole: m.sender_role || (m.is_staff ? "moderator" : "member"),
          message: m.message,
          isStaff: m.is_staff,
          createdAt: m.created_at,
        }));
      }
    }
  } catch (err) {
    // fallback
  }

  if (!ticket) {
    ticket = inMemoryTickets.find((t) => t.id === ticketId) || null;
    messages = inMemoryMessages.filter((m) => m.ticketId === ticketId);
  }

  return { ticket, messages };
}

export async function addTicketReply(data: {
  ticketId: string;
  senderId: string;
  senderEmail: string;
  senderName: string;
  senderRole?: UserRole;
  message: string;
  isStaff: boolean;
}): Promise<TicketMessage> {
  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newMsg: TicketMessage = {
    id: messageId,
    ticketId: data.ticketId,
    senderId: data.senderId,
    senderEmail: data.senderEmail,
    senderName: data.senderName,
    senderRole: data.senderRole || (data.isStaff ? "moderator" : "member"),
    message: data.message,
    isStaff: data.isStaff,
    createdAt: now,
  };

  try {
    const supabase = getServiceClient();
    await supabase.from("ticket_messages").insert({
      id: newMsg.id,
      ticket_id: newMsg.ticketId,
      sender_id: newMsg.senderId,
      sender_email: newMsg.senderEmail,
      sender_name: newMsg.senderName,
      message: newMsg.message,
      is_staff: newMsg.isStaff,
      created_at: newMsg.createdAt,
    });

    // Update ticket status
    const nextStatus: TicketStatus = data.isStaff ? "waiting_customer" : "in_progress";
    await supabase
      .from("tickets")
      .update({ status: nextStatus, updated_at: now })
      .eq("id", data.ticketId);
  } catch (err) {
    // in-memory fallback
  }

  inMemoryMessages.push(newMsg);

  // Update in-memory ticket
  const tIndex = inMemoryTickets.findIndex((t) => t.id === data.ticketId);
  if (tIndex !== -1) {
    inMemoryTickets[tIndex].updatedAt = now;
    inMemoryTickets[tIndex].lastReplyAt = now;
    inMemoryTickets[tIndex].status = data.isStaff ? "waiting_customer" : "in_progress";
    inMemoryTickets[tIndex].messagesCount = (inMemoryTickets[tIndex].messagesCount || 1) + 1;
  }

  return newMsg;
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus, priority?: TicketPriority) {
  const now = new Date().toISOString();

  try {
    const supabase = getServiceClient();
    const updates: any = { status, updated_at: now };
    if (priority) updates.priority = priority;
    await supabase.from("tickets").update(updates).eq("id", ticketId);
  } catch (err) {
    // fallback
  }

  const tIndex = inMemoryTickets.findIndex((t) => t.id === ticketId);
  if (tIndex !== -1) {
    inMemoryTickets[tIndex].status = status;
    if (priority) inMemoryTickets[tIndex].priority = priority;
    inMemoryTickets[tIndex].updatedAt = now;
  }

  return true;
}
