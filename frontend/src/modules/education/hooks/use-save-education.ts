"use client";

import { useRef, useState } from "react";
import { EDUCATION_FEEDBACK_MESSAGES } from "../constants/education-feedback.constants";
import { EDUCATION_CONFLICT_STATUS } from "../constants/education-http.constants";
import { educationsService } from "../services/educations.service";
import type { SaveEducationArguments } from "../types/save-education-arguments.types";
import type { Feedback } from "@/modules/profile/types/feedback.types";
import { getHttpStatus } from "@/modules/profile/utils/get-http-status";

export function useSaveEducation(onSaved: () => void | Promise<void>) {
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const isSavingRef = useRef(false);

  async function save(...args: SaveEducationArguments): Promise<void> {
    if (isSavingRef.current) {
      return;
    }
    isSavingRef.current = true;
    setIsSaving(true);
    setFeedback(null);
    const id = args[1];
    try {
      if (args.length === 2) {
        await educationsService.updateEducation(args[1], args[0]);
      } else {
        await educationsService.createEducation(args[0]);
      }
      setFeedback({
        type: "success",
        message: id
          ? EDUCATION_FEEDBACK_MESSAGES.updateSuccess
          : EDUCATION_FEEDBACK_MESSAGES.createSuccess,
      });
      await onSaved();
    } catch (error) {
      setFeedback({
        type: "error",
        message: id !== undefined && getHttpStatus(error) === EDUCATION_CONFLICT_STATUS
          ? EDUCATION_FEEDBACK_MESSAGES.updateConflict
          : id ? EDUCATION_FEEDBACK_MESSAGES.updateError : EDUCATION_FEEDBACK_MESSAGES.createError,
      });
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }

  function clearFeedback() {
    setFeedback(null);
  }

  return { save, isSaving, feedback, clearFeedback };
}
