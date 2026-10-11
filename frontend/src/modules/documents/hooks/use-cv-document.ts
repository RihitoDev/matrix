"use client";

import { useEffect, useRef, useState } from "react";
import { CV_ERROR_MESSAGES } from "../constants/cv-error-messages.constants";
import { documentsService } from "../services/documents.service";
import type { SavedCv } from "../types/saved-cv.types";
import { getCvErrorMessage } from "../utils/get-cv-error-message";

export function useCvDocument() {
  const [savedCv, setSavedCv] = useState<SavedCv | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const hasLocalChangeRef = useRef(false);

  useEffect(() => {
    let isActive = true;

    async function loadSavedCv() {
      try {
        const cv = await documentsService.getCv();
        if (isActive && !hasLocalChangeRef.current) {
          setSavedCv(cv);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(getCvErrorMessage(error, CV_ERROR_MESSAGES.load));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadSavedCv();

    return () => {
      isActive = false;
    };
  }, []);

  async function uploadCv(file: File): Promise<void> {
    const cv = await documentsService.uploadCv(file);
    hasLocalChangeRef.current = true;
    setLoadError(null);
    setSavedCv(cv);
  }

  async function deleteCv(): Promise<void> {
    await documentsService.deleteCv();
    hasLocalChangeRef.current = true;
    setSavedCv(null);
  }

  return { savedCv, isLoading, loadError, uploadCv, deleteCv };
}
