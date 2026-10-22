import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderWithQuery } from "@/shared/testing/render-with-query";
import { saveAccessToken, getAccessToken, clearAccessToken } from "@/shared/services/storage/access-token-storage";
import { AccountMenu } from "./account-menu";
const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
afterEach(() => { cleanup(); clearAccessToken(); vi.clearAllMocks(); });
describe("Account menu", () => {
  it("offers profile access without repeating area or section navigation", async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccountMenu roles={["titulado"]} />);
    const trigger = screen.getByRole("button", { name: "Mi cuenta" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menuitem", { name: "Mi perfil" })).toHaveAttribute("href", "/profile");
    expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    for (const name of ["Inicio", "Trayectoria", "Mi disponibilidad", "Mis inscripciones", "Datos personales"]) {
      expect(screen.queryByRole("menuitem", { name })).not.toBeInTheDocument();
    }
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  });
  it("does not expose a profile to an administrative-only account", async () => {
    const user = userEvent.setup();
    renderWithQuery(<AccountMenu roles={["administrativo"]} />);
    await user.click(screen.getByRole("button", { name: "Mi cuenta" }));
    expect(await screen.findByRole("menuitem", { name: "Cerrar sesión" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Mi perfil" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Solicitudes de acceso" })).not.toBeInTheDocument();
  });
  it("closes the session and removes private cached data", async () => {
    saveAccessToken("test-token");
    const user = userEvent.setup();
    const { client } = renderWithQuery(<AccountMenu roles={["mentor"]} />);
    client.setQueryData(["private-data"], { name: "Usuario" });
    await user.click(screen.getByRole("button", { name: "Mi cuenta" }));
    await user.click(await screen.findByRole("menuitem", { name: "Cerrar sesión" }));
    expect(getAccessToken()).toBeNull();
    expect(client.getQueryCache().getAll()).toHaveLength(0);
    expect(replace).toHaveBeenCalledWith("/login");
  });
});
