"use client";

import type { SetStateAction } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PROFILE_FEEDBACK_MESSAGES } from "../constants/profile-feedback.constants";
import { profileService } from "../services/profile.service";
import type { ProfileResponse } from "../types/profile-response.types";
import { getProfileErrorMessage } from "../utils/get-profile-error-message";

export function useProfile() {
  const queryClient = useQueryClient();
  const queryKey = ["profile", "me"];
  const query = useQuery({ queryKey, queryFn: () => profileService.getProfile() });
  function setProfile(value: SetStateAction<ProfileResponse | null>) {
    queryClient.setQueryData<ProfileResponse | null>(queryKey, (current) =>
      typeof value === "function" ? value(current ?? null) : value,
    );
  }
  return {
    profile: query.data ?? null,
    isLoading: query.isPending,
    error: query.error ? getProfileErrorMessage(query.error, PROFILE_FEEDBACK_MESSAGES.loadError) : null,
    setProfile,
  };
}
