"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EDUCATION_FEEDBACK_MESSAGES } from "../constants/education-feedback.constants";
import { educationsService } from "../services/educations.service";
import type { EducationItem } from "../types/education-item.types";
import type { EducationsResult } from "../types/educations-result.types";

async function requestEducations(): Promise<EducationsResult> {
  try {
    const educations = await educationsService.getEducations();
    return { educations, error: null };
  } catch {
    return { educations: null, error: EDUCATION_FEEDBACK_MESSAGES.loadError };
  }
}

export function useEducations() {
  const [educations, setEducations] = useState<EducationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(false);

  const applyResult = useCallback((result: EducationsResult) => {
    if (result.educations) {
      setEducations(result.educations);
    }
    setError(result.error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const requestId = ++requestIdRef.current;
    void requestEducations().then((result) => {
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
    const result = await requestEducations();
    if (isMountedRef.current && requestId === requestIdRef.current) {
      applyResult(result);
    }
  }, [applyResult]);

  return { educations, isLoading, error, reload };
}
