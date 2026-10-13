"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function findInternalLink(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  const anchor = target.closest("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target === "_blank" || anchor.hasAttribute("download")) return null;
  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (url.pathname === window.location.pathname) return null;
  return anchor;
}

export function useLeaveGuard(isActive: boolean) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
      const anchor = findInternalLink(event.target);
      if (!anchor) return;
      event.preventDefault();
      event.stopPropagation();
      const url = new URL(anchor.href, window.location.href);
      setPendingHref(`${url.pathname}${url.search}${url.hash}`);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isActive]);

  return {
    isLeaveDialogOpen: pendingHref !== null,
    confirmLeave: () => {
      if (pendingHref) router.push(pendingHref);
      setPendingHref(null);
    },
    cancelLeave: () => setPendingHref(null),
  };
}
