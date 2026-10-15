"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { apiClient, isApiError } from "@/shared/services/api-client";
import { subscribeAccessToken } from "@/shared/services/storage/access-token-storage";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";
import { buildLoginUrl } from "../utils/safe-next-path";
import { endSession } from "../utils/session";
import { setSessionMarker } from "../utils/session-cookie";

type GateState = "checking" | "open" | "login";

const currentPath = () => `${window.location.pathname}${window.location.search}`;

export function SessionGate({ children }: { children: ReactNode }) {
  const router = useRouter();

  const state = useSyncExternalStore<GateState>(
    subscribeAccessToken,
    () => (getAccessToken() ? "open" : "login"),
    () => "checking",
  );

  useEffect(() => {
    if (state === "login") {
      endSession();
      router.replace(buildLoginUrl(currentPath()));
      return;
    }
    if (state === "open") setSessionMarker();

    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if (isApiError(error) && error.response?.status === 401) {
          endSession();
          router.replace(buildLoginUrl(currentPath()));
        }
        return Promise.reject(error);
      },
    );
    return () => apiClient.interceptors.response.eject(interceptorId);
  }, [state, router]);

  return state === "open" ? <>{children}</> : null;
}
