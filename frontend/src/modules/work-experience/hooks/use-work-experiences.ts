"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WORK_EXPERIENCE_FEEDBACK_MESSAGES } from "../config/work-experience-feedback.config";
import { workExperienceService } from "../services/work-experience.service";
import type { WorkExperienceItem } from "../types/work-experience-item.types";
import type { WorkExperiencesResult } from "../types/work-experiences-result.types";

async function requestWorkExperiences(): Promise<WorkExperiencesResult> {
  try {
    const experiences = await workExperienceService.getWorkExperiences();
    return { experiences, error: null };
  } catch {
    return { experiences: null, error: WORK_EXPERIENCE_FEEDBACK_MESSAGES.loadError };
  }
}

export function useWorkExperiences() {
  const [experiences, setExperiences] = useState<WorkExperienceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(false);

  const applyResult = useCallback((result: WorkExperiencesResult) => {
    if (result.experiences) {
      setExperiences(result.experiences);
    }
    setError(result.error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const requestId = ++requestIdRef.current;
    void requestWorkExperiences().then((result) => {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        applyResult(result);
      }
    });
    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [applyResult]);

  const reload = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    const result = await requestWorkExperiences();
    if (isMountedRef.current && requestId === requestIdRef.current) {
      applyResult(result);
    }
  }, [applyResult]);

  return { experiences, isLoading, error, reload };
}
