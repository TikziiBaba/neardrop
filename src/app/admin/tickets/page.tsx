"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Ticket } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import {
  LifeBuoy,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const fetchTickets = React.useCallback(async () => {
    try {
      setLoading(true);
      let url = "/api/admin/tickets";
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (departmentFilter !== "all") params.append("department", departmentFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.tickets) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error("Admin tickets fetch error:", err);
      toast.error("Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, departmentFilter]);

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
            Awaiting User
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
        return (
          <span className="rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/20">
            High
          </span>
        );
      case "medium":
        return <span className="text-sky-400 font-semibold text-xs">Medium</span>;
      default:
        return <span className="text-zinc-500 text-xs">Low</span>;
    }
  };

  const filteredTickets = tickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <span>Support Ticket Inbox</span>
              <span className="rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-400 border border-purple-500/20">
                {tickets.length} Active Inquiries
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Review and respond to customer tickets, storage inquiries, and technical requests.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            disabled={loading}
            className="gap-2 text-xs rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-purple-400" : ""}`} />
            <span>Refresh Inbox</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by subject, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs bg-zinc-900/60 border-zinc-800 rounded-xl"
            />
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {["all", "open", "in_progress", "waiting_customer", "resolved", "closed"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Table */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-xl apple-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Subject / Ticket</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Updated</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto text-purple-400 mb-2" />
                      Loading staff inbox...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      No support tickets found for the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => (window.location.href = `/admin/tickets/${t.id}`)}
                      className="hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="min-w-0 max-w-[240px] sm:max-w-[300px]">
                          <p className="font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                            {t.title}
                          </p>
                          <p className="font-mono text-[10px] text-zinc-500 truncate">
                            {t.id}
                          </p>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-200 truncate">{t.userName}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{t.userEmail}</p>
                        </div>
                      </td>

                      <td className="py-4 px-4 capitalize text-zinc-300 font-medium">
                        {t.department}
                      </td>

                      <td className="py-4 px-4">
                        {getPriorityBadge(t.priority)}
                      </td>

                      <td className="py-4 px-4">
                        {getStatusBadge(t.status)}
                      </td>

                      <td className="py-4 px-4 text-[11px] text-zinc-400 whitespace-nowrap">
                        {formatRelativeTime(t.updatedAt)}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link href={`/admin/tickets/${t.id}`} onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 gap-1 rounded-lg"
                          >
                            <span>Respond</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
