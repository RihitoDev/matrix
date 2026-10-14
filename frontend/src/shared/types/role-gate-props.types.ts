import type { ReactNode } from "react";
import type { RoleTag } from "./role-tag.types";

export interface RoleGateProps {
  children: ReactNode;
  allowedRoles: readonly RoleTag[];
}
