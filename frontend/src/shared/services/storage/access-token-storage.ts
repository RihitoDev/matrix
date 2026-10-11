import {
  readSessionStorage,
  removeSessionStorage,
  writeSessionStorage,
} from "./browser-session-storage";

const ACCESS_TOKEN_STORAGE_KEY = "accessToken";

export function saveAccessToken(accessToken: string): boolean {
  return writeSessionStorage(ACCESS_TOKEN_STORAGE_KEY, accessToken);
}

export function getAccessToken(): string | null {
  return readSessionStorage(ACCESS_TOKEN_STORAGE_KEY);
}

export function clearAccessToken(): boolean {
  return removeSessionStorage(ACCESS_TOKEN_STORAGE_KEY);
}
