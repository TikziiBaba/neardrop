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
  // Twinkling / blinking star dots
  const twinklingStars = [
    { id: 1, top: "14%", left: "12%", size: "h-1 w-1", duration: 3.2, delay: 0 },
    { id: 2, top: "28%", left: "22%", size: "h-1.5 w-1.5", duration: 4.0, delay: 1.2 },
    { id: 3, top: "10%", left: "38%", size: "h-1 w-1", duration: 3.6, delay: 0.4 },
    { id: 4, top: "24%", left: "48%", size: "h-1 w-1", duration: 4.4, delay: 1.8 },
    { id: 5, top: "12%", left: "64%", size: "h-1.5 w-1.5", duration: 3.8, delay: 0.8 },
    { id: 6, top: "26%", left: "78%", size: "h-1 w-1", duration: 4.2, delay: 1.4 },
    { id: 7, top: "16%", left: "88%", size: "h-1 w-1", duration: 3.4, delay: 2.1 },
    { id: 8, top: "38%", left: "16%", size: "h-1 w-1", duration: 4.6, delay: 0.6 },
    { id: 9, top: "34%", left: "82%", size: "h-1.5 w-1.5", duration: 3.9, delay: 1.6 },
    { id: 10, top: "8%", left: "72%", size: "h-1 w-1", duration: 3.5, delay: 2.4 },
  ];

  return (
    <div className={`relative w-full max-w-5xl mx-auto text-center pt-10 pb-12 select-none ${className}`}>
      {/* 1. Ultra-Smooth Multi-Layer Blue-to-Black Ambient Atmosphere */}
      <div className="pointer-events-none absolute inset-0 -top-24 h-96 w-full flex items-center justify-center overflow-visible">
        {/* Deep wide radial gradient that softly vanishes into pure black */}
        <div className="absolute w-[120%] max-w-5xl h-96 bg-[radial-gradient(ellipse_75%_65%_at_50%_15%,rgba(14,165,233,0.18)_0%,rgba(2,132,199,0.09)_30%,rgba(15,23,42,0.03)_60%,transparent_85%)] blur-2xl" />
        
        {/* Soft centered cyan core haze */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-80 h-32 bg-sky-500/15 blur-3xl rounded-full" />
        
        {/* Vertical gentle light falloff */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent" />
      </div>

      {/* 2. Soft Twinkling Star Dots */}
      <div className="pointer-events-none absolute inset-0 -top-12 h-64 overflow-hidden [mask-image:radial-gradient(ellipse_75%_65%_at_50%_35%,#000_30%,transparent_90%)]">
        {twinklingStars.map((star) => (
          <motion.div
            key={star.id}
            animate={{
              opacity: [0.15, 0.85, 0.15],
              scale: [0.75, 1.2, 0.75],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut",
            }}
            style={{ top: star.top, left: star.left }}
            className={`absolute ${star.size} rounded-full bg-white shadow-[0_0_6px_#38bdf8]`}
          />
        ))}
      </div>

      {/* 3. Smooth Curved Dome Horizon Arc (Softly Faded to Transparent) */}
      <div className="relative w-full flex items-center justify-center pt-2 mb-3">
        <div className="w-full max-w-3xl h-12 sm:h-14 relative flex items-center justify-center [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]">
          <svg
            viewBox="0 0 1000 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="seamlessBlueArc" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
                <stop offset="20%" stopColor="rgba(56, 189, 248, 0.25)" />
                <stop offset="40%" stopColor="rgba(56, 189, 248, 0.75)" />
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.95)" />
                <stop offset="60%" stopColor="rgba(56, 189, 248, 0.75)" />
                <stop offset="80%" stopColor="rgba(56, 189, 248, 0.25)" />
                <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
              </linearGradient>
              <filter id="softArcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Glowing diffuse back-arc */}
            <path
              d="M 0 125 Q 500 -10 1000 125"
              stroke="rgba(14, 165, 233, 0.45)"
              strokeWidth="4"
              fill="none"
              filter="url(#softArcGlow)"
              className="opacity-60"
            />
            {/* Crisp foreground luminous arc */}
            <path
              d="M 0 125 Q 500 -10 1000 125"
              stroke="url(#seamlessBlueArc)"
              strokeWidth="1.8"
              fill="none"
            />
          </svg>

          {/* 4. Circular Peak Badge (Centered on the Horizon Peak) */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute -top-4 sm:-top-5 z-20"
          >
            <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white p-3 text-zinc-950 shadow-[0_0_24px_rgba(56,189,248,0.5),0_4px_14px_rgba(0,0,0,0.5)] ring-4 ring-zinc-950 border border-sky-200/80 transition-transform duration-300 hover:scale-105">
              {/* Subtle inner ring */}
              <div className="absolute inset-0.5 rounded-full border border-zinc-200/60 pointer-events-none" />
              
              {badgeContent || (
                <Icon className="h-6 w-6 text-zinc-950 fill-zinc-950 relative z-10" />
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 5. Section Label Pill (Optional) */}
      {label && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-3.5 py-1 text-[11px] font-semibold text-sky-300 uppercase tracking-widest mb-3 backdrop-blur-md"
        >
          <span>{label}</span>
        </motion.div>
      )}

      {/* 6. Main Section Title */}
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 leading-tight"
      >
        {title}
      </motion.h2>

      {/* 7. Subtitle Description */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed px-4"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};
