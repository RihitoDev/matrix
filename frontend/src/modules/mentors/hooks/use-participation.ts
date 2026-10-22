"use client";

import { useQuery } from "@tanstack/react-query";
import { isApiError } from "@/shared/services/api-client";
import { getMentorOrientationTypes } from "@/modules/mentorship";
import { getMentorTechnicalAreas } from "../services/technical-areas.service";

export function useParticipation() {
  const query = useQuery({
    queryKey: ["mentors", "participation"],
    queryFn: async ({ signal }) => {
      const [areas, orientations] = await Promise.allSettled([
        getMentorTechnicalAreas(signal), getMentorOrientationTypes(signal),
      ]);
      const errors = [areas, orientations].filter((result) => result.status === "rejected");
      const failure = errors.find(({ reason }) => !isApiError(reason) || reason.response?.status !== 404);
      if (failure) throw failure.reason;
      if (errors.length > 0) return null;
      if (areas.status === "fulfilled" && orientations.status === "fulfilled") {
        return { areas: areas.value.map(({ name }) => name), orientations: orientations.value.map(({ name }) => name) };
      }
      return null;
    },
  });
  return { state: query.isFetching ? undefined : query.data, hasLoadError: query.isError, retry: () => { void query.refetch(); } };
}
