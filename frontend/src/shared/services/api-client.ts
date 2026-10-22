import axios from "axios";
import { ENV_CONFIG } from "@/shared/config/env.config";
import { getAccessToken, clearAccessToken } from "@/shared/services/storage/access-token-storage";

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

export const isApiError = axios.isAxiosError;

export { AxiosError as ApiError } from "axios";

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const token = getAccessToken();
      const authorization = error.config?.headers?.get?.("Authorization");
      // Una respuesta tardía de otra sesión no debe invalidar el token actual.
      if (token && authorization === `Bearer ${token}`) clearAccessToken();
    }
    return Promise.reject(error);
  },
);
