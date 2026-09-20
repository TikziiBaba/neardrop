"use client";

import React from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

export const LandingAmbient: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 34,
    restDelta: 0.001,
  });

  return (
    <>
      {/* Apple-style scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left"
        style={{
          scaleX: reduceMotion ? 0 : progress,
          background: "var(--apple-blue, #0071e3)",
        }}
        aria-hidden
      />

      {/* Apple Spatial Ambient Canvas — rich multi-layered lighting & micro-texture */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        {/* Soft base gradient — subtle high-end tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f9fbfe] via-[#edf2f8] to-[#f4f7fa]" />

        {/* Tactile micro-dot grid for depth & hardware feel */}
        <div 
          className="absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.08) 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px",
            maskImage: "radial-gradient(ellipse 85% 85% at 50% 45%, black 40%, transparent 95%)",
            WebkitMaskImage: "radial-gradient(ellipse 85% 85% at 50% 45%, black 40%, transparent 95%)",
          }}
        />

        {/* Aura 1: Top Hero Apple Blue Radial Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(0,113,227,0.16),rgba(0,113,227,0.04)_55%,transparent_75%)] blur-2xl" />

        {/* Aura 2: Top Right Violet/Indigo Ambient Accent */}
        <div className="absolute top-10 right-[-10%] w-[600px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.11),transparent_65%)] blur-3xl" />

        {/* Aura 3: Mid-Left Cyan/Sky Accent */}
        <div className="absolute top-[40%] left-[-8%] w-[650px] h-[550px] bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.10),transparent_65%)] blur-3xl" />

        {/* Aura 4: Bottom Emerald Security Glow */}
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[450px] bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent_65%)] blur-3xl" />

        {/* Subtle horizontal gradient separator line for hero */}
        <div className="absolute top-[520px] left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/15 to-transparent" />
      </div>
    </>
  );
};
