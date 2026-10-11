"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CERTIFICATION_FEEDBACK_MESSAGES } from "../config/certification-feedback.config";
import { certificationsService } from "../services/certifications.service";
import type { Certification } from "../types/certification.types";
import type { CertificationsResult } from "../types/certifications-result.types";
import { sortCertifications } from "../utils/sort-certifications";

async function requestCertifications(): Promise<CertificationsResult> {
  try {
    const certifications = await certificationsService.getCertifications();
    return { certifications: sortCertifications(certifications), error: null };
  } catch {
    return { certifications: null, error: CERTIFICATION_FEEDBACK_MESSAGES.loadError };
  }
}

export function useCertifications() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  function applyResult(result: CertificationsResult) {
    if (result.certifications) {
      setCertifications(result.certifications);
    }
    setError(result.error);
    setIsLoading(false);
  }

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    async function loadCertifications() {
      const result = await requestCertifications();
      if (requestId === requestIdRef.current) {
        applyResult(result);
      }
    }

    void loadCertifications();

    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  const reload = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    const result = await requestCertifications();
    if (requestId === requestIdRef.current) {
      applyResult(result);
    }
  }, []);

  return { certifications, isLoading, error, reload };
}
