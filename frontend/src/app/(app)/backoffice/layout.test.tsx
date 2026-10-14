import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import AppLayout from "../layout";
import BackofficeLayout from "./layout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/backoffice/solicitudes",
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/modules/request-review/hooks/use-backoffice-session", () => ({
  useBackofficeSession: () => ({ state: "allowed", logout: vi.fn() }),
}));

vi.mock("@/modules/request-review/hooks/use-status-counts", () => ({
  useStatusCounts: () => ({ pending: 0 }),
}));

describe("BackofficeLayout inside AppLayout", () => {
  beforeEach(() => stubMatchMedia());
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders one administrative navigation without nesting the general shell", () => {
    render(
      <AppLayout>
        <BackofficeLayout><p>Contenido administrativo</p></BackofficeLayout>
      </AppLayout>,
    );

    expect(screen.getAllByRole("navigation", { name: "Menú principal" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Solicitudes/ })).toHaveAttribute("href", "/backoffice/solicitudes");
    expect(screen.getByText("Contenido administrativo")).toBeDefined();
    expect(screen.queryByRole("link", { name: "Mi perfil" })).toBeNull();
  });
});
