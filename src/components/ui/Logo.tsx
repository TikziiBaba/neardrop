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
      className={`relative flex items-center justify-center bg-gradient-to-b from-[#38bdf8] via-[#2563eb] to-[#1d4ed8] text-white shadow-lg shadow-blue-500/25 transition-transform duration-200 group-hover:scale-105 ${sizeMap[size]} ${className}`}
      style={{
        boxShadow: "0 4px 14px 0 rgba(37, 99, 235, 0.35)",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${svgSizeMap[size]} text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main 4-pointed Sparkle */}
        <path d="M12 2C12 7.5 7.5 12 2 12C7.5 12 12 16.5 12 22C12 16.5 16.5 12 22 12C16.5 12 12 7.5 12 2Z" />
        {/* Top-Right Secondary Sparkle */}
        <path d="M19 3C19 4.8 17.8 6 16 6C17.8 6 19 7.2 19 9C19 7.2 20.2 6 22 6C20.2 6 19 4.8 19 3Z" />
        {/* Bottom-Left Particle Dot */}
        <circle cx="5.5" cy="18.5" r="1.5" />
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
  badge = "v1.0",
  href = "/",
  className = "",
}: LogoProps) {
  const textSizes = {
    sm: "text-sm",
    md: "text-base font-bold",
    lg: "text-xl font-bold",
    xl: "text-2xl font-extrabold",
  };

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      <LogoIcon size={size} />

      {showText && (
        <div className="flex items-center gap-1.5">
          <span
            className={`tracking-tight text-white font-bold transition-colors group-hover:text-blue-100 ${textSizes[size]}`}
          >
            NearDrop
          </span>
          {badge && (
            <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
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
