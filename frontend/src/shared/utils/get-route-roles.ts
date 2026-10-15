import { APP_ROUTE_ACCESS } from "@/shared/config/route-access.config";
import type { RoleTag } from "@/shared/types/role-tag.types";

export function getRouteRoles(pathname: string): readonly RoleTag[] {
  return APP_ROUTE_ACCESS.find(({ pattern }) => pattern.test(pathname))?.roles ?? [];
}
