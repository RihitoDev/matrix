import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/shared/components/layout/app-sidebar";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import { REPORTS_NAVIGATION_ITEM } from "./reports-navigation.constants";

vi.mock("next/navigation", () => ({
  usePathname: () => "/backoffice/solicitudes",
}));

describe("REPORTS_NAVIGATION_ITEM", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("muestra los reportes del backoffice dentro del menú de reportes analíticos", () => {
    render(
      <SidebarProvider>
        <AppSidebar items={[REPORTS_NAVIGATION_ITEM]} />
      </SidebarProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Reportes Analíticos" }));

    expect(screen.getByRole("link", { name: "Reporte de usuarios registrados" }).getAttribute("href")).toBe(
      "/backoffice/reports/registered-users",
    );
    expect(screen.getByRole("link", { name: "Reporte de usuarios rechazados" }).getAttribute("href")).toBe(
      "/backoffice/reports/rejected-users",
    );
    expect(screen.getByRole("link", { name: "Historial de reportes generados" }).getAttribute("href")).toBe(
      "/backoffice/reports/history",
    );
  });
});
