"use client";

import { useCallback, useRef, useState } from "react";
import { PUBLISH_MESSAGES } from "../constants/vacancies.constants";
import { jobOffersService } from "../services/job-offers.service";
import type { PublishError } from "../types/job-offer.types";
import { getCurrentCompany } from "../utils/get-current-company";
import { toJobOfferPayload } from "../utils/to-job-offer-payload";
import { toPublishError } from "../utils/to-publish-error";
import { validateInformation, validateRequirements } from "../utils/validate-vacancy";
import type { VacancyConditions } from "./use-job-offer-form";

export type PublishStatus = "idle" | "submitting" | "success" | "error";

function hasErrors(conditions: VacancyConditions): boolean {
  const found = { ...validateInformation(conditions), ...validateRequirements(conditions) };
  return Object.keys(found).length > 0;
}

export function usePublishJobOffer() {
  const [status, setStatus] = useState<PublishStatus>("idle");
  const [error, setError] = useState<PublishError | null>(null);
  const isSubmittingRef = useRef(false);

  const fail = useCallback((publishError: PublishError) => {
    setError(publishError);
    setStatus("error");
  }, []);

  const submit = useCallback(
    async (conditions: VacancyConditions) => {
      // Evita peticiones duplicadas por doble clic.
      if (isSubmittingRef.current) return;

      if (hasErrors(conditions)) {
        fail({ kind: "validation", message: PUBLISH_MESSAGES.incompleteForm, details: [] });
        return;
      }

      const company = getCurrentCompany();
      if (!company.id) {
        fail({ kind: "company", message: PUBLISH_MESSAGES.noCompany, details: [] });
        return;
      }

      isSubmittingRef.current = true;
      setError(null);
      setStatus("submitting");

      try {
        await jobOffersService.publish(company.id, toJobOfferPayload(conditions));
        setStatus("success");
      } catch (publishError) {
        fail(toPublishError(publishError));
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [fail],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    status,
    error,
    isSubmitting: status === "submitting",
    isSuccess: status === "success",
    submit,
    reset,
  };
}
