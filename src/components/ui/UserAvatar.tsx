"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";

interface UserAvatarProps {
  user?: {
    displayName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    role?: string | null;
    status?: string | null;
  } | null;
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showStatusDot?: boolean;
  roleBadge?: boolean;
}

// Generate consistent beautiful gradient colors based on string
function getGradientFromName(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palettes = [
    "from-purple-600 via-indigo-600 to-blue-600",
    "from-sky-500 via-blue-600 to-indigo-700",
    "from-emerald-500 via-teal-600 to-cyan-700",
    "from-pink-500 via-rose-600 to-purple-700",
    "from-amber-500 via-orange-600 to-rose-700",
    "from-violet-600 via-purple-700 to-fuchsia-800",
    "from-cyan-500 via-blue-600 to-violet-700",
  ];
  const index = Math.abs(hash) % palettes.length;
  return palettes[index];
}

// Extract clean 1-2 initials from name or email
function getInitials(name?: string | null, email?: string | null): string {
  const target = (name || email || "U").trim();
  if (!target) return "U";
  const parts = target.split(/[\s@._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return target.substring(0, 2).toUpperCase();
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  src,
  name,
  size = "md",
  className = "",
  showStatusDot = false,
  roleBadge = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const displayName = name || user?.displayName || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";
  const avatarUrl = src !== undefined ? src : user?.avatarUrl;
  const initials = getInitials(displayName, email);
  const gradientClass = getGradientFromName(displayName + email);

  const sizeClasses = {
    xs: "h-5 w-5 text-[9px]",
    sm: "h-7 w-7 text-xs",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
    xl: "h-16 w-16 text-lg",
    "2xl": "h-20 w-20 text-xl font-bold",
  };

  const hasValidUrl = Boolean(avatarUrl && avatarUrl.trim().length > 5 && !imageError);

  return (
    <div className="relative inline-flex flex-shrink-0 select-none items-center justify-center">
      {hasValidUrl ? (
        <img
          src={avatarUrl!}
          alt={displayName}
          onError={() => setImageError(true)}
          className={`rounded-full object-cover ring-1 ring-white/10 ${sizeClasses[size]} ${className}`}
          loading="lazy"
        />
      ) : (
        <div
          className={`flex items-center justify-center rounded-full bg-gradient-to-br ${gradientClass} text-white font-bold shadow-inner ring-1 ring-white/15 ${sizeClasses[size]} ${className}`}
        >
          <span>{initials}</span>
        </div>
      )}

      {/* Online / Banned status dot */}
      {showStatusDot && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-zinc-950 ${
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"
          } ${
            user?.status === "banned"
              ? "bg-rose-500"
              : user?.status === "suspended"
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
        />
      )}
    </div>
  );
};
