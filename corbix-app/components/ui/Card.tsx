import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-surface p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]",
        className,
      )}
      {...props}
    />
  );
}
