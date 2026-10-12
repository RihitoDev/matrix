import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse } from "@/shared/types/api-response.types";
import type { LoginPayload, LoginResponse } from "../types/auth-types";

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    if (!apiClient.defaults.baseURL) {
      throw new Error("La URL del backend no está configurada. Revisa las variables NEXT_PUBLIC_API_URL del frontend.");
    }
    const response = await apiClient.post<ApiResponse<LoginResponse>>("/auth/login", payload);
    const result = response.data.data;
    if (!result?.accessToken) {
      throw new Error("El backend no devolvió un token de sesión válido.");
    }
    return result;
  },
};
