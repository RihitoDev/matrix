import { QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactNode } from "react";
import { createQueryClient } from "../services/query-client";

export function renderWithQuery(ui: ReactNode, options?: RenderOptions) {
  const client = createQueryClient();
  const CustomWrapper = options?.wrapper;
  function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{CustomWrapper ? <CustomWrapper>{children}</CustomWrapper> : children}</QueryClientProvider>;
  }
  const result = render(ui, { ...options, wrapper: QueryWrapper });
  return { ...result, client };
}
