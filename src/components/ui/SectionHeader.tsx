"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  badgeContent?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  title,
  subtitle,
  icon: Icon = Sparkles,
  badgeContent,
  className = "",
}) => {
  // Config for shooting stars / meteors
  const shootingStars = [
    { id: 1, top: "15%", left: "10%", delay: 0, duration: 3.2, length: "w-28" },
    { id: 2, top: "25%", left: "45%", delay: 1.8, duration: 2.8, length: "w-36" },
    { id: 3, top: "10%", left: "70%", delay: 3.5, duration: 3.4, length: "w-32" },
    { id: 4, top: "35%", left: "25%", delay: 4.8, duration: 3.0, length: "w-24" },
  ];

  // Config for drifting / twinkling stars
  const driftingStars = [
    { id: 1, top: "12%", left: "15%", size: "h-1 w-1", duration: 3, delay: 0 },
    { id: 2, top: "22%", left: "28%", size: "h-1.5 w-1.5", duration: 4, delay: 1 },
    { id: 3, top: "8%", left: "42%", size: "h-1 w-1", duration: 3.5, delay: 0.5 },
    { id: 4, top: "18%", left: "58%", size: "h-1.5 w-1.5", duration: 4.5, delay: 1.5 },
    { id: 5, top: "10%", left: "75%", size: "h-1 w-1", duration: 3.2, delay: 2 },
    { id: 6, top: "26%", left: "85%", size: "h-1.5 w-1.5", duration: 3.8, delay: 0.8 },
    { id: 7, top: "34%", left: "20%", size: "h-1 w-1", duration: 4.2, delay: 1.2 },
    { id: 8, top: "30%", left: "68%", size: "h-1 w-1", duration: 3.6, delay: 2.2 },
  ];

  return (
    <div className={`relative w-full max-w-5xl mx-auto text-center pt-6 pb-12 select-none ${className}`}>
      {/* 1. Atmospheric Ambient Glow with Zero Sharp Edges (Masked to Transparent) */}
      <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_25%,#000_30%,transparent_100%)]">
        {/* Deep cosmic blue radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_20%,rgba(14,165,233,0.35),rgba(30,58,138,0.20)_45%,transparent_80%)] blur-2xl" />
        {/* Intense cyan core light */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-96 h-36 bg-sky-400/25 blur-3xl rounded-full" />
      </div>

      {/* 2. Animated Shooting Stars / Sliding Meteors */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden [mask-image:radial-gradient(ellipse_80%_60%_at_50%_30%,#000_40%,transparent_90%)]">
        {shootingStars.map((star) => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0, x: -60, y: -30 }}
            animate={{
              opacity: [0, 0.9, 1, 0],
              x: [0, 180],
              y: [0, 90],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
            style={{ top: star.top, left: star.left }}
            className={`absolute ${star.length} h-[1.5px] -rotate-[-28deg] bg-gradient-to-r from-transparent via-sky-300 to-white shadow-[0_0_10px_#38bdf8] rounded-full`}
          />
        ))}

        {/* 3. Drifting & Twinkling Ambient Stars */}
        {driftingStars.map((star) => (
          <motion.div
            key={star.id}
            animate={{
              opacity: [0.2, 0.95, 0.2],
              scale: [0.8, 1.25, 0.8],
              y: [0, -4, 0],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
            style={{ top: star.top, left: star.left }}
            className={`absolute ${star.size} rounded-full bg-white shadow-[0_0_8px_#38bdf8]`}
          />
        ))}
      </div>

      {/* 4. Subtle Animated Vertical Grid Lines with Soft Masking */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-36 opacity-25 bg-[linear-gradient(to_right,rgba(56,189,248,0.25)_1px,transparent_1px)] bg-[size:3.5rem_100%] [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,#000_40%,transparent_100%)]" />

      {/* 5. Seamless Curved Dome Horizon Arc */}
      <div className="relative w-full flex items-center justify-center pt-2 mb-3">
        <div className="w-full max-w-3xl h-12 sm:h-14 relative flex items-center justify-center [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <svg
            viewBox="0 0 1000 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible drop-shadow-[0_0_16px_rgba(56,189,248,0.55)]"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="smoothBlueArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
                <stop offset="15%" stopColor="rgba(56, 189, 248, 0.35)" />
                <stop offset="35%" stopColor="rgba(56, 189, 248, 0.85)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 1)" />
                <stop offset="65%" stopColor="rgba(56, 189, 248, 0.85)" />
                <stop offset="85%" stopColor="rgba(56, 189, 248, 0.35)" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
              </linearGradient>
              <filter id="smoothArcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Glowing diffuse back-arc */}
            <path
              d="M 0 125 Q 500 -10 1000 125"
              stroke="rgba(14, 165, 233, 0.6)"
              strokeWidth="5"
              fill="none"
              filter="url(#smoothArcGlow)"
              className="opacity-75"
            />
            {/* Crisp foreground luminous arc */}
            <path
              d="M 0 125 Q 500 -10 1000 125"
              stroke="url(#smoothBlueArcGrad)"
              strokeWidth="2.2"
              fill="none"
            />
          </svg>

          {/* 6. Pulsing Circular Peak Badge (Centered on the Horizon Peak) */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute -top-4 sm:-top-5 z-20"
          >
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white p-3 text-zinc-950 shadow-[0_0_30px_rgba(56,189,248,0.8),0_4px_16px_rgba(0,0,0,0.6)] ring-4 ring-zinc-950 border border-sky-300 transition-transform duration-300 hover:scale-110">
              {/* Outer pulsing glow wave */}
              <span className="absolute -inset-1 rounded-full bg-sky-400/20 blur-sm animate-pulse pointer-events-none" />
              
              {/* Inner bezel border */}
              <div className="absolute inset-0.5 rounded-full border border-zinc-200/80 pointer-events-none" />
              
              {badgeContent || (
                <Icon className="h-6 w-6 text-zinc-950 fill-zinc-950 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 7. Section Label Pill (Optional) */}
      {label && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-[11px] font-semibold text-sky-300 uppercase tracking-widest mb-3 backdrop-blur-md shadow-sm shadow-sky-500/10"
        >
          <span>{label}</span>
        </motion.div>
      )}

      {/* 8. Main Section Title */}
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.12 }}
        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight"
      >
        {title}
      </motion.h2>

      {/* 9. Subtitle Description with Smooth Text Flow */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed px-4"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};
