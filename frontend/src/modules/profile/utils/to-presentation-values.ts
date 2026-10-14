import type { PresentationValues } from "../types/presentation-values.types";
import type { ProfileResponse } from "../types/profile-response.types";

export function toPresentationValues(profile: ProfileResponse): PresentationValues {
  return {
    headline: profile.headline ?? "",
    aboutMe: profile.aboutMe ?? "",
  };
}
