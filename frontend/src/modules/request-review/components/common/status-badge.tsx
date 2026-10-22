import { Check, Clock, Eye, X } from "lucide-react";
import { cn } from "cn";
import { REVIEW_STATUS_LABELS } from "../../constants/request-review.constants";
import type { StatusBadgeProps } from "../../types/status-badge-props.types";

// Los estados se identifican por texto e icono sin fondos de color.
const STATUS_STYLES = {
  pending: { icon: Clock, className: "text-text-secondary" },
  in_review: { icon: Eye, className: "text-ink-soft" },
  approved: { icon: Check, className: "text-ink" },
  rejected: { icon: X, className: "text-danger" },
} as const;

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  const Icon = style?.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 py-1 text-[12.5px] font-semibold",
        style?.className ?? "border-border bg-surface text-ink",
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />}
      {REVIEW_STATUS_LABELS[status] ?? status}
    </span>
  );
}
