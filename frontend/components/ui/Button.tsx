"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "emerald" | "default";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-graphite-900 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500 shadow-md shadow-indigo-600/20",
    default: "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-500 shadow-md shadow-indigo-600/20",
    secondary: "bg-graphite-800 text-graphite-100 hover:bg-graphite-700 border border-graphite-700 focus:ring-graphite-600",
    outline: "border border-graphite-700 bg-transparent text-graphite-200 hover:bg-graphite-800/80 hover:text-white focus:ring-graphite-600",
    ghost: "bg-transparent text-graphite-300 hover:bg-graphite-800/60 hover:text-white focus:ring-graphite-600",
    danger: "bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500 shadow-md shadow-rose-600/20",
    emerald: "bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-500 shadow-md shadow-emerald-600/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
