import type { RegisteredUser } from "./registered-user.types";

export interface RegisteredUsersTableProps {
  users: RegisteredUser[];
  isLoading: boolean;
  errorMessage?: string;
}
