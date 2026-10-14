import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { House } from "lucide-react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { RoleTag } from "@/shared/types/role-tag.types";
import { ROLE_TAGS } from "@/shared/constants/roles.constants";
import { SIDEBAR_NAVIGATION } from "@/shared/config/navigation.config";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import type { AppSidebarProps } from "@/shared/types/app-sidebar-props.types";
import { AppSidebar } from "./app-sidebar";

const sessionRoles = vi.hoisted(() => ({ current: [] as readonly RoleTag[] }));

vi.mock("@/shared/contexts/auth-context", () => ({
  useAuth: () => ({ roles: sessionRoles.current, isLoading: false, refreshRoles: vi.fn() }),
}));

const { route } = vi.hoisted(() => ({ route: { pathname: "/home" } }));
vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
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
    route.pathname = "/home";
    sessionRoles.current = ROLE_TAGS;
    stubMatchMedia();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the brand without an identity footer when no user is provided", () => {
    const { container } = renderSidebar();

    expect(screen.getByText("UMSSY")).toBeDefined();
    const icon = container.querySelector('[data-slot="sidebar-header"] img');
    expect(icon).toBeInTheDocument();
    const iconUrl = new URL(icon?.getAttribute("src") ?? "", "http://localhost");
    expect(iconUrl.searchParams.get("url") ?? iconUrl.pathname).toBe("/icons/icon-192x192.png");
    expect(screen.getByText("Universidad para el futuro")).toBeDefined();
    expect(screen.queryByText("Alejandro Vargas")).toBeNull();
    expect(screen.queryByText("Administrador")).toBeNull();
    expect(document.querySelector('[data-slot="sidebar-footer"]')).toBeNull();
  });

  it("renders the mentorship group with its routes", () => {
    renderSidebar();

    const navigation = screen.getByRole("navigation", { name: "Menú principal" });
    expect(within(navigation).getByText("Mentorías")).toBeDefined();
  });

  it("links Mi disponibilidad to the mentor availability page inside Mentorías", () => {
    renderSidebar();

    fireEvent.click(screen.getByRole("button", { name: "Mentorías" }));

    expect(screen.getByRole("link", { name: "Mi disponibilidad" }).getAttribute("href")).toBe(
      "/mentor/availability",
    );
  });

  it("groups the profile and radar routes under Mi perfil", () => {
    renderSidebar();
    fireEvent.click(screen.getByRole("button", { name: "Mi perfil" }));

    expect(screen.getByRole("link", { name: "Resumen del perfil" }).getAttribute("href")).toBe("/profile");
    expect(screen.getByRole("link", { name: "Radar de afinidad" })).toHaveAttribute("href", "/profile/radar");
    expect(screen.queryByText("Mi radar")).toBeNull();
  });

  it("opens Mi perfil and highlights only its radar route", () => {
    route.pathname = "/profile/radar";
    renderSidebar();
    expect(screen.getByRole("button", { name: "Mi perfil" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Radar de afinidad" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Resumen del perfil" })).not.toHaveAttribute("aria-current");
  });

  it.each([
    ["/mentors/example-id/availability", "Mentorías", "Directorio de mentorías"],
    ["/mentorship", "Mentorías", "Mi participación"],
    ["/area-detail-preview", "Reclutadores", "Buscar candidatos"],
  ])("keeps %s inside its parent navigation flow", (pathname, group, link) => {
    route.pathname = pathname;
    renderSidebar();
    expect(screen.getByRole("button", { name: group })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: link })).toHaveAttribute("aria-current", "page");
  });

  it("opens the workshops group with links to existing views", () => {
    renderSidebar();
    fireEvent.click(screen.getByRole("button", { name: "Talleres" }));
    expect(screen.getByRole("link", { name: "Talleres disponibles" })).toHaveAttribute("href", "/events");
    expect(screen.getByRole("link", { name: "Mis inscripciones" })).toHaveAttribute("href", "/events/my-passes");
  });

  it.each([
    ["/events", "Talleres disponibles", "Mis inscripciones"],
    ["/events/my-passes", "Mis inscripciones", "Talleres disponibles"],
  ])("expands workshops and marks only the selected route on %s", (pathname, active, inactive) => {
    route.pathname = pathname;
    renderSidebar();
    expect(screen.getByRole("button", { name: "Talleres" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: active })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: inactive })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("button", { name: "Mi perfil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mentorías" })).toBeInTheDocument();
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
    expect(within(navigation).queryByRole("link", { name: "Inicio" })).toBeNull();
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
  it('updates enabled functions when a graduate gains the mentor role', () => {
    sessionRoles.current = ['titulado'];
    const view = renderSidebar();
    fireEvent.click(screen.getByRole('button', { name: 'Mentorías' }));
    expect(screen.queryByRole('link', { name: 'Mi disponibilidad' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Solicitudes' })).toBeNull();

    sessionRoles.current = ['titulado', 'mentor'];
    view.rerender(<SidebarProvider><AppSidebar /></SidebarProvider>);
    expect(screen.getByRole('link', { name: 'Mi disponibilidad' })).toHaveAttribute('href', '/mentor/availability');
    expect(screen.getAllByRole('link', { name: 'Chat' })).toHaveLength(1);

    sessionRoles.current = ['titulado'];
    view.rerender(<SidebarProvider><AppSidebar /></SidebarProvider>);
    expect(screen.queryByRole('link', { name: 'Mi disponibilidad' })).toBeNull();
  });

});
