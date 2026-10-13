"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { buildLoginUrl, endSession } from "@/modules/auth";
import { BACKOFFICE_ROLE, LOGIN_PATH } from "../constants/request-review.constants";
import { getRoleTag, getSessionToken } from "../utils/session";
import type { BackofficeSessionState } from "../types/backoffice-session.types";

const subscribe = () => () => undefined;

function readSession(): BackofficeSessionState {
  const token = getSessionToken();
  if (!token) return "login";
  return getRoleTag(token) === BACKOFFICE_ROLE ? "allowed" : "forbidden";
}

export function useBackofficeSession() {
  const router = useRouter();
  const pathname = usePathname();
  const state = useSyncExternalStore<BackofficeSessionState>(subscribe, readSession, () => "checking");

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
