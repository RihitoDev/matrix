import { SESSION_TOKEN_KEY } from "../constants/request-review.constants";

// TODO: alinear el almacenamiento del token con shared/services/storage
export function getSessionToken(): string | null {
  try {
    return sessionStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // Sin acceso al almacenamiento no hay nada que borrar
  }
}

// Solo para decidir qué pantalla mostrar: la autorización real la hace el backend
export function getRoleTag(token: string): string | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const parsed: unknown = JSON.parse(atob(normalized));
    if (typeof parsed === "object" && parsed !== null && "roleTag" in parsed) {
      const { roleTag } = parsed as { roleTag: unknown };
      return typeof roleTag === "string" ? roleTag : null;
    }
    return null;
  } catch {
    return null;
  }
}
