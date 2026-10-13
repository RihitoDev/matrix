"use client";

import { useEffect, useState } from 'react';
import { EDUCATION_INSTITUTION_TEXTS } from '../constants/education-institutions.constants';
import { educationsService } from '../services/educations.service';
import type { EducationInstitution } from '../types/education-institution.types';

export function useEducationInstitutions() {
  const [institutions, setInstitutions] = useState<EducationInstitution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    void educationsService.getInstitutions().then((result) => {
      if (!active) return;
      setInstitutions(result);
      setError(null);
      setIsLoading(false);
    }).catch(() => {
      if (!active) return;
      setInstitutions([]);
      setError(EDUCATION_INSTITUTION_TEXTS.loadError);
      setIsLoading(false);
    });
    return () => { active = false; };
  }, [attempt]);

  const reload = () => {
    setIsLoading(true);
    setError(null);
    setAttempt((current) => current + 1);
  };

  return { institutions, isLoading, error, reload };
}
