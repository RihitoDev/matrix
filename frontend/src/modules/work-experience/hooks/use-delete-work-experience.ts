"use client";

import { useMutation } from "@tanstack/react-query";

import { useState } from "react";
import { WORK_EXPERIENCE_FEEDBACK_MESSAGES } from "../config/work-experience-feedback.config";
import { workExperienceService } from "../services/work-experience.service";
import type { Feedback } from "@/modules/profile";
import type { WorkExperienceItem } from "../types/work-experience-item.types";

export function useDeleteWorkExperience(onDeleted: (experience: WorkExperienceItem) => void) {
  const mutation = useMutation({ mutationFn: (request: () => Promise<void>) => request() });
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function deleteWorkExperience(experience: WorkExperienceItem): Promise<void> {
    setIsDeleting(true);
    setFeedback(null);
    try {
      await mutation.mutateAsync(() => workExperienceService.deleteWorkExperience(experience.id));
      setFeedback({ type: "success", message: WORK_EXPERIENCE_FEEDBACK_MESSAGES.deleteSuccess });
      onDeleted(experience);
    } catch {
      setFeedback({ type: "error", message: WORK_EXPERIENCE_FEEDBACK_MESSAGES.deleteError });
    } finally {
      setIsDeleting(false);
    }
  }

  function clearFeedback() {
    setFeedback(null);
  }

  return { deleteWorkExperience, isDeleting, feedback, clearFeedback };
}
