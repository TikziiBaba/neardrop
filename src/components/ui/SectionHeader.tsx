"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

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
  icon: Icon,
  badgeContent,
  className = "",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`mx-auto flex flex-col items-center justify-center text-center pb-12 sm:pb-16 max-w-3xl px-4 select-none ${className}`}
    >
      {/* Category Pill / Badge */}
      {label && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-3.5 py-1 text-xs font-medium text-sky-400 mb-4 backdrop-blur-md">
          {Icon && <Icon className="h-3.5 w-3.5" />}
          <span>{label}</span>
        </div>
      )}

      {badgeContent && <div className="mb-4">{badgeContent}</div>}

      {/* Main Headline */}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.15]">
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};
