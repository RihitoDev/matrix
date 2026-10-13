import { apiClient } from "@/shared/services/api-client";
import type { LoginPayload, LoginResponse } from "../types/auth-types";

function isLoginResponse(value: unknown): value is LoginResponse {
  if (typeof value !== "object" || value === null) return false;
  const { accessToken, roleTag } = value as Record<string, unknown>;
  return typeof accessToken === "string" && accessToken !== "" && typeof roleTag === "string" && roleTag !== "";
}

function extractLoginResponse(body: unknown): LoginResponse {
  const wrapped = typeof body === "object" && body !== null ? (body as { data?: unknown }).data : undefined;
  const candidate = isLoginResponse(wrapped) ? wrapped : body;
  if (!isLoginResponse(candidate)) {
    throw new Error("El backend no devolvió un token de sesión válido.");
  }
  return { accessToken: candidate.accessToken, roleTag: candidate.roleTag };
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    if (!apiClient.defaults.baseURL) {
      throw new Error("La URL del backend no está configurada. Revisa las variables NEXT_PUBLIC_API_URL del frontend.");
    }
    const response = await apiClient.post<unknown>("/auth/login", payload);
    return extractLoginResponse(response.data);
  },
};
