import { cn } from "@/lib/utils";
import type { RadarCardProps } from "../types/radar-profile-components.types";

export function RadarCard({ as: Tag = "section", className, children, ...props }: RadarCardProps) {
  return (
    <Tag
      className={cn(
        "min-w-0 rounded-2xl border border-border bg-surface font-sans text-sm text-ink shadow-[0_1px_2px_rgba(11,31,46,0.04),0_8px_24px_-12px_rgba(11,31,46,0.12)]",
        className,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
