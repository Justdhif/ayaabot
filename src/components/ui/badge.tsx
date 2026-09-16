import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "pink" | "online" | "outline";
}

export function Badge({
  className,
  variant = "pink",
  ...props
}: BadgeProps) {
  const variants = {
    pink: "bg-pink-100/70 text-pink-800 border-pink-200/80 shadow-xs",
    online: "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs",
    outline: "text-pink-800 border-pink-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-colors whitespace-nowrap shrink-0",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
