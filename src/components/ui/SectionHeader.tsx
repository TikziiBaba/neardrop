"use client";

import React, { useEffect, useRef } from "react";
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
  icon: Icon,
  badgeContent,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Star particles animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 960);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 320);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 960;
      height = canvas.height = canvas.parentElement.clientHeight || 320;
    };

    window.addEventListener("resize", handleResize);

    // Create 45 subtle twinkling star particles
    const stars = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.75,
      radius: Math.random() * 1.4 + 0.6,
      baseAlpha: Math.random() * 0.5 + 0.3,
      alpha: Math.random() * 0.5 + 0.3,
      speed: Math.random() * 0.02 + 0.008,
      phase: Math.random() * Math.PI * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      stars.forEach((star) => {
        star.phase += star.speed;
        star.alpha = star.baseAlpha + Math.sin(star.phase) * 0.35;
        const currentAlpha = Math.max(0.1, Math.min(1, star.alpha));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = "#38bdf8";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`container mx-auto flex flex-col items-center justify-center pt-6 pb-8 select-none ${className}`}>
      {/* 1. Dome Horizon Arc Container with Blue Atmospheric Gradient & Grid */}
      <div className="relative h-72 sm:h-80 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent_90%)] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_center,rgb(14_165_233),transparent_55%)] before:opacity-75 after:absolute after:border-2 after:-left-1/2 after:top-1/2 after:aspect-[1/1.8] after:w-[200%] after:rounded-[50%] after:border-t after:border-sky-400/50 after:bg-zinc-950">
        {/* Subtle Geometric Grid Overlay */}
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#ffffff18_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:70px_70px]" />

        {/* Twinkling Star Particles Canvas */}
        <div className="absolute inset-x-0 top-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]">
          <canvas
            ref={canvasRef}
            className="w-full h-full block"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* 2. Circular Peak Badge (Overlapping the Horizon Arc) */}
      <div className="mx-auto -mt-48 sm:-mt-52 w-full max-w-2xl relative z-10 flex flex-col items-center">
        <div className="bg-white border-solid border-4 border-zinc-950 p-4 w-24 h-24 sm:w-28 sm:h-28 mx-auto grid place-content-center rounded-full shadow-[0_0_40px_rgba(56,189,248,0.5),0_8px_20px_rgba(0,0,0,0.7)] transition-transform duration-300 hover:scale-105">
          {badgeContent ? (
            badgeContent
          ) : Icon ? (
            <Icon className="h-10 w-10 sm:h-12 sm:w-12 text-neutral-900" />
          ) : (
            /* Default 4-Point Sparkle Icon matching exact SVG path */
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="text-neutral-900 h-10 w-10 sm:h-12 sm:w-12"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      {/* 3. Heading & Subtitle Article */}
      <article className="pt-4 w-full max-w-3xl mx-auto block text-center z-10 relative space-y-2.5">
        {label && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/25 bg-sky-500/10 px-3.5 py-1 text-[11px] font-semibold text-sky-300 uppercase tracking-widest backdrop-blur-md mb-1">
            <span>{label}</span>
          </div>
        )}

        <h2 className="scroll-m-20 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white py-1">
          {title}
        </h2>

        {subtitle && (
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed px-4">
            {subtitle}
          </p>
        )}
      </article>
    </div>
  );
};
