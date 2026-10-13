"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RefreshButtonProps } from "../types/refresh-button-props.types";

export function RefreshButton({ label = "actualizar", onClick, isRefreshing = false }: RefreshButtonProps) {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleClick = () => {
    if (!onClick) return;
    setIsSpinning(true);
    onClick();
  };

  const handleAnimationIteration = () => {
    if (!isRefreshing) setIsSpinning(false);
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isRefreshing}
      className="h-auto gap-2 rounded-md bg-ink px-5 py-2.5 text-base font-semibold text-surface hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-70"
    >
      <RefreshCw
        data-testid="refresh-icon"
        onAnimationIteration={handleAnimationIteration}
        className={`size-5 ${isSpinning || isRefreshing ? "animate-spin" : ""}`}
        strokeWidth={1.5}
        aria-hidden="true"
      />
      {label}
    </Button>
  );
}
