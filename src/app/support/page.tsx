"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth/context";
import { Ticket } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Zap,
  HardDrive,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SupportPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTickets = React.useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets?userId=${user.id}`);
      const data = await res.json();
      if (data.success && data.tickets) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <span className="rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/20">
            Open
          </span>
        );
      case "in_progress":
        return (
          <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
            In Progress
          </span>
        );
      case "waiting_customer":
        return (
          <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-400 border border-purple-500/20">
            Staff Replied
          </span>
        );
      case "resolved":
        return (
          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
            Resolved
          </span>
        );
      case "closed":
        return (
          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <span className="text-rose-400 font-bold">Urgent</span>;
      case "high":
        return <span className="text-amber-400 font-semibold">High</span>;
      case "medium":
        return <span className="text-sky-400">Medium</span>;
      default:
        return <span className="text-zinc-500">Low</span>;
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Support & Helpdesk</span>
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-400 border border-purple-500/20">
                24/7 Assistance
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Have questions about your quota, encrypted share links, or LAN transfers? Our engineers are here to help.
            </p>
          </div>

          <Link href="/support/new">
            <Button
              variant="primary"
              size="sm"
              className="gap-2 text-xs rounded-xl bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/20"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Ticket</span>
            </Button>
          </Link>
        </div>

        {/* Quick Contact & Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2 apple-card">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Zap className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Priority Resolution</h4>
            <p className="text-[11px] text-zinc-400">
              Pro & Enterprise subscribers enjoy response times under 4 hours.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2 apple-card">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <HardDrive className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Storage Quota Requests</h4>
            <p className="text-[11px] text-zinc-400">
              Need custom enterprise capacity over 2 TB? Contact our billing desk.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-2 apple-card">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Security & Audits</h4>
            <p className="text-[11px] text-zinc-400">
              Report vulnerabilities or request device access audit logs.
            </p>
          </div>
        </div>

        {/* Tickets List Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <Input
                placeholder="Search your tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs bg-zinc-900/60 border-zinc-800 rounded-xl"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchTickets}
              disabled={loading}
              className="gap-2 text-xs rounded-xl"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin text-purple-400" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Tickets Table / Cards */}
          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl apple-card">
            {loading ? (
              <div className="py-16 text-center text-zinc-500 space-y-2">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-400" />
                <p className="text-xs">Loading support tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <LifeBuoy className="h-10 w-10 text-zinc-600 mx-auto" />
                <div>
                  <h3 className="text-sm font-bold text-white">No Support Tickets Found</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    You have no active support requests. Need help? Open a new ticket anytime.
                  </p>
                </div>
                <Link href="/support/new">
                  <Button variant="primary" size="sm" className="text-xs rounded-xl mt-2">
                    Open Your First Ticket
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/60">
                {filteredTickets.map((t) => (
                  <Link
                    key={t.id}
                    href={`/support/${t.id}`}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-zinc-800/40 transition-colors gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(t.status)}
                        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400 capitalize">
                          {t.department}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Priority: {getPriorityBadge(t.priority)}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {t.title}
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Ticket ID: <span className="font-mono text-zinc-400">{t.id}</span> • Updated {formatRelativeTime(t.updatedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 self-end sm:self-auto flex-shrink-0">
                      <span className="group-hover:text-purple-300 font-semibold">View Thread</span>
                      <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
