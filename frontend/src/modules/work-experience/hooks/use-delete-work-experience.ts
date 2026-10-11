"use client";

import { useState } from "react";
import { WORK_EXPERIENCE_FEEDBACK_MESSAGES } from "../config/work-experience-feedback.config";
import { workExperienceService } from "../services/work-experience.service";
import type { Feedback } from "@/modules/profile/types/feedback.types";
import type { WorkExperienceItem } from "../types/work-experience-item.types";

export function useDeleteWorkExperience(onDeleted: (experience: WorkExperienceItem) => void) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function deleteWorkExperience(experience: WorkExperienceItem): Promise<void> {
    setIsDeleting(true);
    setFeedback(null);
    try {
      await workExperienceService.deleteWorkExperience(experience.id);
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
