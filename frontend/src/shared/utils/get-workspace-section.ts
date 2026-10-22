import { WORKSPACE_SECTIONS } from "@/shared/config/workspace-sections.config";
import type { RoleTag } from "@/shared/types/role-tag.types";
import { getRouteRoles } from "./get-route-roles";

export function getWorkspaceSection(pathname: string, roles: readonly RoleTag[]) {
  const section = WORKSPACE_SECTIONS.find(({ patterns }) => patterns.some((pattern) => pattern.test(pathname)));
  if (!section) return null;
  return {
    ...section,
    items: section.items.filter(({ href }) => roles.some((role) => getRouteRoles(href).includes(role))),
  };
}
