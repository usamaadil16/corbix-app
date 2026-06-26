import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "accent";
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        tone === "accent"
          ? "border-accent/40 bg-accent/15 text-accent"
          : "border-white/20 bg-white/5 text-muted",
        className,
      )}
      {...props}
    />
  );
}
