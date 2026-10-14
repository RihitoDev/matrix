import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PublicLayout from "./layout";
import AppLayout from "../(app)/layout";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/future-page",
  useRouter: () => ({ replace }),
}));

describe("Authentication by route group", () => {
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    window.history.replaceState({}, "", "/");
    replace.mockReset();
  });

  it("allows an anonymous visitor to a new public page without a route list", () => {
    window.history.replaceState({}, "", "/future-page");
    render(<PublicLayout><p>Contenido público</p></PublicLayout>);

    expect(screen.getByText("Contenido público")).toBeDefined();
    expect(replace).not.toHaveBeenCalled();
  });

  it("requires a session when that page is wrapped in the app layout", () => {
    window.history.replaceState({}, "", "/future-page");
    render(<AppLayout><p>Contenido privado</p></AppLayout>);

    expect(screen.queryByText("Contenido privado")).toBeNull();
    expect(replace).toHaveBeenCalledWith("/login?next=%2Ffuture-page");
  });
});
