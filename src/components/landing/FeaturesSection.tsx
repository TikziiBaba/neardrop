import React from "react";
import {
  Zap,
  ShieldCheck,
  Clock,
  Lock,
  HardDrive,
  FolderKanban,
  QrCode,
  Gauge,
} from "lucide-react";

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: "Blazing Fast Uploads",
      description:
        "Direct-to-storage presigned upload URLs bypass intermediary web servers for maximum throughput and zero bandwidth throttling.",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      icon: ShieldCheck,
      title: "Cryptographic Share Tokens",
      description:
        "Random 12-character high-entropy tokens prevent guessing or crawling. Each download is protected by temporary signed URLs.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Clock,
      title: "Automatic Link Expiration",
      description:
        "Set links to vanish after 1 hour, 24 hours, or custom duration. Scheduled cleanup guarantees files do not linger forever.",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      icon: Lock,
      title: "SHA-256 Password Lock",
      description:
        "Protect sensitive transfers with optional passwords. Stored using client-verified SHA-256 hashes—never plaintext.",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
    {
      icon: HardDrive,
      title: "Cloudflare R2 Storage",
      description:
        "Built on distributed S3-compatible cloud storage with global edge replication, zero egress fees, and 99.999999999% durability.",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      icon: FolderKanban,
      title: "Complete File Management",
      description:
        "Inspect checksum hashes, rename files, view real-time download counters, revoke active links in 1-click, and track transfer history.",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 border-t border-zinc-800/80 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
            Engineered for Speed & Privacy
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Everything You Need to Share
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Engineered with strict security standards, lightweight architecture, and frictionless user experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-4 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-200"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${feat.bg} ${feat.color} border border-zinc-800`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-white group-hover:text-sky-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
