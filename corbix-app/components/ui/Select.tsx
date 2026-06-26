import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-white/10 bg-surface px-3 text-sm text-white focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/35",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
