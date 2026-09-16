import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-extrabold rounded-full transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none focus:outline-none";

    const variants = {
      primary:
        "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/35 hover:-translate-y-0.5",
      secondary:
        "bg-white/90 hover:bg-white text-pink-700 border border-pink-200 hover:border-pink-300 shadow-sm hover:shadow hover:-translate-y-0.5",
      outline:
        "border-2 border-pink-400 text-pink-700 hover:bg-pink-50",
      ghost:
        "text-pink-700 hover:bg-pink-100/50",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-5 py-2.5 text-sm gap-2",
      lg: "px-7 py-3.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
