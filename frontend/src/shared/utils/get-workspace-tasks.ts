import { WORKSPACE_TASKS } from "@/shared/config/workspace-navigation.config";
import { getRouteRoles } from "./get-route-roles";
import type { RoleTag } from "@/shared/types/role-tag.types";

export function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

export function getWorkspaceTasks(roles: readonly RoleTag[], search = "") {
  const term = normalizeSearch(search);
  return WORKSPACE_TASKS.filter((task) =>
    roles.some((role) => getRouteRoles(task.href).includes(role)) &&
    (!term || normalizeSearch(`${task.label} ${task.keywords ?? ""}`).includes(term)),
  );
}
