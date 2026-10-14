"use client";

import { useAuth } from "@/shared/contexts/auth-context";
import type { RoleGateProps } from "@/shared/types/role-gate-props.types";

export function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { roles, isLoading } = useAuth();

  if (isLoading) return <p role="status">Verificando permisos...</p>;
  if (!roles.some((role) => allowedRoles.includes(role))) {
    return <p role="alert">No tienes permisos para acceder a esta sección.</p>;
  }

  return children;
}
