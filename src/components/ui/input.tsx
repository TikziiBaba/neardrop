import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:border-sky-500 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
