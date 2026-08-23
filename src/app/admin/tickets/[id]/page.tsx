"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Ticket, TicketMessage, TicketStatus, TicketPriority } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  LifeBuoy,
  ShieldCheck,
  User,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminTicketDetailPage() {
  const params = useParams();
  const ticketId = params?.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Status & Priority modifiers
  const [selectedStatus, setSelectedStatus] = useState<TicketStatus>("open");
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority>("medium");
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicketData = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/tickets/${ticketId}`);
      const data = await res.json();
      if (data.success) {
        setTicket(data.ticket);
        setMessages(data.messages || []);
        if (data.ticket) {
          setSelectedStatus(data.ticket.status);
          setSelectedPriority(data.ticket.priority);
        }
      } else {
        toast.error(data.error || "Failed to load ticket");
      }
    } catch (err) {
      console.error("Admin ticket fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicketData();
  }, [fetchTicketData]);

  const handleSendStaffReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: "staff_admin",
          senderEmail: "support@neardrop.bekirr.dev",
          senderName: "NearDrop Staff",
          senderRole: "moderator",
          message: replyText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setReplyText("");
        setSelectedStatus("waiting_customer");
        toast.success("Staff response published");
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } else {
        toast.error(data.error || "Failed to post response");
      }
    } catch (err: any) {
      toast.error(err.message || "Error posting response");
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateStatus = async () => {
    setIsSavingStatus(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          priority: selectedPriority,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Ticket status updated");
        if (ticket) {
          setTicket({ ...ticket, status: selectedStatus, priority: selectedPriority });
        }
      } else {
        toast.error(data.error || "Failed to update ticket");
      }
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setIsSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-400" />
          <p className="text-xs text-zinc-400">Loading support conversation...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!ticket) {
    return (
      <AdminLayout>
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-12 text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Ticket Not Found</h2>
          <Link href="/admin/tickets">
            <Button variant="outline" size="sm" className="text-xs rounded-xl mt-2">
              Back to Ticket Inbox
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/tickets"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Tickets</span>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchTicketData}
            className="text-xs gap-1.5 rounded-xl"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Sync</span>
          </Button>
        </div>

        {/* Ticket Header & Status Manager */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-7 space-y-5 apple-card">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
              <p className="text-xs text-zinc-400 flex items-center gap-2">
                <span>Customer: <strong className="text-zinc-200">{ticket.userName}</strong> ({ticket.userEmail})</span>
                <span>•</span>
                <Link
                  href={`/admin/users/${ticket.userId}`}
                  className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 font-semibold"
                >
                  <span>Inspect Profile</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </p>
            </div>

            {/* Quick Status Control */}
            <div className="flex items-center gap-2 flex-wrap border-t lg:border-t-0 pt-3 lg:pt-0">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="h-9 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_customer">Waiting Customer</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as any)}
                className="h-9 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={handleUpdateStatus}
                disabled={isSavingStatus}
                className="h-9 text-xs bg-purple-600 hover:bg-purple-500 rounded-xl gap-1"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Status</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="space-y-4">
          {messages.map((msg) => {
            const isStaff = msg.isStaff;

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${
                  isStaff
                    ? "bg-purple-950/20 border-purple-500/30"
                    : "bg-zinc-900/60 border-zinc-800"
                } rounded-3xl border p-5 sm:p-6 transition-all apple-card`}
              >
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
                          Staff / Support
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

        {/* Staff Response Form */}
        <form
          onSubmit={handleSendStaffReply}
          className="rounded-3xl border border-purple-500/30 bg-purple-950/15 p-5 space-y-3 apple-card"
        >
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <span>Official Staff Response</span>
            </label>
            <span className="text-[11px] text-zinc-400">
              Posting will notify customer and update ticket status.
            </span>
          </div>

          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={5}
            placeholder="Type your response to the customer..."
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
            required
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              disabled={isSending}
              className="text-xs rounded-xl bg-purple-600 hover:bg-purple-500 gap-2 font-bold px-6"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSending ? "Publishing..." : "Send Staff Response"}</span>
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
