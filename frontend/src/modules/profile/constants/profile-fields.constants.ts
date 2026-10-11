import type { ProfileFieldErrors } from "../types/profile-field-errors.types";

export const PROFILE_FIELDS = [
  "firstName",
  "lastName",
  "cityId",
  "phone",
  "personalEmail",
  "headline",
  "aboutMe",
] as const satisfies readonly (keyof ProfileFieldErrors)[];
