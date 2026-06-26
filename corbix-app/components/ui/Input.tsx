import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-white/10 bg-surface px-3 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/35",
        className,
      )}
      {...props}
    />
  );
}
