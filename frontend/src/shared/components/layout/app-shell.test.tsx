import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import { AppShell } from "./app-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/home",
}));

describe("AppShell", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the sidebar next to the page content", () => {
    render(
      <AppShell>
        <p>Contenido de la página</p>
      </AppShell>,
    );

    expect(screen.getByText("UMSSY")).toBeDefined();
    expect(screen.getByText("Contenido de la página")).toBeDefined();
    expect(document.querySelector('[data-slot="sidebar-footer"]')).toBeNull();
    expect(screen.queryByText("Alejandro Vargas")).toBeNull();
  });

  it("passes a provided user to the sidebar", () => {
    render(
      <AppShell user={{ fullName: "María Pérez", role: "Egresada" }}>
        Contenido
      </AppShell>,
    );
    expect(screen.getByText("María Pérez")).toBeInTheDocument();
    expect(screen.getByText("Egresada")).toBeInTheDocument();
  });

  it("closes and opens the sidebar with the menu button", () => {
    render(
      <AppShell>
        <p>Contenido de la página</p>
      </AppShell>,
    );

    const sidebar = document.querySelector('[data-slot="sidebar"]');
    const closeButton = screen.getByRole("button", { name: "Cerrar menú" });
    expect(closeButton.getAttribute("aria-expanded")).toBe("true");
    expect(sidebar?.getAttribute("data-state")).toBe("expanded");

    fireEvent.click(closeButton);
    const openButton = screen.getByRole("button", { name: "Abrir menú" });
    expect(openButton.getAttribute("aria-expanded")).toBe("false");
    expect(sidebar?.getAttribute("data-state")).toBe("collapsed");

    fireEvent.click(openButton);
    expect(screen.getByRole("button", { name: "Cerrar menú" })).toBeDefined();
    expect(sidebar?.getAttribute("data-state")).toBe("expanded");
  });
});
