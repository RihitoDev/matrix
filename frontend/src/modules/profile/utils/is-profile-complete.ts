import type { ProfileSummary } from "../types/profile-summary.types";

export function isProfileComplete(profile: ProfileSummary): boolean {
  const requiredValues = [
    profile.fullName,
    profile.headline,
    profile.city,
    profile.phone,
    profile.personalEmail,
    profile.aboutMe,
  ];

  return requiredValues.every((value) => (value ?? "").trim().length > 0);
}
