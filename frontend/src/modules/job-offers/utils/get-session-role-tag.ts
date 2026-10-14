import { getAccessToken } from "@/shared/services/storage/access-token-storage";

export function getSessionRoleTag(): string | null {
  const payload = getAccessToken()?.split(".")[1];
  if (!payload) return null;
  try {
    const parsed: unknown = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof parsed !== "object" || parsed === null || !("roleTag" in parsed)) return null;
    const { roleTag } = parsed as { roleTag: unknown };
    return typeof roleTag === "string" ? roleTag : null;
  } catch {
    return null;
  }
}
