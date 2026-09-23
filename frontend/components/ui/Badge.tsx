"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "indigo" | "outline" | "emerald" | "rose" | "amber";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-graphite-800 text-graphite-300 border-graphite-700",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    rose: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    indigo: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    outline: "bg-transparent text-graphite-300 border-graphite-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
