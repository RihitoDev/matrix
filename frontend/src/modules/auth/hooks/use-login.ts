"use client";

import { useState } from "react";
import axios from "axios";
import { authService } from "../services/auth.service";
import type { LoginPayload, LoginResponse } from "../types/auth-types";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(payload: LoginPayload): Promise<LoginResponse | null> {
    setIsLoading(true);
    setError(null);
    try {
      return await authService.login(payload);
    } catch (cause: unknown) {
      if (axios.isAxiosError(cause)) {
        if (!cause.response) {
          setError("No se pudo conectar con el backend. Revisa que esté encendido y que la URL y CORS estén configurados.");
        } else if (cause.response.status >= 500) {
          setError("El backend falló al iniciar sesión. Revisa su consola y la configuración de base de datos y JWT.");
        } else {
          const detail: unknown = cause.response.data?.detail;
          setError(typeof detail === "string" ? detail : "No se pudo iniciar sesión. Revisa el correo, contraseña y rol.");
        }
      } else {
        setError(cause instanceof Error ? cause.message : "No se pudo iniciar sesión.");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading, error };
}