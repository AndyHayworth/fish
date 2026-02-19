"use client";

import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            primary:
              "bg-[#1B6B4A] text-white hover:bg-[#134e37] focus:ring-[#1B6B4A]",
            secondary:
              "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400",
            ghost:
              "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400",
            danger:
              "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
          }[variant],
          {
            sm: "px-3 py-1.5 text-sm gap-1.5",
            md: "px-4 py-2.5 text-sm gap-2",
            lg: "px-6 py-3 text-base gap-2",
          }[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
