import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AppLayout from "./layout";

const { route } = vi.hoisted(() => ({ route: { pathname: "/profile" } }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

vi.mock("@/shared/components/layout", () => ({
  AppShell: ({ children, items, fullBleed }: { children: ReactNode; items?: { label: string }[]; fullBleed?: boolean }) => (
    <div data-testid="app-shell" data-navigation={items?.map((item) => item.label).join(",") ?? "general"} data-full-bleed={String(!!fullBleed)}>{children}</div>
  ),
}));

describe("AppLayout", () => {
  afterEach(() => {
    cleanup();
    route.pathname = "/profile";
  });

  it("wraps every authenticated page with the app shell", () => {
    render(
      <AppLayout>
        <p>page-content</p>
      </AppLayout>,
    );

    expect(screen.getByTestId("app-shell")).toContainElement(screen.getByText("page-content"));
    expect(screen.getByTestId("app-shell")).toHaveAttribute("data-navigation", "general");
  });

  it.each([
    ["/events", "true"],
    ["/events/my-passes", "false"],
  ])("uses the events navigation on %s", (pathname, fullBleed) => {
    route.pathname = pathname;
    render(<AppLayout><p>event-content</p></AppLayout>);

    expect(screen.getByTestId("app-shell")).toContainElement(screen.getByText("event-content"));
    expect(screen.getByTestId("app-shell")).toHaveAttribute("data-navigation", "Talleres,Mis pases");
    expect(screen.getByTestId("app-shell")).toHaveAttribute("data-full-bleed", fullBleed);
  });
});
