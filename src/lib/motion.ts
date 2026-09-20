import type { Transition, Variants } from "framer-motion";

export const easeApple: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 28,
};

export const springSoft: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 26,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.07, duration: 0.65, ease: easeApple },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.05, duration: 0.5, ease: easeApple },
  }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.55, ease: easeApple },
  }),
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

export const infiniteFloat = (delay = 0, duration = 5) => ({
  y: [0, -10, 0],
  transition: { repeat: Infinity, duration, ease: "easeInOut" as const, delay },
});
