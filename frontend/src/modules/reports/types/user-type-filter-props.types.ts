import type { UserType } from "./registered-user.types";

export interface UserTypeFilterProps {
  value?: UserType;
  onChange: (userType?: UserType) => void;
}
