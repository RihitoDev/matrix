import { SESSION_COOKIE_NAME, SESSION_COOKIE_VALUE } from "../constants/session.constants";

function cookieAttributes(): string {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  return `; Path=/; SameSite=Lax${secure}`;
}

export function setSessionMarker(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=${SESSION_COOKIE_VALUE}${cookieAttributes()}`;
}

export function clearSessionMarker(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE_NAME}=; Max-Age=0${cookieAttributes()}`;
}

export function hasSessionMarker(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").includes(`${SESSION_COOKIE_NAME}=${SESSION_COOKIE_VALUE}`);
}
