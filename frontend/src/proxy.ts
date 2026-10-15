import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_PATH, ROOT_PATH } from "@/modules/auth/constants/login-redirect.constants";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== ROOT_PATH) return NextResponse.next();

  return NextResponse.redirect(new URL(LOGIN_PATH, request.url), 307);
}

export const config = {
  matcher: ["/"],
};
