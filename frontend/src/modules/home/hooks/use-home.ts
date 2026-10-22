"use client";

import { useQuery } from "@tanstack/react-query";
import { homeService } from "../services/home.service";

export function useHome() {
  const query = useQuery({ queryKey: ["home", "welcome"], queryFn: () => homeService.getWelcomeMessage() });
  return { backendMessage: query.isError ? "No se pudo conectar con el servidor." : query.data ?? "Cargando..." };
}
