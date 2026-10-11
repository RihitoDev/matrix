import type { PersonalInfoValues } from "../types/personal-info-values.types";
import type { ProfileResponse } from "../types/profile-response.types";

export function toPersonalInfoValues(profile: ProfileResponse): PersonalInfoValues {
  return {
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    cityId: profile.city?.id ?? "",
    phone: profile.phone ?? "",
    personalEmail: profile.personalEmail ?? "",
  };
}
