import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, type RenderHookOptions } from "@testing-library/react";
import type { ReactNode } from "react";
import { createQueryClient } from "../services/query-client";

export function renderHookWithQuery<Result, Props>(callback: (props: Props) => Result, options?: RenderHookOptions<Props>) {
  const client = createQueryClient();
  function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  return { ...renderHook(callback, { ...options, wrapper: options?.wrapper ?? QueryWrapper }), client };
}
