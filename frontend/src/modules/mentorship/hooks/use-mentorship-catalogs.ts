"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrientationTypes } from "../services/orientation-type.service";
import { getTechnicalAreas } from "../services/technical-area.service";

export function useMentorshipCatalogs() {
  const technicalAreasQuery = useQuery({
    queryKey: ["mentorship", "technical-areas"],
    queryFn: ({ signal }) => getTechnicalAreas(signal),
  });

  const orientationTypesQuery = useQuery({
    queryKey: ["mentorship", "orientation-types"],
    queryFn: ({ signal }) => getOrientationTypes(signal),
  });

  return {
    technicalAreas: technicalAreasQuery.data ?? [],
    isTechnicalAreasLoading: technicalAreasQuery.isLoading,
    isTechnicalAreasError: technicalAreasQuery.isError,
    retryTechnicalAreas: () => {
      void technicalAreasQuery.refetch();
    },
    orientationTypes: orientationTypesQuery.data ?? [],
    isOrientationTypesLoading: orientationTypesQuery.isLoading,
    isOrientationTypesError: orientationTypesQuery.isError,
    retryOrientationTypes: () => {
      void orientationTypesQuery.refetch();
    },
  };
}
