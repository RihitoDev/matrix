"use client";

import { useState } from "react";
import { CERTIFICATION_FEEDBACK_MESSAGES } from "../config/certification-feedback.config";
import { certificationsService } from "../services/certifications.service";
import type { Certification } from "../types/certification.types";
import type { CreateCertificationDto } from "../types/create-certification-dto.types";
import type { UpdateCertificationDto } from "../types/update-certification-dto.types";
import type { CertificationMutationMessages } from "../types/certification-mutation-messages.types";
import type { CertificationMutationOptions } from "../types/certification-mutation-options.types";
import type { Feedback } from "@/modules/profile/types/feedback.types";

function useCertificationMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<Certification>,
  messages: CertificationMutationMessages,
  options: CertificationMutationOptions,
) {
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function mutate(variables: TVariables): Promise<Certification | null> {
    setIsPending(true);
    setFeedback(null);
    try {
      const certification = await mutationFn(variables);
      setFeedback({ type: "success", message: messages.success });
      options.onSuccess?.(certification);
      return certification;
    } catch {
      setFeedback({ type: "error", message: messages.error });
      return null;
    } finally {
      setIsPending(false);
    }
  }

  function clearFeedback() {
    setFeedback(null);
  }

  return { mutate, isPending, feedback, clearFeedback };
}

export function useCreateCertification(options: CertificationMutationOptions = {}) {
  return useCertificationMutation(
    (data: CreateCertificationDto) => certificationsService.createCertification(data),
    {
      success: CERTIFICATION_FEEDBACK_MESSAGES.createSuccess,
      error: CERTIFICATION_FEEDBACK_MESSAGES.createError,
    },
    options,
  );
}

export function useUpdateCertification(options: CertificationMutationOptions = {}) {
  return useCertificationMutation(
    ({ id, data }: { id: string; data: UpdateCertificationDto }) =>
      certificationsService.updateCertification(id, data),
    {
      success: CERTIFICATION_FEEDBACK_MESSAGES.updateSuccess,
      error: CERTIFICATION_FEEDBACK_MESSAGES.updateError,
    },
    options,
  );
}
