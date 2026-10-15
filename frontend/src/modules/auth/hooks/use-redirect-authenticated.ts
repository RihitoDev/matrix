"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/shared/services/storage/access-token-storage";
import { NEXT_PARAM } from "../constants/session.constants";
import { getSessionRoles } from "../utils/get-session-roles";
import { resolvePostLoginPath } from "../utils/resolve-post-login-path";

export function useRedirectAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    const roles = getSessionRoles(getAccessToken());
    if (roles.length === 0) return;
    const next = new URLSearchParams(window.location.search).get(NEXT_PARAM);
    router.replace(resolvePostLoginPath(roles, next));
  }, [router]);
}
