import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "yellow" | "red" | "blue" | "gray" | "orange";
  className?: string;
}

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          green: "bg-green-100 text-green-800",
          yellow: "bg-yellow-100 text-yellow-800",
          red: "bg-red-100 text-red-800",
          blue: "bg-blue-100 text-blue-800",
          gray: "bg-gray-100 text-gray-700",
          orange: "bg-orange-100 text-orange-800",
        }[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
