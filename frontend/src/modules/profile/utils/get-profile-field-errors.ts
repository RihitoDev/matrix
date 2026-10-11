import { PROFILE_FIELDS } from "../constants/profile-fields.constants";
import { PROFILE_SERVER_FIELD_MESSAGES } from "../constants/profile-validation.constants";
import type { ProfileFieldErrors } from "../types/profile-field-errors.types";

// Reads the structured validation errors ({ data: [{ field, message }] }) of a failed request.
export function getProfileFieldErrors(error: unknown): ProfileFieldErrors {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return {};
  }

  const response = error.response;
  if (typeof response !== "object" || response === null || !("data" in response)) {
    return {};
  }

  const body = response.data;
  if (typeof body !== "object" || body === null || !("data" in body) || !Array.isArray(body.data)) {
    return {};
  }

  const errors: ProfileFieldErrors = {};
  for (const issue of body.data) {
    if (typeof issue !== "object" || issue === null) {
      continue;
    }
    const field = PROFILE_FIELDS.find((name) => name === issue.field);
    if (field) {
      errors[field] = PROFILE_SERVER_FIELD_MESSAGES[field];
    }
  }
  return errors;
}
