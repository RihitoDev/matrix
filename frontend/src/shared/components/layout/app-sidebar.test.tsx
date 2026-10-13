import { cleanup, render, screen, within } from "@testing-library/react";
import { House } from "lucide-react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SIDEBAR_NAVIGATION } from "@/shared/config/navigation.config";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import type { AppSidebarProps } from "@/shared/types/app-sidebar-props.types";
import { AppSidebar } from "./app-sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/home",
}));

function renderSidebar(props: AppSidebarProps = {}) {
  return render(
    <SidebarProvider>
      <AppSidebar {...props} />
    </SidebarProvider>,
  );
}

describe("AppSidebar", () => {
  beforeEach(() => {
    stubMatchMedia();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the brand without an identity footer when no user is provided", () => {
    renderSidebar();

    expect(screen.getByText("UMSSY")).toBeDefined();
    expect(screen.getByText("Universidad para el futuro")).toBeDefined();
    expect(screen.queryByText("Alejandro Vargas")).toBeNull();
    expect(screen.queryByText("Administrador")).toBeNull();
    expect(document.querySelector('[data-slot="sidebar-footer"]')).toBeNull();
  });

  it("renders the mentorship group with its two routes", () => {
    renderSidebar();

    const navigation = screen.getByRole("navigation", { name: "Menú principal" });
    expect(within(navigation).getByText("Mentorías")).toBeDefined();
  });

  it("links Mi perfil to the profile page in the default navigation", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Mi perfil" }).getAttribute("href")).toBe("/profile");
  });

  it("does not render routes that are not implemented", () => {
    renderSidebar();

    const navigation = screen.getByRole("navigation", { name: "Menú principal" });
    expect(within(navigation).queryByText("Empleos")).toBeNull();
  });

  it("renders one item per entry of the default navigation", () => {
    renderSidebar();

    const navigation = screen.getByRole("navigation", { name: "Menú principal" });
    const topLevelItems = within(navigation)
      .queryAllByRole("listitem")
      .filter((item) => item.getAttribute("data-slot") === "sidebar-menu-item");
    expect(topLevelItems).toHaveLength(SIDEBAR_NAVIGATION.length);
  });

  it("renders the items and user received by props", () => {
    renderSidebar({
      items: [{ label: "Inicio", icon: House, href: "/home" }],
      user: { fullName: "María Pérez", role: "Egresada" },
    });

    expect(screen.getByRole("link", { name: "Inicio" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByText("María Pérez")).toBeDefined();
    expect(screen.getByText("MP")).toBeDefined();
  });
});