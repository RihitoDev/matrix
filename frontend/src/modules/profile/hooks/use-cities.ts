"use client";

import { useQuery } from "@tanstack/react-query";
import { PROFILE_FEEDBACK_MESSAGES } from "../constants/profile-feedback.constants";
import { profileService } from "../services/profile.service";

export function useCities() {
  const query = useQuery({ queryKey: ["profile", "cities"], queryFn: () => profileService.getCities() });
  return { cities: query.data ?? [], error: query.isError ? PROFILE_FEEDBACK_MESSAGES.citiesLoadError : null };
}
