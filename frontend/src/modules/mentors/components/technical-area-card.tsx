import { Check } from "lucide-react";
import type { TechnicalAreaResponse } from "@/modules/mentorship/types/technical-area-response.types";

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
          ? "border-[#DC2626] bg-[#FEE2E2]"
          : "border-gray-200 bg-[#F3F4F6]"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-white ${
          isSelected
            ? "border-[#DC2626] bg-[#DC2626]"
            : "border-gray-400 bg-white"
        }`}
      >
        {isSelected && <Check size={14} />}
      </span>
      <span>
        <span className="block font-medium">{area.name}</span>
        {area.description && (
          <span className="block text-xs text-gray-500">
            {area.description}
          </span>
        )}
      </span>
    </button>
  );
}
