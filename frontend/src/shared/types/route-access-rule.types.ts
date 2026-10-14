import type { RoleTag } from "./role-tag.types";

export interface RouteAccessRule {
  pattern: RegExp;
  roles: readonly RoleTag[];
}
