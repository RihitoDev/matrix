import {
  LOGIN_EMAIL_INVALID_MESSAGE,
  LOGIN_EMAIL_PATTERN,
  LOGIN_EMAIL_REQUIRED_MESSAGE,
  LOGIN_PASSWORD_REQUIRED_MESSAGE,
} from "../constants/login-validation.constants";

export type LoginFieldErrors = { email?: string; password?: string };

export function validateLoginFields(email: string, password: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) errors.email = LOGIN_EMAIL_REQUIRED_MESSAGE;
  else if (!LOGIN_EMAIL_PATTERN.test(trimmedEmail)) errors.email = LOGIN_EMAIL_INVALID_MESSAGE;

  if (!password) errors.password = LOGIN_PASSWORD_REQUIRED_MESSAGE;

  return errors;
}
