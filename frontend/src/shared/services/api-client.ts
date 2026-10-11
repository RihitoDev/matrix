import axios from "axios";
import { ENV_CONFIG } from "@/shared/config/env.config";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";

export const apiClient = axios.create({
  baseURL: ENV_CONFIG.apiUrl,
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken && !config.headers.has("Authorization")) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return config;
});
