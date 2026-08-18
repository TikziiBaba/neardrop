import React from "react";
import { UploadCloud, Link as LinkIcon, Share2, ArrowRight } from "lucide-react";

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: "01",
      title: "Upload Your Files",
      description:
        "Drag and drop any file or entire folder. High-speed streaming uploads directly to Cloudflare R2 without memory bloat.",
      icon: UploadCloud,
      badge: "Chunked Stream",
    },
    {
      num: "02",
      title: "Configure Security & Link",
      description:
        "Set automatic link expiration (1h to 30d), set download limits, and optionally add SHA-256 password protection.",
      icon: LinkIcon,
      badge: "Zero-Knowledge Hash",
    },
    {
      num: "03",
      title: "Share Instantly",
      description:
        "Copy your unguessable secure link or generate a mobile QR code. Recipients download directly through temporary presigned URLs.",
      icon: Share2,
      badge: "Fast Direct Download",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 border-t border-zinc-800/80 bg-zinc-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
            Streamlined Workflow
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            How NearDrop Works
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            No convoluted dashboards or bloated folder hierarchies. Just seamless, three-step file sharing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 space-y-6 hover:border-zinc-700 transition-all hover:translate-y-[-2px] duration-200"
              >
                {/* Header: Number and Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-extrabold text-zinc-700/60 font-mono">
                    {step.num}
                  </span>
                  <span className="rounded-lg bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-400 border border-sky-500/20">
                    {step.badge}
                  </span>
                </div>

                {/* Icon Box */}
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700 text-sky-400 shadow-md shadow-sky-500/10">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white tracking-tight">{step.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
