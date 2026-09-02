import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/80 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] hover:scale-[1.01] cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-white text-zinc-950 hover:bg-zinc-100 shadow-md shadow-black/10 ring-1 ring-white/30 font-semibold",
        primary:
          "bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25 ring-1 ring-white/30 font-semibold",
        destructive:
          "bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 hover:text-rose-200 font-semibold",
        outline:
          "border border-zinc-700/80 bg-zinc-900/70 hover:bg-zinc-800/90 hover:border-zinc-600 text-zinc-200 hover:text-white backdrop-blur-md shadow-sm font-medium",
        secondary:
          "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/50 shadow-sm font-medium",
        ghost:
          "hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-100 font-medium",
        glass:
          "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/15 backdrop-blur-xl shadow-md font-medium ring-1 ring-white/10",
        link:
          "text-sky-400 underline-offset-4 hover:underline font-medium p-0 h-auto",
      },
      size: {
        default: "h-11 rounded-2xl px-6 py-2.5 gap-2.5 text-sm",
        sm: "h-10 rounded-xl px-5 py-2 gap-2 text-xs font-semibold",
        lg: "h-13 rounded-2xl px-8 py-3.5 gap-3 text-base font-bold",
        pill: "h-10.5 rounded-full px-6 py-2.5 gap-2.5 text-xs font-semibold",
        icon: "h-10 w-10 rounded-xl p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
