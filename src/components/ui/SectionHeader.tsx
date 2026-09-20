"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  align?: "center" | "left";
  /** @deprecated Not rendered — kept for call-site compatibility */
  label?: string;
  /** @deprecated Not rendered */
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  /** @deprecated Not rendered */
  badgeContent?: React.ReactNode;
  /** @deprecated Ignored */
  variant?: "curved" | "simple";
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  className = "",
  align = "center",
}) => {
  const centered = align === "center";

  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ type: "spring", bounce: 0.15, duration: 0.65 }}
      className={cn(
        "mb-12 md:mb-16 select-none",
        centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl text-left",
        className
      )}
    >
      <h2 className="apple-headline-section">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-4 apple-subhead",
            centered && "mx-auto max-w-xl"
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.header>
  );
};
