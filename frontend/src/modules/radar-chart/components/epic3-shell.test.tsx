import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import { Epic3Shell } from "./epic3-shell";

const navigation = vi.hoisted(() => ({ pathname: "/perfil/radar" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

function renderShellAt(pathname: string) {
  navigation.pathname = pathname;

  render(
    <Epic3Shell>
      <p>Contenido de la pantalla</p>
    </Epic3Shell>,
  );
}

describe("Epic3Shell", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the content next to the Epic 3 menu and its user", () => {
    renderShellAt("/perfil/radar");

    const menu = within(screen.getByRole("navigation", { name: "Menú principal" }));

    expect(screen.getByText("Contenido de la pantalla")).toBeDefined();
    expect(screen.getByText("Carlos Mendoza Ríos")).toBeDefined();
    expect(menu.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
  "/perfil/radar",
  "/affinity-radar/review-queue",
  "/matching",
  "/area-detail-interaction-preview",
  "/area-detail-preview",
    ]);
  });

  it.each([
  ["/perfil/radar", "Mi Perfil"],
  ["/affinity-radar/review-queue", "Cola de revisión"],
  ["/matching", "Matching"],
  ["/area-detail-interaction-preview", "Detalle por área"],
  ["/area-detail-preview", "Panel de detalle"],
  ])("marks only the item of %s as active", (pathname, label) => {
  renderShellAt(pathname);

  const menu = within(screen.getByRole("navigation", { name: "Menú principal" }));
  const activeLinks = menu
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current") === "page");

  expect(activeLinks).toHaveLength(1);
  expect(activeLinks[0].textContent).toBe(label);
  });

  it("marks no item as active on the QA index", () => {
    renderShellAt("/");

    const menu = within(screen.getByRole("navigation", { name: "Menú principal" }));

    menu.getAllByRole("link").forEach((link) => {
      expect(link.getAttribute("aria-current")).toBeNull();
    });
  });
});
