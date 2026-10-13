import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_HOME_PATH, LOGIN_PATH, ROOT_PATH } from "@/modules/auth/constants/login-redirect.constants";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_VALUE } from "@/modules/auth/constants/session.constants";
import { isPublicPath } from "@/modules/auth/utils/route-access";
import { buildLoginUrl } from "@/modules/auth/utils/safe-next-path";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.get(SESSION_COOKIE_NAME)?.value === SESSION_COOKIE_VALUE;

  if (pathname === ROOT_PATH) {
    return NextResponse.redirect(new URL(hasSession ? DEFAULT_HOME_PATH : LOGIN_PATH, request.url), 307);
  }
  if (isPublicPath(pathname) || hasSession) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL(buildLoginUrl(`${pathname}${search}`), request.url), 307);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons/|.*\\..*).*)"],
};
