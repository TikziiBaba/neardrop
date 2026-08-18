"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Do recipients need a NearDrop account to download shared files?",
      a: "No. Anyone with the unguessable link can access and download the shared file immediately without registering or logging in (unless you set a password, in which case they only need to enter the password).",
    },
    {
      q: "How large can files be?",
      a: "NearDrop streams uploads directly to Cloudflare R2 via presigned URLs without loading entire files into server memory. You can upload large files up to your allocated storage quota limit.",
    },
    {
      q: "How long do share links remain active?",
      a: "You have full control. You can set links to expire in 1 hour, 24 hours, 7 days, 30 days, or never. Once a link expires, it can no longer be accessed by anyone.",
    },
    {
      q: "Are my files public or indexable by search engines?",
      a: "No. All files in your cloud storage are private and protected by PostgreSQL Row Level Security (RLS). Share links use high-entropy random tokens that are never publicly indexed or listed.",
    },
    {
      q: "Can I revoke or delete a shared file at any time?",
      a: "Yes. From your dashboard or Shared tab, you can disable any active link instantly or delete the underlying file, which purges the file from R2 and invalidates all associated links.",
    },
    {
      q: "What storage quota is included?",
      a: "Every new account receives 10 GB of high-speed cloud storage by default. You can track real-time usage and category breakdowns anytime on your Storage page.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-28 border-t border-zinc-800/80 bg-zinc-950">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-xs font-semibold text-sky-400 uppercase tracking-widest">
            Frequently Asked Questions
          </h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Everything You Need to Know
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden transition-colors hover:border-zinc-700"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-sky-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
