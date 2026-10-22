import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NavigationSearch } from "./navigation-search";
vi.mock("@/shared/contexts/auth-context", () => ({ useAuth: () => ({ roles: ["titulado"] }) }));
afterEach(cleanup);
describe("Navigation search", () => {
  it("opens from the keyboard and finds a permitted task by a common term", async () => {
    render(<NavigationSearch />);
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: "curriculum" } });
    expect(within(dialog).getByRole("link", { name: "Documentos y CV" })).toHaveAttribute("href", "/profile/documents");
    expect(within(dialog).queryByRole("link", { name: "Solicitudes de acceso" })).not.toBeInTheDocument();
  });
  it("shows no results for unknown or unauthorized sections", async () => {
    render(<NavigationSearch />);
    fireEvent.click(screen.getByRole("button", { name: /Buscar sección/ }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: "aprobar" } });
    expect(within(dialog).getByText("No hay secciones con ese nombre.")).toBeInTheDocument();
  });
});
