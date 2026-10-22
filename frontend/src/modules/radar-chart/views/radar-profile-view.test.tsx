import { cloneElement, type ReactElement } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import { RADAR_AREA_SCORES } from "../data/radar-profile.data";
import { RadarProfileView } from "./radar-profile-view";
import AppLayout from "@/app/(app)/layout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/profile/radar",
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/modules/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/auth")>();
  return { ...actual, SessionUserCard: () => null };
});

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
    sessionStorage.clear();
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

  it("renders only one app navigation when wrapped by the route layout", () => {
    sessionStorage.setItem("accessToken", `h.${btoa(JSON.stringify({ roleTag: "titulado" }))}.s`);
    render(<AppLayout><RadarProfileView /></AppLayout>);

    expect(screen.getAllByRole("navigation", { name: "Menú principal" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Secciones de Perfil profesional" })).toBeDefined();
    expect(screen.queryByRole("navigation", { name: "Ruta de navegación" })).not.toBeInTheDocument();

  });

  it("does not make HTTP requests", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    render(<RadarProfileView />);

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
