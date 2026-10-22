import type { RoleTag } from "@/modules/auth";

export interface UserTypeFilterProps {
  value?: RoleTag;
  onChange: (userType?: RoleTag) => void;
}
