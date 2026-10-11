"use client";

import { useState } from "react";
import { CERTIFICATION_FEEDBACK_MESSAGES } from "../config/certification-feedback.config";
import { certificationsService } from "../services/certifications.service";
import type { Certification } from "../types/certification.types";
import type { Feedback } from "@/modules/profile/types/feedback.types";

export function useDeleteCertification(onSuccess?: (certification: Certification) => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function deleteCertification(certification: Certification): Promise<boolean> {
    setIsDeleting(true);
    setFeedback(null);
    try {
      await certificationsService.deleteCertification(certification.id);
      setFeedback({ type: "success", message: CERTIFICATION_FEEDBACK_MESSAGES.deleteSuccess });
      onSuccess?.(certification);
      return true;
    } catch {
      setFeedback({ type: "error", message: CERTIFICATION_FEEDBACK_MESSAGES.deleteError });
      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  function clearFeedback() {
    setFeedback(null);
  }

  return { deleteCertification, isDeleting, feedback, clearFeedback };
}
