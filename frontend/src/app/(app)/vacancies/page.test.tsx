import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import AppLayout from "../layout";
import VacanciesPage from "./page";
import VacancyDetailPage from "./[id]/page";
import VacanciesAliasPage from "./vacancies/page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/vacancies",
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock("@/modules/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/auth")>();
  return { ...actual, SessionUserCard: () => null };
});

describe("Vacancy routes", () => {
  beforeEach(() => {
    stubMatchMedia();
    sessionStorage.setItem("accessToken", `h.${btoa(JSON.stringify({ roleTag: "titulado" }))}.s`);
  });
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it.each([VacanciesPage, VacanciesAliasPage])("renders vacancy listings inside one app navigation", (Page) => {
    render(<AppLayout><Page /></AppLayout>);

    expect(screen.getAllByRole("navigation", { name: "Menú principal" })).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Vacantes", level: 1 })).toBeDefined();
    expect(screen.getAllByRole("link", { name: /^Ver detalles de / })[0]).toHaveAttribute("href", "/vacancies/1");
  });

  it("renders resolved vacancy details and links back to the listing", async () => {
    const page = await VacancyDetailPage({ params: Promise.resolve({ id: "1" }) });
    render(<AppLayout>{page}</AppLayout>);

    expect(screen.getAllByRole("navigation", { name: "Menú principal" })).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Desarrollador Web Junior", level: 1 })).toBeDefined();
    expect(screen.getByRole("link", { name: /Volver a vacantes/ })).toHaveAttribute("href", "/vacancies");
  });

  it("keeps the app navigation when a vacancy does not exist", async () => {
    const page = await VacancyDetailPage({ params: Promise.resolve({ id: "missing" }) });
    render(<AppLayout>{page}</AppLayout>);

    expect(within(screen.getByRole("navigation", { name: "Menú principal" })).getByRole("link", { name: "Vacantes" })).toBeDefined();
    expect(screen.getByRole("heading", { name: "Vacante no encontrada" })).toBeDefined();
    expect(screen.getByRole("link", { name: /Volver a vacantes/ })).toHaveAttribute("href", "/vacancies");
  });
});
