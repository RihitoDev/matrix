"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { subscribeAccessToken } from "@/shared/services/storage/access-token-storage";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";
import { buildLoginUrl } from "../utils/safe-next-path";
import { endSession } from "../utils/session";
import { setSessionMarker } from "../utils/session-cookie";

import type { SessionGateState } from "../types/session-gate-state.types";
import type { SessionGateProps } from "../types/session-gate-props.types";

const currentPath = () => `${window.location.pathname}${window.location.search}`;

export function SessionGate({ children }: SessionGateProps) {
  const router = useRouter();

  const state = useSyncExternalStore<SessionGateState>(
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
  }, [state, router]);

  return state === "open" ? <>{children}</> : null;
}
