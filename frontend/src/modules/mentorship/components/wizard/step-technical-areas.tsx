"use client";

import type { TechnicalAreaResponse } from "../../types/technical-area-response.types";
import { TechnicalAreaCard } from "./technical-area-card";

type StepTechnicalAreasProps = {
  technicalAreas: TechnicalAreaResponse[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export function StepTechnicalAreas({
  technicalAreas,
  selectedIds,
  onToggle,
}: StepTechnicalAreasProps) {
  const selectedCount = selectedIds.length;
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-semibold text-ink">
          Paso 2: Áreas técnicas
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          Selecciona las áreas en las que puedes brindar orientación.
        </p>
      </div>

      <div className="rounded-md bg-surface-soft px-3 py-2 text-sm font-medium text-ink">
        {selectedCount} seleccionada{selectedCount === 1 ? "" : "s"}
      </div>

      {!hasSelection && (
        <p className="text-sm font-medium text-red-600" role="alert">
          Debe seleccionarse al menos un área para continuar
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {technicalAreas.map((area) => (
          <TechnicalAreaCard
            key={area.id}
            area={area}
            isSelected={selectedIds.includes(area.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
