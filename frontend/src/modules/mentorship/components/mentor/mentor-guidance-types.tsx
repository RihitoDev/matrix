"use client";

import { useState } from "react";
import { Compass } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

import type { OrientationTypeResponse } from "../../types/orientation-type-response.types";

type MentorGuidanceTypesProps = {
  orientationTypes: OrientationTypeResponse[];
};

export function MentorGuidanceTypes({
  orientationTypes,
}: MentorGuidanceTypesProps) {
  const [selectedGuidanceId, setSelectedGuidanceId] = useState(
    orientationTypes[0]?.id,
  );

  if (orientationTypes.length === 0) {
    return (
      <Card className="gap-0 overflow-visible rounded-xl border border-border bg-white py-0 text-base ring-0">
        <CardHeader className="px-6 pt-6">
          <CardTitle
            role="heading"
            aria-level={2}
            className="flex items-center gap-2 text-xl font-bold text-ink"
          >
            <Compass
              className="size-5 shrink-0 text-accent"
              aria-hidden="true"
            />
            Tipos de orientación
          </CardTitle>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-4">
          <p className="text-text-secondary">
            Este mentor todavía no registró tipos de orientación.
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedGuidance =
    orientationTypes.find((guidance) => guidance.id === selectedGuidanceId) ??
    orientationTypes[0];

  return (
    <Card className="gap-0 overflow-visible rounded-xl border border-border bg-white py-0 text-base ring-0">
      <CardHeader className="px-6 pt-6">
        <CardTitle
          role="heading"
          aria-level={2}
          className="flex items-center gap-2 text-xl font-bold text-ink"
        >
          <Compass
            className="size-5 shrink-0 text-accent"
            aria-hidden="true"
          />
          Tipos de orientación
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-4">
        <ToggleGroup
          multiple={false}
          value={[String(selectedGuidance.id)]}
          onValueChange={(values) => {
            const nextGuidance = orientationTypes.find(
              (guidance) => String(guidance.id) === values[0],
            );

            if (nextGuidance) {
              setSelectedGuidanceId(nextGuidance.id);
            }
          }}
          variant="outline"
          aria-label="Tipos de orientación"
          className="flex w-full flex-wrap justify-start gap-2"
        >
          {orientationTypes.map((guidance) => (
            <ToggleGroupItem
              key={guidance.id}
              value={String(guidance.id)}
              className="h-auto min-w-0 max-w-full cursor-pointer whitespace-normal [overflow-wrap:anywhere] rounded-lg border-border bg-white px-4 py-2 text-sm font-semibold text-text-secondary shadow-sm hover:border-accent hover:bg-surface-soft focus-visible:border-accent focus-visible:ring-accent/30 aria-pressed:border-accent aria-pressed:bg-interaction aria-pressed:text-ink"
            >
              {guidance.name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {selectedGuidance.description && (
          <div className="mt-5 rounded-lg bg-surface-soft p-4">
            <p className="whitespace-pre-line [overflow-wrap:anywhere] text-sm leading-6 text-ink">
              {selectedGuidance.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
