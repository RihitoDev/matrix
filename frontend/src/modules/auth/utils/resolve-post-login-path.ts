import { ADMINISTRATIVE_ROLE_TAG, BACKOFFICE_HOME_PATH } from "../constants/login-redirect.constants";
import { getPostLoginPath } from "./get-post-login-path";
import { getSafeNextPath } from "./safe-next-path";

const BACKOFFICE_PREFIX = "/backoffice";
const isBackofficePath = (path: string) => path === BACKOFFICE_PREFIX || path.startsWith(`${BACKOFFICE_PREFIX}/`);

export function resolvePostLoginPath(roleTag: string | readonly string[] | null | undefined, next: string | null | undefined): string {
  const roles = Array.isArray(roleTag) ? roleTag : [roleTag];
  const isAdministrative = roles.includes(ADMINISTRATIVE_ROLE_TAG);
  let fallback = getPostLoginPath(typeof roleTag === "string" ? roleTag : roles[0]);
  if (isAdministrative) fallback = BACKOFFICE_HOME_PATH;
  else if (Array.isArray(roleTag) && roles.includes("empresa")) fallback = "/recruiters";

  const safeNext = getSafeNextPath(next);
  if (!safeNext) return fallback;
  if (Array.isArray(roleTag)) return isBackofficePath(safeNext) && !isAdministrative ? fallback : safeNext;
  if (isAdministrative) return isBackofficePath(safeNext) ? safeNext : BACKOFFICE_HOME_PATH;
  return isBackofficePath(safeNext) ? fallback : safeNext;
}
