import { cloneElement, type ReactElement } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import { RADAR_AREA_SCORES } from "../data/radar-profile.data";
import { RadarProfileView } from "./radar-profile-view";

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactElement<{ width: number; height: number }> }) =>
      cloneElement(children, { width: 600, height: 440 }),
  };
});

describe("RadarProfileView", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("renders the header, the KPI cards, the radar and the breakdown", () => {
    render(<RadarProfileView />);

    expect(screen.getByRole("heading", { level: 1, name: "Carlos Mendoza Ríos" })).toBeDefined();
    expect(screen.getByRole("list", { name: "Resumen del perfil" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Desglose vectorial de afinidad" })).toBeDefined();

    const breakdown = within(screen.getByRole("complementary", { name: "Desglose por área" }));
    RADAR_AREA_SCORES.forEach((area) => {
      expect(screen.getByTestId(`radar-dot-${area.id}`)).toBeDefined();
      expect(breakdown.getByText(area.name)).toBeDefined();
    });
    expect(breakdown.getByText("6,25")).toBeDefined();
  });

  it("shows the fifth profile tab and does not create another sidebar", () => {
    render(<RadarProfileView />);

    expect(screen.getByRole("link", { name: "Mi Perfil" }).getAttribute("href")).toBe("/profile");
    expect(screen.getByRole("navigation", { name: "Ruta de navegación" }).textContent).toContain("Radar de afinidad");
    expect(screen.getByRole("navigation", { name: "Secciones del perfil" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Radar de afinidad" }).getAttribute("aria-current")).toBe("page");
    expect(document.querySelector('[data-slot="sidebar"]')).toBeNull();
  });

  it("does not make HTTP requests", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    render(<RadarProfileView />);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
