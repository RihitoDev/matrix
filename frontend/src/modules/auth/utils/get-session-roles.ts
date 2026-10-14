import { ROLE_TAGS } from "@/shared/constants/roles.constants";
import type { RoleTag } from "../types/auth-types";

export function getSessionRoles(accessToken: string | null): RoleTag[] {
  if (!accessToken) return [];
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return [];
    const decoded: unknown = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof decoded !== "object" || decoded === null) return [];
    const { roles, roleTag } = decoded as Record<string, unknown>;
    const candidates = Array.isArray(roles) ? roles : [roleTag];
    return ROLE_TAGS.filter((role) => candidates.includes(role));
  } catch {
    return [];
  }
}
