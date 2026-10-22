"use client";

import { useMutation } from "@tanstack/react-query";

import { useState } from "react";
import { WORK_EXPERIENCE_FEEDBACK_MESSAGES } from "../config/work-experience-feedback.config";
import { workExperienceService } from "../services/work-experience.service";
import type { Feedback } from "@/modules/profile";
import type { WorkExperiencePayload } from "../types/work-experience-payload.types";

export function useSaveWorkExperience(onSaved: () => void) {
  const mutation = useMutation({ mutationFn: (request: () => Promise<unknown>) => request() });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function save(payload: WorkExperiencePayload, id?: string): Promise<void> {
    setIsSaving(true);
    setFeedback(null);
    try {
      if (id) {
        await mutation.mutateAsync(() => workExperienceService.updateWorkExperience(id, payload));
      } else {
        await mutation.mutateAsync(() => workExperienceService.createWorkExperience(payload));
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
