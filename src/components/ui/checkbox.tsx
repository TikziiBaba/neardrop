"use client";

import React from "react";
import { Check } from "lucide-react";
import { SoundManager } from "@/lib/utils/sound-effects";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
  ariaLabel?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  onChange,
  disabled = false,
  className = "",
  size = "default",
  ariaLabel = "Select item",
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    const next = !checked;
    SoundManager.play("click");
    onCheckedChange?.(next);
    if (onChange) {
      const syntheticEvent = {
        target: { checked: next },
        currentTarget: { checked: next },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  };

  const sizeStyles = {
    sm: "h-4 w-4 rounded-md",
    default: "h-5 w-5 rounded-lg",
    lg: "h-6 w-6 rounded-xl",
  }[size];

  const iconSizes = {
    sm: "h-3 w-3 stroke-[3]",
    default: "h-3.5 w-3.5 stroke-[2.5]",
    lg: "h-4 w-4 stroke-[2.5]",
  }[size];

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center transition-all duration-200 select-none flex-shrink-0 cursor-pointer ${sizeStyles} ${
        checked
          ? "bg-gradient-to-tr from-sky-500 via-sky-400 to-blue-600 text-white shadow-lg shadow-sky-500/30 ring-1 ring-white/40 scale-[1.04]"
          : "bg-zinc-900/90 border border-zinc-700/80 hover:border-sky-400/60 hover:bg-zinc-800/90 hover:scale-105 shadow-inner"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
    >
      {/* Liquid specular edge */}
      <span className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/[0.08]" />

      {checked && (
        <Check className={`${iconSizes} text-white animate-in zoom-in-75 duration-150 drop-shadow-sm`} />
      )}
    </button>
  );
};
