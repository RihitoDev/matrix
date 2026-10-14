import { ROLE_TAGS } from "@/shared/constants/roles.constants";
import { apiClient } from "@/shared/services/api-client";
import type { ApiResponse } from "@/shared/types/api-response.types";
import type { SessionResponse } from "../types/session-response.types";
import type { LoginPayload, LoginResponse } from "../types/auth-types";

function isLoginResponse(value: unknown): value is LoginResponse {
  if (typeof value !== "object" || value === null) return false;
  const { accessToken, roleTag, roles } = value as Record<string, unknown>;
  return typeof accessToken === "string" && accessToken !== ""
    && ROLE_TAGS.some((role) => role === roleTag)
    && (roles === undefined || (Array.isArray(roles) && roles.length > 0 && roles.every((role) => ROLE_TAGS.some((knownRole) => knownRole === role))));
}

function extractLoginResponse(body: unknown): LoginResponse {
  const wrapped = typeof body === "object" && body !== null ? (body as { data?: unknown }).data : undefined;
  const candidate = isLoginResponse(wrapped) ? wrapped : body;
  if (!isLoginResponse(candidate)) {
    throw new Error("El backend no devolvió un token de sesión válido.");
  }
  return { accessToken: candidate.accessToken, roleTag: candidate.roleTag, ...(candidate.roles ? { roles: candidate.roles } : {}) };
}

export const authService = {
  getSession: async (accessToken?: string | null): Promise<SessionResponse> => {
    const response = await apiClient.get<ApiResponse<SessionResponse>>("/auth/session", {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    return response.data.data;
  },
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    if (!apiClient.defaults.baseURL) {
      throw new Error("La URL del backend no está configurada. Revisa las variables NEXT_PUBLIC_API_URL del frontend.");
    }
    const response = await apiClient.post<unknown>("/auth/login", payload);
    return extractLoginResponse(response.data);
  },
};
