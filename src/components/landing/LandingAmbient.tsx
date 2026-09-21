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
      {/* Scroll progress — 2px Apple Blue line at viewport top */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left"
        style={{
          scaleX: reduceMotion ? 0 : progress,
          background: "var(--apple-blue, #0071e3)",
        }}
        aria-hidden
      />

      {/* Ambient background — very subtle, nearly invisible */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        {/* Clean base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f7] via-[#fafafa] to-[#f5f5f7]" />

        {/* Single soft hero aura — barely visible */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
          style={{
            background: "radial-gradient(ellipse at center, rgba(0, 113, 227, 0.06), transparent 70%)",
          }}
        />
      </div>
    </>
  );
};
