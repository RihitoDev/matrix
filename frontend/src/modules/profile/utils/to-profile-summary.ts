import type { ProfileResponse } from "../types/profile-response.types";
import type { ProfileSummary } from "../types/profile-summary.types";
import { getFullName } from "./get-full-name";

export function toProfileSummary(profile: ProfileResponse): ProfileSummary {
  return {
    fullName: getFullName(profile),
    headline: profile.headline ?? "",
    city: profile.city?.title ?? "",
    phone: profile.phone ?? "",
    personalEmail: profile.personalEmail ?? "",
    aboutMe: profile.aboutMe ?? "",
    interestedOpportunities: "",
  };
}
