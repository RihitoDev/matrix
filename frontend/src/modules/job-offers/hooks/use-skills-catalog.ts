"use client";

import { useQuery } from "@tanstack/react-query";
import { JOB_OFFERS_QUERY_KEYS } from "../constants/vacancies.constants";
import { jobOffersService } from "../services/job-offers.service";

export type SkillsCatalogStatus = "loading" | "ready" | "error";

export function useSkillsCatalog() {
  const query = useQuery({
    queryKey: JOB_OFFERS_QUERY_KEYS.skillCatalog,
    queryFn: jobOffersService.getSkillCatalog,
  });

  const status: SkillsCatalogStatus = query.isPending ? "loading" : query.isError ? "error" : "ready";

  return {
    skills: query.data ?? [],
    status,
    reload: () => {
      void query.refetch();
    },
  };
}
