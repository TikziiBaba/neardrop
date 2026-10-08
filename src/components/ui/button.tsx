import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Tüm varyantlar aynı davranır: renk değişimi + basınca hafif küçülme. Zıplama/büyüme yok.
  "inline-flex items-center justify-center whitespace-nowrap font-semibold tracking-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none",
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/85",
        primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
        destructive: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger hover:text-white",
        outline: "border border-border-strong bg-transparent text-foreground hover:bg-surface-secondary",
        secondary: "bg-surface-secondary text-foreground border border-border hover:bg-surface-tertiary",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-surface-secondary",
        glass: "bg-surface/80 text-foreground border border-border backdrop-blur-xl hover:bg-surface-secondary hover:border-border-strong",
        link: "text-accent-text underline-offset-4 hover:underline p-0 h-auto",
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
