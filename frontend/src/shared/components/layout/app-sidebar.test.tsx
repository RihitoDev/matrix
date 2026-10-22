import { cleanup, render, screen, within } from "@testing-library/react";
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

  it("uses the original logo without inventing a user", () => {
    renderSidebar();
    expect(screen.getByRole("img",{name:"UMSSY, Acreditación y comunidad"})).toHaveAttribute("src","/icons/umssy-logo-web.svg");
    expect(document.querySelector('[data-slot="sidebar-footer"]')).toBeNull();
  });
  it("exposes areas without repeating personal or secondary options", () => {
    renderSidebar();
    for (const [name,href] of [["Inicio","/dashboard"],["Mentorías","/mentorship/mentors"],["Talleres","/events"],["Reportes","/backoffice/reports/registered-users"]]) {
      expect(screen.getByRole("link",{name})).toHaveAttribute("href",href);
    }
    for (const name of ["Mi perfil","Mi disponibilidad","Mis inscripciones","Publicar vacante"]) {
      expect(screen.queryByRole("link",{name})).toBeNull();
    }
  });
  it.each([
    ["/events/my-passes","Talleres"],
    ["/mentor/availability","Mentorías"],
    ["/mentors/example-id/availability","Mentorías"],
    ["/mentorship/orientation","Mentorías"],
    ["/area-detail-preview","Empresas"],
    ["/backoffice/reports/history","Reportes"],
  ])("marks the containing area for %s", (pathname,active) => {
    route.pathname=pathname; renderSidebar();
    expect(screen.getByRole("link",{name:active})).toHaveAttribute("aria-current","page");
    expect(screen.getByRole("navigation",{name:"Menú principal"}).querySelectorAll('[aria-current="page"]')).toHaveLength(1);
  });
  it("renders each authorized navigation entry", () => {
    renderSidebar();
    const navigation=screen.getByRole("navigation",{name:"Menú principal"});
    const top=within(navigation).getAllByRole("listitem").filter((item)=>item.getAttribute("data-slot")==="sidebar-menu-item");
    expect(top).toHaveLength(SIDEBAR_NAVIGATION.length);
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
  it("only shows areas permitted for the current role", () => {
    sessionRoles.current=["estudiante"];
    const view=renderSidebar();
    expect(screen.queryByRole("link",{name:"Reportes"})).toBeNull();
    expect(screen.getByRole("link",{name:"Mentorías"})).toBeInTheDocument();
    sessionRoles.current=["administrativo"];
    view.rerender(<SidebarProvider><AppSidebar /></SidebarProvider>);
    expect(screen.getByRole("link",{name:"Reportes"})).toBeInTheDocument();
    expect(screen.queryByRole("link",{name:"Mentorías"})).toBeNull();
  });
});
