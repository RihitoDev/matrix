import { getSessionRoles } from "./get-session-roles";
import type { RoleTag } from "../types/auth-types";

const ROLE_LABELS: Record<RoleTag, string> = {
  titulado: "Titulado",
  estudiante: "Estudiante",
  mentor: "Mentor",
  empresa: "Empresa",
  administrativo: "Administrativo",
};

export function getSessionRoleLabel(accessToken: string): string {
  const roles = getSessionRoles(accessToken);
  return getRolesLabel(roles);
}

export function getRolesLabel(roles: readonly RoleTag[]): string {
  return roles.length ? roles.map((role) => ROLE_LABELS[role]).join(" · ") : "Usuario autenticado";
}
