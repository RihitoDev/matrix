import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppLayout from "./layout";

vi.mock("@/shared/components/layout", () => ({
  AppRouteLayout: ({ children }: { children: ReactNode }) => (
    <div data-testid="route-layout">{children}</div>
  ),
}));

describe("AppLayout", () => {
  afterEach(() => cleanup());

  it("delegates shell composition to the shared route layout", () => {
    render(<AppLayout><p>Contenido</p></AppLayout>);

    expect(screen.getByTestId("route-layout")).toContainElement(screen.getByText("Contenido"));
  });
});
