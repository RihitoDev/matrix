"use client";

import { useEffect, useRef, useState } from "react";
import { PROFILE_FEEDBACK_MESSAGES } from "../constants/profile-feedback.constants";
import { profileService } from "../services/profile.service";
import type { Feedback } from "../types/feedback.types";
import type { PersonalInfoValues } from "../types/personal-info-values.types";
import type { PresentationPayload } from "../types/presentation-payload.types";
import type { ProfileResponse } from "../types/profile-response.types";
import type { ProfileFieldErrors } from "../types/profile-field-errors.types";
import { getProfileErrorMessage } from "../utils/get-profile-error-message";
import { getProfileFieldErrors } from "../utils/get-profile-field-errors";

export function useSaveProfile(onSaved: (profile: ProfileResponse) => void) {
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const savingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function clearFeedback(field?: keyof ProfileFieldErrors) {
    setFeedback(null);
    setFieldErrors((current) => {
      if (!field) return {};
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function save(request: () => Promise<ProfileResponse>, successMessage: string) {
    if (savingRef.current || !mountedRef.current) return false;
    savingRef.current = true;
    setIsSaving(true);
    clearFeedback();
    try {
      const profile = await request();
      if (!mountedRef.current) return false;
      onSaved(profile);
      setFeedback({ type: "success", message: successMessage });
      return true;
    } catch (error) {
      if (!mountedRef.current) return false;
      setFieldErrors(getProfileFieldErrors(error));
      setFeedback({
        type: "error",
        message: getProfileErrorMessage(error, PROFILE_FEEDBACK_MESSAGES.saveError),
      });
      return false;
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setIsSaving(false);
    }
  }

  function savePersonalInfo(values: PersonalInfoValues): Promise<boolean> {
    return save(
      () => profileService.updatePersonalInfo(values),
      PROFILE_FEEDBACK_MESSAGES.personalInfoSaveSuccess,
    );
  }

  function savePresentation(payload: PresentationPayload): Promise<boolean> {
    return save(
      () => profileService.updatePresentation(payload),
      PROFILE_FEEDBACK_MESSAGES.presentationSaveSuccess,
    );
  }

  return { savePersonalInfo, savePresentation, isSaving, feedback, fieldErrors, clearFeedback };
}
