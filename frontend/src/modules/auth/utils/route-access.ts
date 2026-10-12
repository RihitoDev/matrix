import { PUBLIC_ROUTES } from "../constants/session.constants";

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
