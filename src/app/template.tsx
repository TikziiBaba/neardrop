"use client";

import { motion, useReducedMotion } from "framer-motion";
import { easeApple } from "@/lib/motion";

// Her sayfa değişiminde içerik bulanıklıktan netleşerek gelir.
// Bitişte transform/filter temizlenir; aksi halde içerideki position:fixed öğeler (pencereler, alt menü) kayar.
export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { transform: "none", filter: "none" } }}
      transition={{ duration: 0.6, ease: easeApple }}
    >
      {children}
    </motion.div>
  );
}
