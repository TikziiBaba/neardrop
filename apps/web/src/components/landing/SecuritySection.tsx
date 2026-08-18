import React from "react";
import { Shield, KeyRound, Database, FileLock, RefreshCw, EyeOff } from "lucide-react";

export const SecuritySection: React.FC = () => {
  const securityPillars = [
    {
      icon: KeyRound,
      title: "Row Level Security (RLS)",
      desc: "PostgreSQL enforces granular tenant isolation at the database layer. No user can view, query, or delete another user's file records.",
    },
    {
      icon: FileLock,
      title: "Temporary Signed URLs",
      desc: "Private R2 buckets are completely isolated from public internet. File downloads are granted through signed URLs that expire within minutes.",
    },
    {
      icon: EyeOff,
      title: "High-Entropy Token URLs",
      desc: "Share links use 12-character cryptographically random tokens, making brute-force enumeration practically impossible.",
    },
    {
      icon: Database,
      title: "Zero-Knowledge Password Hashing",
      desc: "Protected shares verify access using client-generated SHA-256 digests. Raw passwords are never transmitted or stored in the database.",
    },
    {
      icon: RefreshCw,
      title: "Automated Lifespan Cleanup",
      desc: "Scheduled backend cleanup routines invalidate expired tokens and purge stale storage objects automatically.",
    },
    {
      icon: Shield,
      title: "Strict Egress Restrictions",
      desc: "Direct browser-to-R2 streaming eliminates intermediary server buffering and reduces risk of memory-based data exfiltration.",
    },
  ];

  return (
    <section id="security" className="py-20 md:py-28 border-t border-zinc-800/80 bg-zinc-950/60 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <Shield className="h-3.5 w-3.5" />
            <span>Infrastructure & Data Safety</span>
          </div>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Built on Defense in Depth
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            NearDrop keeps security straightforward, auditable, and reliable from browser to cloud storage.
          </p>
        </div>

        {/* Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityPillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-emerald-400 border border-zinc-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Technical Architecture Flow */}
        <div className="mt-12 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 mb-4">
            Architecture at a Glance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-sky-400 font-bold">1. Browser Client</span>
              <p className="text-zinc-400 text-[11px] font-sans">
                Authenticates via Supabase Auth. Requests presigned upload or download authorization.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-blue-400 font-bold">2. Supabase + RLS</span>
              <p className="text-zinc-400 text-[11px] font-sans">
                Validates user identity, verifies quota limits, generates token, and manages metadata.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <span className="text-indigo-400 font-bold">3. Cloudflare R2</span>
              <p className="text-zinc-400 text-[11px] font-sans">
                Receives encrypted payload directly via signed S3 URLs. Direct streaming for recipient download.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
