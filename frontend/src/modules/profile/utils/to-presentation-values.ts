import type { PresentationValues } from "../types/presentation-values.types";
import type { ProfileResponse } from "../types/profile-response.types";

// interestedOpportunities is not stored yet: the users.interested_opportunities column is pending.
export function toPresentationValues(profile: ProfileResponse): PresentationValues {
  return {
    headline: profile.headline ?? "",
    aboutMe: profile.aboutMe ?? "",
    interestedOpportunities: "",
  };
}
