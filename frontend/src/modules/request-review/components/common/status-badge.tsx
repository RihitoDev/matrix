import { Check, Clock, Eye, X } from "lucide-react";
import { cn } from "cn";
import { REVIEW_STATUS_LABELS } from "../../constants/request-review.constants";
import type { StatusBadgeProps } from "../../types/status-badge-props.types";

// Estados según DESIGN.md sección 4: se distinguen por forma e icono además del color
const STATUS_STYLES = {
  pending: { icon: Clock, className: "border-gold bg-surface text-ink" },
  in_review: { icon: Eye, className: "border-ink bg-surface-soft text-ink" },
  approved: { icon: Check, className: "border-ink bg-ink text-surface" },
  rejected: { icon: X, className: "border-interaction bg-interaction text-accent" },
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  const Icon = style?.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12.5px] font-semibold",
        style?.className ?? "border-border bg-surface text-ink",
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />}
      {REVIEW_STATUS_LABELS[status] ?? status}
    </span>
  );
}
