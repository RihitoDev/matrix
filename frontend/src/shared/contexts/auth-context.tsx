"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { isApiError } from "@/shared/services/api-client";
import { authService, endSession, getSessionRoles } from "@/modules/auth";
import { getAccessToken, subscribeAccessToken } from "@/shared/services/storage/access-token-storage";
import type { AuthContextValue } from "@/shared/types/auth-context-value.types";
import type { AuthProviderProps } from "@/shared/types/auth-provider-props.types";

const AuthContext = createContext<AuthContextValue | null>(null);
const getServerToken = () => null;

export function AuthProvider({ children }: AuthProviderProps) {
  const accessToken = useSyncExternalStore(subscribeAccessToken, getAccessToken, getServerToken);
  const session = useQuery({
    queryKey: ["auth-session", accessToken],
    queryFn: () => authService.getSession(accessToken),
    enabled: Boolean(accessToken),
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (isApiError(session.error) && session.error.response?.status === 401) endSession();
  }, [session.error]);

  async function refreshRoles() {
    if (!accessToken) return;
    await session.refetch();
  }

  return (
    <AuthContext.Provider value={{
      roles: accessToken ? session.data?.roles ?? getSessionRoles(accessToken) : [],
      isLoading: Boolean(accessToken) && session.isPending,
      refreshRoles,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  const accessToken = useSyncExternalStore(subscribeAccessToken, getAccessToken, getServerToken);
  return context ?? { roles: getSessionRoles(accessToken), isLoading: false, refreshRoles: async () => {} };
}
