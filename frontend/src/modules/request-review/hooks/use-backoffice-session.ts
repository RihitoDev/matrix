"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { BACKOFFICE_ROLE, LOGIN_PATH } from "../constants/request-review.constants";
import { clearSession, getRoleTag, getSessionToken } from "../utils/session";
import type { BackofficeSessionState } from "../types/backoffice-session.types";

const subscribe = () => () => undefined;

function readSession(): BackofficeSessionState {
  const token = getSessionToken();
  if (!token) return "login";
  return getRoleTag(token) === BACKOFFICE_ROLE ? "allowed" : "forbidden";
}

// Sin token va al login; con otro rol vuelve al inicio. La autorización real la hace el backend
export function useBackofficeSession() {
  const router = useRouter();
  const state = useSyncExternalStore<BackofficeSessionState>(subscribe, readSession, () => "checking");

  useEffect(() => {
    if (state === "login") router.replace(LOGIN_PATH);
    if (state === "forbidden") router.replace("/");
  }, [state, router]);

  function logout() {
    clearSession();
    router.replace(LOGIN_PATH);
  }

  return { state, logout };
}
