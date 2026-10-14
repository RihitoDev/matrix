import type { RoleTag } from "./role-tag.types";

export interface AuthContextValue {
  roles: readonly RoleTag[];
  isLoading: boolean;
  refreshRoles: () => Promise<void>;
}
