"use client";

import React, { useId } from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

// Dense, rich starry sky field matching the reference image density
const RICH_COSMIC_STARS = [
  { x: "5%", y: "35%", size: 1.5, delay: 0, duration: 3.2 },
  { x: "9%", y: "20%", size: 2, delay: 1.2, duration: 4.0 },
  { x: "13%", y: "48%", size: 1, delay: 2.1, duration: 3.5 },
  { x: "17%", y: "28%", size: 2.5, delay: 0.5, duration: 2.8 },
  { x: "21%", y: "55%", size: 1.5, delay: 1.8, duration: 4.2 },
  { x: "25%", y: "15%", size: 1, delay: 2.4, duration: 3.1 },
  { x: "29%", y: "38%", size: 2, delay: 0.8, duration: 3.7 },
  { x: "33%", y: "22%", size: 1.5, delay: 1.5, duration: 4.4 },
  { x: "37%", y: "45%", size: 2.5, delay: 0.3, duration: 3.0 },
  { x: "41%", y: "18%", size: 1, delay: 2.0, duration: 3.6 },
  { x: "45%", y: "32%", size: 2, delay: 0.9, duration: 4.1 },
  { x: "48%", y: "52%", size: 1.5, delay: 1.7, duration: 3.3 },

  // Perfectly mirrored on the right side:
  { x: "52%", y: "52%", size: 1.5, delay: 1.7, duration: 3.3 },
  { x: "55%", y: "32%", size: 2, delay: 0.9, duration: 4.1 },
  { x: "59%", y: "18%", size: 1, delay: 2.0, duration: 3.6 },
  { x: "63%", y: "45%", size: 2.5, delay: 0.3, duration: 3.0 },
  { x: "67%", y: "22%", size: 1.5, delay: 1.5, duration: 4.4 },
  { x: "71%", y: "38%", size: 2, delay: 0.8, duration: 3.7 },
  { x: "75%", y: "15%", size: 1, delay: 2.4, duration: 3.1 },
  { x: "79%", y: "55%", size: 1.5, delay: 1.8, duration: 4.2 },
  { x: "83%", y: "28%", size: 2.5, delay: 0.5, duration: 2.8 },
  { x: "87%", y: "48%", size: 1, delay: 2.1, duration: 3.5 },
  { x: "91%", y: "20%", size: 2, delay: 1.2, duration: 4.0 },
  { x: "95%", y: "35%", size: 1.5, delay: 0, duration: 3.2 },

  // Additional subtle ambient dust
  { x: "8%", y: "60%", size: 1, delay: 1.1, duration: 3.8 },
  { x: "15%", y: "12%", size: 1.2, delay: 2.2, duration: 4.3 },
  { x: "23%", y: "42%", size: 1, delay: 0.7, duration: 3.4 },
  { x: "31%", y: "62%", size: 1.2, delay: 1.9, duration: 3.9 },
  { x: "69%", y: "62%", size: 1.2, delay: 1.9, duration: 3.9 },
  { x: "77%", y: "42%", size: 1, delay: 0.7, duration: 3.4 },
  { x: "85%", y: "12%", size: 1.2, delay: 2.2, duration: 4.3 },
  { x: "92%", y: "60%", size: 1, delay: 1.1, duration: 3.8 },
];

// Sparkles SVG from user snippet
const DefaultSparklesSvg: React.FC<{ className?: string }> = ({
  className = "h-10 w-10 sm:h-12 sm:w-12 text-neutral-800",
}) => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    aria-hidden="true"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
      clipRule="evenodd"
    />
  </svg>
);

export interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  badgeContent?: React.ReactNode;
  className?: string;
  variant?: "curved" | "simple";
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  title,
  subtitle,
  icon: Icon,
  badgeContent,
  className = "",
  variant = "curved",
}) => {
  const gradientId = useId();
  const filterId = useId();

  // Classic simple header fallback
  if (variant === "simple") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`mx-auto flex flex-col items-center justify-center text-center pb-12 sm:pb-16 max-w-3xl px-4 select-none ${className}`}
      >
        {label && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-3.5 py-1 text-xs font-medium text-sky-400 mb-4 backdrop-blur-md">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{label}</span>
          </div>
        )}
        {badgeContent && <div className="mb-4">{badgeContent}</div>}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </motion.div>
    );
  }

  // Exact Blue Replica of User's Reference Banner
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative w-full flex flex-col items-center justify-center pb-8 sm:pb-12 select-none overflow-hidden ${className}`}
    >
      {/* Cosmic Stage Container */}
      <div className="relative w-full max-w-5xl mx-auto h-[220px] sm:h-[240px] flex items-end justify-center overflow-hidden">
        {/* Rich Celestial Blue Sky (Above the dome) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Deep Blue Atmospheric Glow radiating upward */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_90%_at_50%_100%,_rgba(14,165,233,0.42)_0%,_rgba(3,105,161,0.22)_40%,_rgba(2,132,199,0.06)_70%,_transparent_100%)]" />

          {/* Vertical Guidelines across the whole sky (17 columns, centered) */}
          <div className="absolute inset-0 flex justify-between max-w-4xl mx-auto px-6 opacity-30">
            {Array.from({ length: 17 }).map((_, i) => (
              <div
                key={i}
                className="w-[1px] h-full bg-gradient-to-b from-transparent via-sky-400/25 to-sky-400/40"
              />
            ))}
          </div>

          {/* Symmetrically Mirrored Cosmic Star Field */}
          <div className="absolute inset-0 max-w-4xl mx-auto">
            {RICH_COSMIC_STARS.map((star, i) => (
              <motion.div
                key={i}
                style={{
                  left: star.x,
                  top: star.y,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                }}
                animate={{
                  opacity: [0.2, 0.95, 0.2],
                  scale: [0.85, 1.25, 0.85],
                }}
                transition={{
                  duration: star.duration,
                  repeat: Infinity,
                  delay: star.delay,
                  ease: "easeInOut",
                }}
                className="absolute rounded-full bg-sky-200 shadow-[0_0_6px_rgba(186,230,253,0.9)]"
              />
            ))}
          </div>
        </div>

        {/* The Dark Planet Dome & Glowing Blue Arc (SVG) */}
        <div className="absolute inset-x-0 bottom-0 h-[200px] pointer-events-none">
          <svg
            viewBox="0 0 1200 200"
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            <defs>
              {/* Electric Sky-Blue Stroke Gradient */}
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0" />
                <stop offset="20%" stopColor="#0284c7" stopOpacity="0.5" />
                <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#0284c7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </linearGradient>

              {/* Glowing Drop-Shadow Filter */}
              <filter id={filterId} x="-20%" y="-40%" width="140%" height="180%">
                <feGaussianBlur stdDeviation="4" result="blur1" />
                <feGaussianBlur stdDeviation="10" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Dark Planet Dome Body (Solid Opaque Fill Below the Curve) */}
            <path
              d="M -50 180 Q 600 45 1250 180 L 1250 250 L -50 250 Z"
              className="fill-zinc-950"
            />

            {/* Glowing Blue Outer Stroke (Pulsing) */}
            <motion.path
              d="M -50 180 Q 600 45 1250 180"
              stroke={`url(#${gradientId})`}
              strokeWidth="4"
              filter={`url(#${filterId})`}
              fill="none"
              animate={{
                opacity: [0.8, 1, 0.8],
                strokeWidth: [3.5, 4.5, 3.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Crisp Core Blue Stroke */}
            <path
              d="M -50 180 Q 600 45 1250 180"
              stroke={`url(#${gradientId})`}
              strokeWidth="1.75"
              fill="none"
            />
          </svg>
        </div>

        {/* Center Floating White Circular Badge */}
        {/* Exactly sits at the crest of the dome (apex y = 45px) */}
        <div className="absolute left-1/2 top-[45px] -translate-x-1/2 -translate-y-1/2 z-20">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            {/* Ambient Sky-Blue Halo behind Badge */}
            <div className="absolute inset-0 rounded-full bg-sky-400/35 blur-xl scale-125 pointer-events-none" />

            {/* User's Exact White Circle Badge Snippet */}
            <div className="bg-white border-solid border-[3px] border-neutral-300 p-3.5 sm:p-4 w-24 h-24 sm:w-28 sm:h-28 mx-auto grid place-content-center rounded-full shadow-2xl relative z-10 transition-transform duration-300 hover:scale-105">
              {Icon ? (
                <Icon className="h-10 w-10 sm:h-12 sm:w-12 text-neutral-800 dark:text-neutral-800" />
              ) : (
                <DefaultSparklesSvg className="h-10 w-10 sm:h-12 sm:w-12 text-neutral-800 dark:text-neutral-800" />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Headline & Subtitle Inside / Below the Dark Dome */}
      <div className="relative z-10 mt-2 sm:mt-4 text-center max-w-4xl px-4 flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-3.5 text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};
