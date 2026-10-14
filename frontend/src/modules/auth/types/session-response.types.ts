import type { RoleTag } from "./auth-types";

export interface SessionResponse {
  id: string;
  email: string;
  roles: RoleTag[];
}
