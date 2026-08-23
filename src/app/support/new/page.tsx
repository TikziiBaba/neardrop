"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth/context";
import { TicketDepartment, TicketPriority } from "@/types";
import {
  ArrowLeft,
  Send,
  LifeBuoy,
  ShieldCheck,
  AlertTriangle,
  HardDrive,
  CreditCard,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function NewTicketPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState<TicketDepartment>("technical");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to open a support ticket");
      return;
    }
    if (!title || !message) {
      toast.error("Please fill in the title and description");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: user.displayName,
          userRole: user.role,
          title,
          department,
          priority,
          message,
        }),
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        toast.success("Support ticket created successfully!");
        router.push(`/support/${data.ticket.id}`);
      } else {
        toast.error(data.error || "Failed to create ticket");
      }
    } catch (err: any) {
      toast.error(err.message || "Ticket submission error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Navigation Back */}
        <Link
          href="/support"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Support Hub</span>
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create a Support Request
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Describe your inquiry or issue. Our support team and administrators will respond directly.
          </p>
        </div>

        {/* Ticket Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 space-y-6 apple-card"
        >
          {/* Department Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Target Department</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: "technical", label: "Technical & LAN", icon: Layers },
                { id: "storage", label: "Cloud & Storage", icon: HardDrive },
                { id: "billing", label: "Billing & Plans", icon: CreditCard },
                { id: "general", label: "General & Help", icon: LifeBuoy },
              ].map((dep) => {
                const Icon = dep.icon;
                const isSelected = department === dep.id;
                return (
                  <button
                    key={dep.id}
                    type="button"
                    onClick={() => setDepartment(dep.id as any)}
                    className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/15 text-white shadow-sm"
                        : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1.5 ${isSelected ? "text-purple-400" : "text-zinc-500"}`} />
                    <span className="text-[11px] font-bold">{dep.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Urgency Level</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "low", label: "Low", desc: "Non-urgent question" },
                { id: "medium", label: "Medium", desc: "Standard inquiry" },
                { id: "high", label: "High", desc: "Feature degraded" },
                { id: "urgent", label: "Urgent", desc: "Critical blocker" },
              ].map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as any)}
                    className={`rounded-xl border p-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-purple-500 bg-purple-500/15 text-white"
                        : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <span className="capitalize">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Subject / Inquiry Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Question about 500GB storage upgrade / Link expiration issue"
              className="rounded-xl text-xs bg-zinc-950/60"
              required
            />
          </div>

          {/* Detailed Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Message Description</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Please provide all relevant details, error messages, or questions..."
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all resize-none"
              required
            />
          </div>

          {/* Submit CTA */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="text-xs rounded-xl bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 gap-2 font-bold px-6 py-2.5"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? "Submitting..." : "Submit Ticket"}</span>
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
