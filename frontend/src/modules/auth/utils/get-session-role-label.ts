import type { RoleTag } from "../types/auth-types";

const ROLE_LABELS: Record<RoleTag, string> = {
  titulado: "Titulado",
  estudiante: "Estudiante",
  mentor: "Mentor",
  empresa: "Empresa",
  administrativo: "Administrativo",
};

export function getSessionRoleLabel(accessToken: string): string {
  try {
    const payload = accessToken.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded: unknown = JSON.parse(atob(normalized));
    if (typeof decoded !== "object" || decoded === null || !("roleTag" in decoded)) {
      return "Usuario autenticado";
    }
    const role = decoded.roleTag;
    return typeof role === "string" && Object.hasOwn(ROLE_LABELS, role)
      ? ROLE_LABELS[role as RoleTag]
      : "Usuario autenticado";
  } catch {
    return "Usuario autenticado";
  }
}
