import { getAccessToken } from "@/shared/services/storage/access-token-storage";

export function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
