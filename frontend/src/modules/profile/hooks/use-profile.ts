"use client";

import { useEffect, useState } from "react";
import { PROFILE_FEEDBACK_MESSAGES } from "../constants/profile-feedback.constants";
import { profileService } from "../services/profile.service";
import type { ProfileResponse } from "../types/profile-response.types";
import { getProfileErrorMessage } from "../utils/get-profile-error-message";

export function useProfile() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      try {
        const loadedProfile = await profileService.getProfile();
        if (isActive) {
          setProfile(loadedProfile);
        }
      } catch (loadError) {
        if (isActive) {
          setError(getProfileErrorMessage(loadError, PROFILE_FEEDBACK_MESSAGES.loadError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  return { profile, isLoading, error, setProfile };
}
