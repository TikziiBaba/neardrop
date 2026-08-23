"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth/context";
import { Ticket, TicketMessage } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  LifeBuoy,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  User,
  Check,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params?.id as string;
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${ticketId}`);
      const data = await res.json();
      if (data.success) {
        setTicket(data.ticket);
        setMessages(data.messages || []);
      } else {
        toast.error(data.error || "Failed to load ticket");
      }
    } catch (err) {
      console.error("Ticket fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: user.id,
          senderEmail: user.email,
          senderName: user.displayName,
          senderRole: user.role,
          message: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setReplyText("");
        toast.success("Reply posted");
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        toast.error(data.error || "Failed to send reply");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Ticket marked as resolved");
        if (ticket) setTicket({ ...ticket, status: "resolved" });
      }
    } catch (err) {
      toast.error("Failed to close ticket");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-400" />
          <p className="text-xs text-zinc-400">Loading support conversation...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-12 text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Ticket Not Found</h2>
          <Link href="/support">
            <Button variant="outline" size="sm" className="text-xs rounded-xl mt-2">
              Back to Support Hub
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const isClosed = ticket.status === "closed" || ticket.status === "resolved";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Navigation Back & Status Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Tickets</span>
          </Link>

          {!isClosed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseTicket}
              className="text-xs gap-1.5 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Mark as Resolved</span>
            </Button>
          )}
        </div>

        {/* Ticket Header Card */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-7 space-y-4 apple-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/20 capitalize">
                  {ticket.status.replace("_", " ")}
                </span>
                <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 capitalize">
                  {ticket.department}
                </span>
                <span className="text-[11px] text-zinc-400 capitalize">
                  Priority: <strong className="text-white">{ticket.priority}</strong>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {ticket.title}
              </h1>
            </div>

            <span className="text-[11px] text-zinc-500 font-mono">
              Ticket: {ticket.id}
            </span>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === user?.id;
            const isStaff = msg.isStaff;

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isStaff ? "bg-purple-950/20 border-purple-500/30" : "bg-zinc-900/60 border-zinc-800"} rounded-3xl border p-5 sm:p-6 transition-all apple-card`}
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700/60 flex-shrink-0">
                  {isStaff ? (
                    <ShieldCheck className="h-5 w-5 text-purple-400" />
                  ) : (
                    <User className="h-5 w-5 text-sky-400" />
                  )}
                </div>

                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{msg.senderName}</span>
                      {isStaff && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                          NearDrop Staff
                        </span>
                      )}
                      {isMe && !isStaff && (
                        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-500">
                      {formatRelativeTime(msg.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        {!isClosed ? (
          <form
            onSubmit={handleSendReply}
            className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-3 apple-card"
          >
            <label className="text-xs font-semibold text-zinc-300">Add a Response</label>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              placeholder="Type your reply here..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
              required
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={isSending}
                className="text-xs rounded-xl bg-purple-600 hover:bg-purple-500 gap-2 font-bold px-5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSending ? "Posting..." : "Send Reply"}</span>
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-center text-xs text-zinc-400">
            This support ticket has been closed. If you have another issue, please open a new ticket.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
