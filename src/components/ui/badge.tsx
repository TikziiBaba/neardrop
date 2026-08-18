import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
        secondary:
          "border-transparent bg-zinc-800/60 text-zinc-300",
        success:
          "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        warning:
          "border border-amber-500/20 bg-amber-500/10 text-amber-400",
        destructive:
          "border border-rose-500/20 bg-rose-500/10 text-rose-400",
        sky:
          "border border-sky-500/20 bg-sky-500/10 text-sky-400",
        outline: "border border-zinc-700 text-zinc-300",
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
