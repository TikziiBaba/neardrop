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
  glowColor?: "blue" | "sky" | "indigo" | "purple";
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  label,
  title,
  subtitle,
  icon: Icon = Sparkles,
  badgeContent,
  className = "",
  glowColor = "blue",
}) => {
  return (
    <div className={`relative w-full max-w-4xl mx-auto text-center pt-8 pb-12 overflow-hidden ${className}`}>
      {/* 1. Ambient Background Glow (Blue Atmosphere) */}
      <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64">
        {/* Radial atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_60%_at_50%_15%,rgba(14,165,233,0.30),rgba(30,58,138,0.15)_45%,transparent_75%)] blur-2xl" />
        
        {/* Secondary soft highlight */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-72 h-36 bg-sky-400/20 blur-3xl rounded-full" />
      </div>

      {/* 2. Micro Star Particles (Space Atmosphere) */}
      <div className="pointer-events-none absolute inset-0 opacity-80 select-none">
        <div className="absolute top-3 left-[18%] h-1 w-1 rounded-full bg-sky-200/60 shadow-[0_0_6px_#38bdf8]" />
        <div className="absolute top-8 left-[32%] h-1.5 w-1.5 rounded-full bg-white/70 shadow-[0_0_8px_#ffffff]" />
        <div className="absolute top-5 left-[45%] h-1 w-1 rounded-full bg-sky-300/50" />
        <div className="absolute top-12 left-[62%] h-1 w-1 rounded-full bg-sky-200/70 shadow-[0_0_6px_#38bdf8]" />
        <div className="absolute top-4 left-[78%] h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_8px_#ffffff]" />
        <div className="absolute top-10 left-[88%] h-1 w-1 rounded-full bg-sky-400/50" />
        <div className="absolute top-16 left-[24%] h-1 w-1 rounded-full bg-sky-300/40" />
        <div className="absolute top-14 left-[70%] h-1 w-1 rounded-full bg-sky-200/50" />
      </div>

      {/* 3. Subtle Vertical Grid Lines */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-28 opacity-20 bg-[linear-gradient(to_right,rgba(56,189,248,0.3)_1px,transparent_1px)] bg-[size:3.5rem_100%] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* 4. Curved Dome Horizon Arc */}
      <div className="relative w-full flex items-center justify-center pt-4 mb-4">
        {/* SVG Curved Arc Line */}
        <div className="w-full max-w-2xl h-10 sm:h-12 relative flex items-center justify-center">
          <svg
            viewBox="0 0 800 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="blueArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
                <stop offset="25%" stopColor="rgba(56, 189, 248, 0.4)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.95)" />
                <stop offset="75%" stopColor="rgba(56, 189, 248, 0.4)" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
              </linearGradient>
              <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Glowing duplicate background arc */}
            <path
              d="M 0 115 Q 400 -15 800 115"
              stroke="rgba(14, 165, 233, 0.6)"
              strokeWidth="4"
              fill="none"
              filter="url(#arcGlow)"
              className="opacity-70"
            />
            {/* Crisp foreground arc */}
            <path
              d="M 0 115 Q 400 -15 800 115"
              stroke="url(#blueArcGrad)"
              strokeWidth="2"
              fill="none"
            />
          </svg>

          {/* 5. Circular Peak Badge (Centered on the Arc Horizon) */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute -top-4 sm:-top-5 z-20"
          >
            <div className="relative flex h-13 w-13 sm:h-15 sm:w-15 items-center justify-center rounded-full bg-white p-3 text-zinc-950 shadow-[0_0_25px_rgba(56,189,248,0.7),0_4px_12px_rgba(0,0,0,0.5)] ring-4 ring-zinc-950 border border-sky-300/60 transition-transform duration-300 hover:scale-110">
              {/* Subtle inner ring */}
              <div className="absolute inset-0.5 rounded-full border border-zinc-200/80 pointer-events-none" />
              
              {badgeContent || (
                <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-900 fill-zinc-900" />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 6. Section Label Pill (Optional) */}
      {label && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-[11px] font-semibold text-sky-300 uppercase tracking-widest mb-3 backdrop-blur-md"
        >
          <span>{label}</span>
        </motion.div>
      )}

      {/* 7. Main Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3"
      >
        {title}
      </motion.h2>

      {/* 8. Subtitle Description */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed px-4"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};
