"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/contexts/auth-context";
import { NEXT_PARAM } from "../constants/session.constants";
import { resolvePostLoginPath } from "../utils/resolve-post-login-path";

export function useRedirectAuthenticated(enabled = true) {
  const router = useRouter();
  const { roles, isLoading } = useAuth();
  const rolesKey = roles.join(",");
  const redirectedFor = useRef<string | null>(null);

  useEffect(() => {
    if (rolesKey === "") redirectedFor.current = null;
    if (!enabled || isLoading || rolesKey === "" || redirectedFor.current === rolesKey) return;
    redirectedFor.current = rolesKey;
    const next = new URLSearchParams(window.location.search).get(NEXT_PARAM);
    router.replace(resolvePostLoginPath(rolesKey.split(","), next));
  }, [enabled, isLoading, rolesKey, router]);
}
