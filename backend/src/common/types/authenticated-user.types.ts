export interface AuthenticatedUser {
  id: string;
  userId?: string;
  email: string;
  roles: string[];
  roleTag?: string;
}
