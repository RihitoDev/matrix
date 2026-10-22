"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { endSession } from "../utils/session";
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return function handleLogout() {
    endSession();
    queryClient.clear();
    router.replace("/login");
  };
}
