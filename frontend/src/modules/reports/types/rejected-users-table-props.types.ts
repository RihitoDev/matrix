import type { RejectedUser } from "./rejected-user.types";

export interface RejectedUsersTableProps {
  users: RejectedUser[];
  isLoading: boolean;
  errorMessage?: string;
  searchTerm?: string;
}
