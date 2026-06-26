import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-lg border border-white/10 bg-surface px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/35",
        className,
      )}
      {...props}
    />
  );
}
