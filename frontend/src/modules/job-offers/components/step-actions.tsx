import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface StepActionsProps {
  secondaryLabel: string;
  primaryLabel: ReactNode;
  onSecondary: () => void;
  onPrimary: () => void;
  isBusy?: boolean;
  className?: string;
}

export function StepActions({
  secondaryLabel,
  primaryLabel,
  onSecondary,
  onPrimary,
  isBusy = false,
  className = "border-t border-border px-6 py-4",
}: StepActionsProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={onSecondary}
        disabled={isBusy}
        className="h-auto px-6 py-2.5 text-sm font-semibold text-ink"
      >
        {secondaryLabel}
      </Button>
      <Button
        type="button"
        onClick={onPrimary}
        disabled={isBusy}
        aria-busy={isBusy}
        className="h-auto bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover"
      >
        {primaryLabel}
      </Button>
    </div>
  );
}
