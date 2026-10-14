"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/shared/contexts/auth-context";
import { buildLoginUrl, endSession } from "@/modules/auth";
import { BACKOFFICE_ROLE, LOGIN_PATH } from "../constants/request-review.constants";
import { getSessionToken } from "../utils/session";
import type { BackofficeSessionState } from "../types/backoffice-session.types";

const subscribe = () => () => undefined;

function readSession(hasAdministrativeRole: boolean): BackofficeSessionState {
  const token = getSessionToken();
  if (!token) return "login";
  return hasAdministrativeRole ? "allowed" : "forbidden";
}

export function useBackofficeSession() {
  const router = useRouter();
  const pathname = usePathname();
  const { roles, isLoading } = useAuth();
  const state = useSyncExternalStore<BackofficeSessionState>(subscribe, () => isLoading ? "checking" : readSession(roles.includes(BACKOFFICE_ROLE)), () => "checking");

  useEffect(() => {
    if (state === "login") {
      endSession();
      router.replace(buildLoginUrl(pathname));
    }
    if (state === "forbidden") router.replace("/");
  }, [state, router, pathname]);

  function logout() {
    endSession();
    router.replace(LOGIN_PATH);
  }

  return { state, logout };
}
