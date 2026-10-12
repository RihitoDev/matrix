import { clearAccessToken, saveAccessToken } from "@/shared/services/storage/access-token-storage";
import { clearSessionMarker, setSessionMarker } from "./session-cookie";

export function startSession(accessToken: string): void {
  saveAccessToken(accessToken);
  setSessionMarker();
}

export function endSession(): void {
  clearAccessToken();
  clearSessionMarker();
}
