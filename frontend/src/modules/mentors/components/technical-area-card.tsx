import { Check } from "lucide-react";
import type { TechnicalAreaResponse } from "@/modules/mentorship";

type TechnicalAreaCardProps = {
  area: TechnicalAreaResponse;
  isSelected: boolean;
  onToggle: (id: string) => void;
};

export function TechnicalAreaCard({
  area,
  isSelected,
  onToggle,
}: TechnicalAreaCardProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isSelected}
      onClick={() => onToggle(area.id)}
      className={`flex items-center gap-3 rounded-lg border p-4 text-left transition ${
        isSelected
          ? "border-accent bg-interaction"
          : "border-border bg-surface-soft"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-white ${
          isSelected
            ? "border-accent bg-accent"
            : "border-border-strong bg-white"
        }`}
      >
        {isSelected && <Check size={14} />}
      </span>
      <span>
        <span className="block font-medium">{area.name}</span>
        {area.description && (
          <span className="block text-xs text-text-secondary">
            {area.description}
          </span>
        )}
      </span>
    </button>
  );
}
