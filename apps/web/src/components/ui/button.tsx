import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm shadow-white/10 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
        primary:
          "bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-md shadow-sky-500/20",
        destructive:
          "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20",
        outline:
          "border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-200 hover:text-white backdrop-blur-sm",
        secondary:
          "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
        ghost:
          "hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100",
        link:
          "text-sky-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-6 text-base",
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
