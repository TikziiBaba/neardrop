"use client";

import React from "react";
import Link from "next/link";

interface LogoIconProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LogoIcon({ size = "md", className = "" }: LogoIconProps) {
  const sizeMap = {
    sm: "h-7 w-7 rounded-[9px]",
    md: "h-9 w-9 rounded-xl",
    lg: "h-11 w-11 rounded-[14px]",
    xl: "h-14 w-14 rounded-2xl",
  };

  const svgSizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };

  return (
    <div
      className={`relative flex items-center justify-center bg-gradient-to-br from-accent via-accent-hover to-accent-text text-white shadow-lg shadow-accent/30 ring-1 ring-white/20 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 ${sizeMap[size]} ${className}`}
    >
      {/* Damla + altın hale: "Near" + "Drop" ve göksel kimlik */}
      <svg viewBox="0 0 24 24" className={svgSizeMap[size]} xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <ellipse cx="12" cy="4.2" rx="5" ry="1.6" fill="none" stroke="hsl(var(--halo))" strokeWidth="1.6" />
        <path d="M12 7.2C12 7.2 6.5 13 6.5 16.2C6.5 19.3 9 21.5 12 21.5C15 21.5 17.5 19.3 17.5 16.2C17.5 13 12 7.2 12 7.2Z" fill="white" />
        <path d="M9.6 16.4C9.6 17.9 10.6 19 12 19.2" stroke="hsl(var(--accent))" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  badge?: string;
  href?: string;
  className?: string;
}

export function Logo({
  size = "md",
  showText = true,
  badge = "",
  href = "/",
  className = "",
}: LogoProps) {
  const textSizes = {
    sm: "text-sm",
    md: "text-base font-semibold",
    lg: "text-xl font-semibold",
    xl: "text-2xl font-bold",
  };

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <LogoIcon size={size} />

      {showText && (
        <div className="flex items-center gap-1.5">
          <span
            className={`font-display tracking-tight text-foreground transition-colors group-hover:text-accent-text ${textSizes[size]}`}
          >
            Near<span className="italic text-accent-text">Drop</span>
          </span>
          {badge && (
            <span className="rounded-full bg-accent/10 border border-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent-text">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}

export default Logo;
