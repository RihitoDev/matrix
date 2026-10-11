"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { apiClient } from "@/shared/services/api-client";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";
import { isPublicPath } from "../utils/route-access";
import { buildLoginUrl } from "../utils/safe-next-path";
import { endSession } from "../utils/session";
import { setSessionMarker } from "../utils/session-cookie";

type GateState = "checking" | "open" | "login";

const subscribe = () => () => undefined;
const currentPath = () => `${window.location.pathname}${window.location.search}`;

export function SessionGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const open = isPublicPath(pathname ?? "");

  const state = useSyncExternalStore<GateState>(
    subscribe,
    () => (open ? "open" : getAccessToken() ? "open" : "login"),
    () => "checking",
  );

  useEffect(() => {
    if (open) return;
    if (state === "login") {
      endSession();
      router.replace(buildLoginUrl(currentPath()));
      return;
    }
    if (state === "open") setSessionMarker();

    const interceptorId = apiClient.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          endSession();
          router.replace(buildLoginUrl(currentPath()));
        }
        return Promise.reject(error);
      },
    );
    return () => apiClient.interceptors.response.eject(interceptorId);
  }, [open, state, router]);

  return state === "open" ? <>{children}</> : null;
}
