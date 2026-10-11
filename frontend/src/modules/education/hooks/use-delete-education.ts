"use client";

import { useRef, useState } from "react";
import { EDUCATION_FEEDBACK_MESSAGES } from "../constants/education-feedback.constants";
import { educationsService } from "../services/educations.service";
import type { EducationItem } from "../types/education-item.types";
import type { Feedback } from "@/modules/profile/types/feedback.types";

export function useDeleteEducation(onDeleted: () => void | Promise<void>) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const isDeletingRef = useRef(false);

  async function deleteEducation(education: EducationItem): Promise<boolean> {
    if (isDeletingRef.current) return false;
    isDeletingRef.current = true;
    setIsDeleting(true);
    setFeedback(null);
    try {
      await educationsService.deleteEducation(education.id);
      setFeedback({ type: "success", message: EDUCATION_FEEDBACK_MESSAGES.deleteSuccess });
      await onDeleted();
      return true;
    } catch {
      setFeedback({ type: "error", message: EDUCATION_FEEDBACK_MESSAGES.deleteError });
      return false;
    } finally {
      isDeletingRef.current = false;
      setIsDeleting(false);
    }
  }

  function clearFeedback() {
    setFeedback(null);
  }

  return { deleteEducation, isDeleting, feedback, clearFeedback };
}
