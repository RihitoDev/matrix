"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getMentorOrientationTypes } from "@/modules/mentorship/services/orientation-type.service";
import { getMentorTechnicalAreas } from "../services/technical-areas.service";
import { ParticipationEmptyState } from "../components/participation/participation-empty-state";
import { ParticipationLoading } from "../components/participation/participation-loading";
import { ParticipationOverview } from "../components/participation/participation-overview";

export function ParticipationView() {
  const [state, setState] = useState<
    { areas: string[]; orientations: string[] } | null | undefined
  >(undefined);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    Promise.allSettled([
      getMentorTechnicalAreas(controller.signal),
      getMentorOrientationTypes(controller.signal),
    ]).then(([areas, orientations]) => {
      if (controller.signal.aborted) return;

      const errors = [areas, orientations].filter(
        (result) => result.status === "rejected",
      );
      if (
        errors.some(({ reason }) =>
          !axios.isAxiosError(reason) || reason.response?.status !== 404,
        )
      ) {
        setHasLoadError(true);
      } else if (errors.length > 0) {
        setState(null);
      } else if (
        areas.status === "fulfilled" && orientations.status === "fulfilled"
      ) {
        setState({
          areas: areas.value.map((area) => area.name),
          orientations: orientations.value.map((orientation) => orientation.name),
        });
      }
    });

    return () => controller.abort();
  }, [loadAttempt]);

  if (hasLoadError) {
    return (
      <main className="min-h-full bg-surface-soft px-4 py-6 sm:py-8">
        <Alert variant="destructive" className="mx-auto max-w-5xl">
          <p>No se pudo cargar tu participación como mentor.</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setHasLoadError(false);
              setState(undefined);
              setLoadAttempt((attempt) => attempt + 1);
            }}
          >
            Reintentar
          </Button>
        </Alert>
      </main>
    );
  }

  if (state === undefined) {
    return <ParticipationLoading />;
  }

  if (!state) {
    return <ParticipationEmptyState />;
  }

  return (
    <ParticipationOverview
      areas={state.areas}
      orientations={state.orientations}
    />
  );
}
