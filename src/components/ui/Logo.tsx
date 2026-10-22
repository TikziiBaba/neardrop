"use client";

import React from "react";
import Link from "next/link";

interface LogoIconProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

// Piksel damla — brand/neardrop-logo/neardrop-symbol-dark-bg.svg ile aynı 16×16 ızgara (1 birim = 1 hücre)
const DROP_BODY =
  "M7 1h2v2h-2zM6 3h4v1h-4zM5 4h6v1h-6zM4 5h8v1h-8zM3 6h1v2h-1zM5 6h8v2h-8zM2 8h1v1h-1zM4 8h10v1h-10z" +
  "M2 9h4v2h-4zM7 9h2v2h-2zM10 9h4v2h-4zM2 11h12v2h-12zM3 13h10v1h-10zM5 14h6v1h-6z";
const DROP_GLINT = "M4 6h1v2h-1zM3 8h1v1h-1z";
const DROP_EYES = "M6 9h1v2h-1zM9 9h1v2h-1z";

export function LogoIcon({ size = "md", className = "" }: LogoIconProps) {
  // Pikseller keskin kalsın diye kutu 16'nın katlarında
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <svg
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`shrink-0 drop-shadow-[0_4px_14px_rgba(98,220,245,0.35)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105 ${sizeMap[size]} ${className}`}
    >
      <path fill="#62DCF5" d={DROP_BODY} />
      <path fill="#D4FBFF" d={DROP_GLINT} />
      <path fill="#0B2D5C" d={DROP_EYES} />
    </svg>
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
  // Yazının büyük harf yüksekliği sembol kutusunun ~%40'ı (brand/neardrop-logo yatay yerleşimiyle aynı oran)
  const textSizes = {
    sm: "text-lg font-semibold",
    md: "text-lg font-semibold",
    lg: "text-[28px] font-semibold",
    xl: "text-4xl font-semibold",
  };
  const gaps = { sm: "gap-1.5", md: "gap-1.5", lg: "gap-2", xl: "gap-2.5" };

  const content = (
    <div className={`flex items-center ${gaps[size]} group select-none ${className}`}>
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
