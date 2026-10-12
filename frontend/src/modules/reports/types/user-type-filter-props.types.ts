import type { RoleTag } from "@/modules/auth/types/auth-types";

export interface UserTypeFilterProps {
  value?: RoleTag;
  onChange: (userType?: RoleTag) => void;
}
