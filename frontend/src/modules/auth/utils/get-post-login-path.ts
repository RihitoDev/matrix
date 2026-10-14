import {
  ADMINISTRATIVE_ROLE_TAG,
  BACKOFFICE_HOME_PATH,
  COMPANY_ROLE_TAG,
  DEFAULT_HOME_PATH,
  RECRUITERS_HOME_PATH,
} from "../constants/login-redirect.constants";

export function getPostLoginPath(roleTag: string | null | undefined): string {
  if (roleTag === ADMINISTRATIVE_ROLE_TAG) return BACKOFFICE_HOME_PATH;
  if (roleTag === COMPANY_ROLE_TAG) return RECRUITERS_HOME_PATH;
  return DEFAULT_HOME_PATH;
}
