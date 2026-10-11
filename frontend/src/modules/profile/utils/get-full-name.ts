import type { ProfileResponse } from "../types/profile-response.types";

export function getFullName(profile: Pick<ProfileResponse, "firstName" | "lastName">): string {
  return [profile.firstName ?? "", profile.lastName ?? ""]
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" ");
}
