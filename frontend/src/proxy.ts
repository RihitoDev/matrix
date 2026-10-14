import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_HOME_PATH, LOGIN_PATH, ROOT_PATH } from "@/modules/auth/constants/login-redirect.constants";
import { SESSION_COOKIE_NAME, SESSION_COOKIE_VALUE } from "@/modules/auth/constants/session.constants";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== ROOT_PATH) return NextResponse.next();

  const hasSession = request.cookies.get(SESSION_COOKIE_NAME)?.value === SESSION_COOKIE_VALUE;
  return NextResponse.redirect(new URL(hasSession ? DEFAULT_HOME_PATH : LOGIN_PATH, request.url), 307);
}

export const config = {
  matcher: ["/"],
};
