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
    <div className={`flex items-center justify-between ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={onSecondary}
        disabled={isBusy}
        className="h-auto px-6 py-2.5 text-sm font-semibold text-gray-700"
      >
        {secondaryLabel}
      </Button>
      <Button
        type="button"
        onClick={onPrimary}
        disabled={isBusy}
        aria-busy={isBusy}
        className="h-auto bg-[#E50000] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
      >
        {primaryLabel}
      </Button>
    </div>
  );
}
