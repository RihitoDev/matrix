"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { PUBLISH_MESSAGES } from "../constants/vacancies.constants";
import { jobOffersService } from "../services/job-offers.service";
import type { CreateJobOfferPayload, PublishError } from "../types/job-offer.types";
import type { VacancyConditions } from "../types/vacancy-conditions.types";
import { getCurrentCompany } from "../utils/get-current-company";
import { toJobOfferPayload } from "../utils/to-job-offer-payload";
import { toPublishError } from "../utils/to-publish-error";
import { validateInformation, validateRequirements } from "../utils/validate-vacancy";

export type PublishStatus = "idle" | "submitting" | "success" | "error";

interface PublishVariables {
  companyId: string;
  payload: CreateJobOfferPayload;
}

function hasErrors(conditions: VacancyConditions): boolean {
  const found = { ...validateInformation(conditions), ...validateRequirements(conditions) };
  return Object.keys(found).length > 0;
}

export function usePublishJobOffer() {
  const [localError, setLocalError] = useState<PublishError | null>(null);
  const mutation = useMutation({
    mutationFn: ({ companyId, payload }: PublishVariables) => jobOffersService.publish(companyId, payload),
  });

  const submit = async (conditions: VacancyConditions): Promise<void> => {
    if (mutation.isPending) return;

    if (hasErrors(conditions)) {
      setLocalError({ kind: "validation", message: PUBLISH_MESSAGES.incompleteForm, details: [] });
      return;
    }

    const company = getCurrentCompany();
    if (!company.id) {
      setLocalError({ kind: "company", message: PUBLISH_MESSAGES.noCompany, details: [] });
      return;
    }

    setLocalError(null);
    try {
      await mutation.mutateAsync({ companyId: company.id, payload: toJobOfferPayload(conditions) });
    } catch {
      return;
    }
  };

  const reset = () => {
    setLocalError(null);
    mutation.reset();
  };

  const error = localError ?? (mutation.isError ? toPublishError(mutation.error) : null);
  const status: PublishStatus = mutation.isPending
    ? "submitting"
    : mutation.isSuccess
      ? "success"
      : error
        ? "error"
        : "idle";

  return {
    status,
    error,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    submit,
    reset,
  };
}
