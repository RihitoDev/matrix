import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stubMatchMedia } from "@/shared/testing/stub-match-media";
import { requestReviewService } from "../../services/request-review.service";
import { BackofficeShell } from "./backoffice-shell";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/backoffice/solicitudes",
  useRouter: () => ({ replace }),
}));

const tokenFor = (roleTag: string) => `h.${btoa(JSON.stringify({ sub: "u1", roleTag }))}.s`;

describe("BackofficeShell", () => {
  beforeEach(() => {
    stubMatchMedia();
    replace.mockReset();
  });
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("un administrativo ve el layout con la opción Solicitudes y su contenido", () => {
    sessionStorage.setItem("accessToken", tokenFor("administrativo"));
    render(
      <BackofficeShell>
        <p>Contenido del backoffice</p>
      </BackofficeShell>,
    );

    expect(screen.getByText("Contenido del backoffice")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Solicitudes" })).toHaveAttribute("href", "/backoffice/solicitudes");
    expect(screen.getByText("Personal administrativo")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("sin token redirige al login y no muestra el contenido", async () => {
    render(
      <BackofficeShell>
        <p>Contenido del backoffice</p>
      </BackofficeShell>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login?next=%2Fbackoffice%2Fsolicitudes"));
    expect(screen.queryByText("Contenido del backoffice")).toBeNull();
  });

  it.each(["titulado", "estudiante", "mentor", "empresa"])("el rol %s es redirigido al inicio", async (role) => {
    sessionStorage.setItem("accessToken", tokenFor(role));
    render(
      <BackofficeShell>
        <p>Contenido del backoffice</p>
      </BackofficeShell>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
    expect(screen.queryByText("Contenido del backoffice")).toBeNull();
  });

  it("Cerrar sesión borra el token y va al login", () => {
    sessionStorage.setItem("accessToken", tokenFor("administrativo"));
    render(
      <BackofficeShell>
        <p>Contenido</p>
      </BackofficeShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cerrar sesión/ }));

    expect(sessionStorage.getItem("accessToken")).toBeNull();
    expect(replace).toHaveBeenCalledWith("/login");
  });

  describe("barra lateral y conteo de pendientes", () => {
    const listRequests = vi.spyOn(requestReviewService, "listRequests");
    beforeEach(() => listRequests.mockReset());

    it("muestra la insignia de pendientes con el total que devuelve el listado (limit=1)", async () => {
      sessionStorage.setItem("accessToken", tokenFor("administrativo"));
      listRequests.mockResolvedValue({ ok: true, data: { items: [], total: 18, page: 1, offset: 0 } });
      render(
        <BackofficeShell>
          <p>Contenido</p>
        </BackofficeShell>,
      );

      expect(await screen.findByLabelText("18 pendientes")).toHaveTextContent("18");
      expect(listRequests).toHaveBeenCalledWith("pending", 1, 1);
    });

    it("si el conteo falla no hay insignia ni error", async () => {
      sessionStorage.setItem("accessToken", tokenFor("administrativo"));
      listRequests.mockResolvedValue({ ok: false, status: 0, message: "sin red" });
      render(
        <BackofficeShell>
          <p>Contenido</p>
        </BackofficeShell>,
      );

      await waitFor(() => expect(listRequests).toHaveBeenCalled());
      expect(screen.queryByLabelText(/pendientes/)).toBeNull();
      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("sin sesión no pide el conteo", () => {
      render(
        <BackofficeShell>
          <p>Contenido</p>
        </BackofficeShell>,
      );
      expect(listRequests).not.toHaveBeenCalled();
    });

    it("la barra tiene la marca de texto, el pie con iniciales y no menciona egresados ni el lema", async () => {
      sessionStorage.setItem("accessToken", tokenFor("administrativo"));
      listRequests.mockResolvedValue({ ok: false, status: 0, message: "x" });
      render(
        <BackofficeShell>
          <p>Contenido</p>
        </BackofficeShell>,
      );

      expect(screen.getByText("UMSSY")).toBeInTheDocument();
      expect(screen.getByText("Backoffice de verificación")).toBeInTheDocument();
      expect(screen.getByText("PA")).toBeInTheDocument();
      expect(screen.queryByText("Registro de auditoría")).toBeNull();
      const text = document.body.textContent?.toLowerCase() ?? "";
      expect(text).not.toContain("egres");
      expect(text).not.toContain("certificado de egreso");
      expect(text).not.toContain("universidad para el futuro");
      await waitFor(() => expect(listRequests).toHaveBeenCalled());
    });
  });

  describe("estructura del layout", () => {
    const listRequests = vi.spyOn(requestReviewService, "listRequests");
    beforeEach(() => listRequests.mockResolvedValue({ ok: false, status: 0, message: "x" }));

    it("usa un solo AppShell: una barra lateral de 248 px y el botón de menú solo en móvil", () => {
      sessionStorage.setItem("accessToken", tokenFor("administrativo"));
      const { container } = render(
        <BackofficeShell>
          <p>Contenido</p>
        </BackofficeShell>,
      );

      expect(container.querySelectorAll("[data-slot='sidebar']").length).toBeLessThanOrEqual(1);
      expect(container.querySelector("[style*='--sidebar-width: 15.5rem']")).not.toBeNull();
      const toggle = screen.getByRole("button", { name: /menú/i });
      expect(toggle.parentElement).toHaveClass("md:hidden");
      expect(screen.getByText("Contenido").parentElement).not.toHaveClass("px-8");
    });

    it("la barra lateral no muestra un chevron junto a la marca y el ítem activo permite la barra roja en el borde", () => {
      sessionStorage.setItem("accessToken", tokenFor("administrativo"));
      render(
        <BackofficeShell>
          <p>Contenido</p>
        </BackofficeShell>,
      );

      const brand = screen.getByText("UMSSY").parentElement as HTMLElement;
      expect(brand.querySelector("svg")).toBeNull();
      expect(screen.queryByText("›")).toBeNull();
      expect(screen.getByRole("link", { name: /Solicitudes/ }).className).toContain("overflow-visible");
      expect(screen.getByRole("link", { name: /Solicitudes/ }).className).toContain("data-active:before:-left-3");
    });
  });
});
