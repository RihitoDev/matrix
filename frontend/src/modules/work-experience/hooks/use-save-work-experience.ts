"use client";

import { useState } from "react";
import { WORK_EXPERIENCE_FEEDBACK_MESSAGES } from "../config/work-experience-feedback.config";
import { workExperienceService } from "../services/work-experience.service";
import type { Feedback } from "@/modules/profile/types/feedback.types";
import type { WorkExperiencePayload } from "../types/work-experience-payload.types";

export function useSaveWorkExperience(onSaved: () => void) {
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function save(payload: WorkExperiencePayload, id?: string): Promise<void> {
    setIsSaving(true);
    setFeedback(null);
    try {
      if (id) {
        await workExperienceService.updateWorkExperience(id, payload);
      } else {
        await workExperienceService.createWorkExperience(payload);
      }
      setFeedback({
        type: "success",
        message: id
          ? WORK_EXPERIENCE_FEEDBACK_MESSAGES.updateSuccess
          : WORK_EXPERIENCE_FEEDBACK_MESSAGES.createSuccess,
      });
      onSaved();
    } catch {
      setFeedback({
        type: "error",
        message: id
          ? WORK_EXPERIENCE_FEEDBACK_MESSAGES.updateError
          : WORK_EXPERIENCE_FEEDBACK_MESSAGES.createError,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function clearFeedback() {
    setFeedback(null);
  }

  return { save, isSaving, feedback, clearFeedback };
}
