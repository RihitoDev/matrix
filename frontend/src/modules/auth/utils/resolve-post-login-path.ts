import { ADMINISTRATIVE_ROLE_TAG, BACKOFFICE_HOME_PATH } from "../constants/login-redirect.constants";
import { getRouteRoles } from "@/shared/utils/get-route-roles";
import { getPostLoginPath } from "./get-post-login-path";
import { getSafeNextPath } from "./safe-next-path";

export function resolvePostLoginPath(roleTag: string | readonly string[] | null | undefined, next: string | null | undefined): string {
  const roles: readonly (string | null | undefined)[] = Array.isArray(roleTag) ? roleTag : [roleTag];
  let fallback = getPostLoginPath(typeof roleTag === "string" ? roleTag : roles[0]);
  if (roles.includes(ADMINISTRATIVE_ROLE_TAG)) fallback = BACKOFFICE_HOME_PATH;
  else if (roles.includes("empresa")) fallback = "/recruiters";

  const safeNext = getSafeNextPath(next);
  if (!safeNext) return fallback;
  const pathname = new URL(safeNext, "http://localhost").pathname;
  const allowedRoles: readonly string[] = getRouteRoles(pathname);
  return roles.some((role) => typeof role === "string" && allowedRoles.includes(role)) ? safeNext : fallback;
}
