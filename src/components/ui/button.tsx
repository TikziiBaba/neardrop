import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#09090b] text-white hover:bg-black hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-lg hover:shadow-black/25 shadow-sm font-semibold rounded-full",
        primary:
          "bg-[#0071e3] hover:bg-[#0077ed] text-white hover:-translate-y-0.5 hover:scale-[1.02] shadow-md shadow-[#0071e3]/25 hover:shadow-xl hover:shadow-[#0071e3]/40 font-semibold rounded-full",
        destructive:
          "bg-[#dc2626]/10 text-[#dc2626] border border-[#dc2626]/25 hover:bg-[#dc2626] hover:text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/25 font-semibold",
        outline:
          "border border-[#d4d4d8] bg-white hover:border-[#0071e3] hover:text-[#0071e3] hover:bg-blue-50/50 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/10 text-[#09090b] shadow-sm font-semibold",
        secondary:
          "bg-[#f0f4f9] hover:bg-[#e2eaf4] text-[#09090b] border border-[#e4e4e7] hover:border-[#d4d4d8] hover:-translate-y-0.5 hover:shadow-md shadow-sm font-semibold",
        ghost:
          "hover:bg-[#0071e3]/10 text-[#27272a] hover:text-[#0071e3] hover:scale-[1.02] font-semibold",
        glass:
          "bg-white/80 hover:bg-white text-[#09090b] border border-[#d4d4d8] hover:border-[#0071e3]/60 hover:text-[#0071e3] backdrop-blur-xl shadow-sm hover:shadow-lg hover:shadow-blue-500/15 hover:-translate-y-0.5 font-semibold",
        link:
          "text-[#0071e3] hover:text-[#005bb5] underline-offset-4 hover:underline font-semibold p-0 h-auto",
      },
      size: {
        default: "h-11 rounded-full px-6 py-2.5 gap-2.5 text-sm",
        sm: "h-9 rounded-full px-4 py-2 gap-2 text-[13px]",
        lg: "h-12 rounded-full px-8 py-3 gap-3 text-base",
        pill: "h-9 rounded-full px-5 py-2 gap-2 text-[13px]",
        icon: "h-10 w-10 rounded-full p-0",
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
