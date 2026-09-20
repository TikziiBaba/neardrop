import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#f5f5f7] text-[#1d1d1f] border border-[#e8e8ed]",
        secondary:
          "bg-[#f5f5f7] text-[#6e6e73] border border-[#e8e8ed]",
        success:
          "bg-[#34c759]/8 text-[#34c759]",
        warning:
          "bg-[#ff9500]/8 text-[#ff9500]",
        destructive:
          "bg-[#ff3b30]/8 text-[#ff3b30]",
        sky:
          "bg-[#0071e3]/8 text-[#0071e3]",
        outline: "border border-[#d2d2d7] text-[#6e6e73]",
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
