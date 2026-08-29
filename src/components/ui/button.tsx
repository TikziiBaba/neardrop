import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/80 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-white text-zinc-950 hover:bg-zinc-100 shadow-sm shadow-black/10 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-semibold",
        primary:
          "bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/25 border border-sky-400/30 font-semibold",
        destructive:
          "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-medium",
        outline:
          "border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-200 hover:text-white backdrop-blur-md font-medium",
        secondary:
          "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 font-medium",
        ghost:
          "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100 font-medium",
        glass:
          "bg-white/10 hover:bg-white/15 text-white border border-white/10 backdrop-blur-xl shadow-sm font-medium",
        link:
          "text-sky-400 underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8.5 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-6 text-sm sm:text-base font-semibold",
        icon: "h-10 w-10 p-0",
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
