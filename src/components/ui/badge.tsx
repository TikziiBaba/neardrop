import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-800 text-zinc-100 border border-zinc-700/60",
        secondary:
          "bg-zinc-800/80 text-zinc-300 border border-zinc-700/50",
        success:
          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/20",
        sky:
          "bg-blue-500/10 text-blue-400 border border-blue-500/20",
        outline: "border border-zinc-700 text-zinc-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
