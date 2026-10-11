"use client";

import { CheckCircle } from "lucide-react";
import type { OrientationTypeResponse } from "../../types/orientation-type-response.types";

type OrientationStepProps = {
  orientationTypes: OrientationTypeResponse[];
  selectedOrientationTypeIds: string[];
  onSelectionChange: (ids: string[]) => void;
};

export function OrientationStep({
  orientationTypes,
  selectedOrientationTypeIds,
  onSelectionChange,
}: OrientationStepProps) {
  const selectedCount = selectedOrientationTypeIds.length;
  const hasSelection = selectedCount > 0;

  const toggleOrientation = (id: string) => {
    const isSelected = selectedOrientationTypeIds.includes(id);

    if (isSelected) {
      onSelectionChange(
        selectedOrientationTypeIds.filter(
          (orientationId) => orientationId !== id,
        ),
      );
      return;
    }

    onSelectionChange([...selectedOrientationTypeIds, id]);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-semibold text-ink">
          Paso 3: Tipos de orientación
        </h2>

        <p className="mt-1 text-sm text-text-secondary">
          Selecciona los tipos de orientación que podrás brindar.
        </p>
      </div>

      <div className="rounded-md bg-surface-soft px-3 py-2 text-sm font-medium text-ink">
        {selectedCount} seleccionada{selectedCount === 1 ? "" : "s"}
      </div>

      {!hasSelection && (
        <p className="text-sm font-medium text-red-600" role="alert">
          Debe seleccionarse al menos un tipo de orientación para continuar
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {orientationTypes.map((orientation) => {
          const isSelected = selectedOrientationTypeIds.includes(
            orientation.id,
          );

          return (
            <button
              key={orientation.id}
              type="button"
              onClick={() => toggleOrientation(orientation.id)}
              className={[
                "flex w-full flex-col items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                isSelected
                  ? "border-red-600 bg-red-50"
                  : "border-border bg-slate-100 hover:border-slate-300",
              ].join(" ")}
              aria-pressed={isSelected}
            >
              <div className="flex w-full items-start justify-between">
                <span className="text-sm font-semibold text-ink">
                  {orientation.name}
                </span>

                <div
                  className={[
                    "flex h-5 w-5 items-center justify-center rounded border",
                    isSelected
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-slate-300 bg-white",
                  ].join(" ")}
                >
                  {isSelected && (
                    <CheckCircle
                      className="h-3.5 w-3.5"
                      strokeWidth={3}
                      aria-hidden
                    />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
