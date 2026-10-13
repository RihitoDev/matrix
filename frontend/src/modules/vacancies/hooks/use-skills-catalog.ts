"use client";

import { useCallback, useEffect, useState } from "react";
import { skillsService } from "@/modules/skills/services/skills.service";
import type { SkillItem } from "@/modules/skills/types/skill-item.types";

export type SkillsCatalogStatus = "loading" | "ready" | "error";

/** Catálogo cerrado de tecnologías verificadas (GET /skills): evita errores de tipeo. */
export function useSkillsCatalog() {
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [status, setStatus] = useState<SkillsCatalogStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isActive = true;

    skillsService
      .getCatalog()
      .then((catalog) => {
        if (!isActive) return;
        setSkills(catalog);
        setStatus("ready");
      })
      .catch(() => {
        if (isActive) setStatus("error");
      });

    return () => {
      isActive = false;
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setStatus("loading");
    setAttempt((current) => current + 1);
  }, []);

  return { skills, status, reload };
}
