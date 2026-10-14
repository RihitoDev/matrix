import {
  readSessionStorage,
  removeSessionStorage,
  writeSessionStorage,
} from "./browser-session-storage";

const ACCESS_TOKEN_STORAGE_KEY = "accessToken";

export function saveAccessToken(accessToken: string): boolean {
  const isSaved = writeSessionStorage(ACCESS_TOKEN_STORAGE_KEY, accessToken);
  if (isSaved && typeof window !== "undefined") window.dispatchEvent(new Event("access-token-change"));
  return isSaved;
}

export function getAccessToken(): string | null {
  return readSessionStorage(ACCESS_TOKEN_STORAGE_KEY);
}

export function clearAccessToken(): boolean {
  const isRemoved = removeSessionStorage(ACCESS_TOKEN_STORAGE_KEY);
  if (isRemoved && typeof window !== "undefined") window.dispatchEvent(new Event("access-token-change"));
  return isRemoved;
}

export function subscribeAccessToken(onChange: () => void): () => void {
  window.addEventListener("access-token-change", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("access-token-change", onChange);
    window.removeEventListener("storage", onChange);
  };
}
