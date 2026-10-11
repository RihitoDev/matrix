import { cleanup, render, screen } from "@testing-library/react";
import { Inbox } from "lucide-react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import { AppShell } from "./app-shell";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

vi.mock("next/navigation", () => ({ usePathname: () => "/backoffice/solicitudes" }));

const ITEMS = [{ label: "Solicitudes", icon: Inbox, href: "/backoffice/solicitudes" }];

describe("props opcionales del layout compartido", () => {
  beforeEach(() => stubMatchMedia());
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("por defecto el AppShell conserva la marca, el botón de menú y el relleno del contenido", () => {
    render(
      <AppShell items={ITEMS} user={{ fullName: "Ana Pérez", role: "Admin" }}>
        <p>Contenido</p>
      </AppShell>,
    );

    expect(screen.getByText("Universidad para el futuro")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /menú/i })).toBeInTheDocument();
    expect(screen.getByText("Ana Pérez")).toBeInTheDocument();
    expect(screen.getByText("Contenido").parentElement).toHaveClass("px-8", "pb-8");
    expect(screen.queryByLabelText(/pendientes/)).toBeNull();
  });

  it("con las props nuevas reemplaza la marca, el pie y la cabecera, y agrega la insignia", () => {
    render(
      <AppShell
        items={ITEMS}
        brand={<p>Marca propia</p>}
        sidebarFooter={<p>Pie propio</p>}
        sidebarItemClassName="clase-extra"
        sidebarItemBadges={{ Solicitudes: <span aria-label="18 pendientes">18</span> }}
        header={<header>Cabecera propia</header>}
        contentClassName=""
        sidebarWidth="15.5rem"
      >
        <p>Contenido</p>
      </AppShell>,
    );

    expect(screen.getByText("Marca propia")).toBeInTheDocument();
    expect(screen.queryByText("Universidad para el futuro")).toBeNull();
    expect(screen.getByText("Pie propio")).toBeInTheDocument();
    expect(screen.getByText("Cabecera propia")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /menú/i })).toBeNull();
    expect(screen.getByLabelText("18 pendientes")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Solicitudes/ })).toHaveClass("clase-extra");
    expect(screen.getByText("Contenido").parentElement).not.toHaveClass("px-8");
  });

  it("el AppSidebar sin props nuevas no agrega insignias ni clases", () => {
    render(
      <SidebarProvider>
        <AppSidebar items={ITEMS} />
      </SidebarProvider>,
    );
    expect(screen.getByRole("link", { name: "Solicitudes" })).not.toHaveClass("clase-extra");
  });
});
