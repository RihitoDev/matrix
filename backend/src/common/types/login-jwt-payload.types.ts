export interface LoginJwtPayload {
  sub: string;
  roleTag: string;
  roles?: string[];
}
