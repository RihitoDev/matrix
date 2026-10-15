import type { RoleTag } from "@/shared/types/role-tag.types";
export type { RoleTag } from "@/shared/types/role-tag.types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  roleTag: RoleTag;
  roles?: RoleTag[];
}
