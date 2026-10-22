import { getAccessToken, clearAccessToken } from "@/shared/services/storage/access-token-storage";

export function getSessionToken(): string | null {
  return getAccessToken();
}

export function clearSession(): void {
  clearAccessToken();
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
