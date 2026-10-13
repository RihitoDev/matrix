import { cloneElement, type ReactElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import RadarProfilePage from "./page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/perfil/radar",
}));

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();

  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactElement<{ width: number; height: number }> }) =>
      cloneElement(children, { width: 600, height: 440 }),
  };
});

describe("RadarProfilePage", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders the affinity radar view of the profile", () => {
    render(<RadarProfilePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Carlos Mendoza Ríos" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Desglose vectorial de afinidad" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Desglose por área" })).toBeDefined();
  });
});
