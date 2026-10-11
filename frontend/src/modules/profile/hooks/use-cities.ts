"use client";

import { useEffect, useState } from "react";
import { PROFILE_FEEDBACK_MESSAGES } from "../constants/profile-feedback.constants";
import { profileService } from "../services/profile.service";
import type { CityOption } from "../types/city-option.types";

export function useCities() {
  const [cities, setCities] = useState<CityOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadCities() {
      try {
        const loadedCities = await profileService.getCities();
        if (isActive) {
          setCities(loadedCities);
        }
      } catch {
        if (isActive) {
          setError(PROFILE_FEEDBACK_MESSAGES.citiesLoadError);
        }
      }
    }

    void loadCities();

    return () => {
      isActive = false;
    };
  }, []);

  return { cities, error };
}
