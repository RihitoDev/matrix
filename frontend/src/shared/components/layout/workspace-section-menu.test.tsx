import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { WorkspaceSectionMenu } from "./workspace-section-menu";

afterEach(cleanup);
describe("Area section menu", () => {
  it("replaces two profile tab rows with one keyboard-accessible section menu", async () => {
    const user = userEvent.setup();
    render(<WorkspaceSectionMenu pathname="/profile/trajectory/certifications" roles={["titulado"]} />);
    const trigger = screen.getByRole("button", { name: "Secciones de Perfil profesional" });
    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("menuitem", { name: "Certificaciones" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("menuitem", { name: "Experiencia laboral" })).toHaveAttribute("href", "/profile/trajectory/experience");
    expect(screen.getByRole("menuitem", { name: "Formación académica" })).toHaveAttribute("href", "/profile/trajectory/education");
    expect(screen.getAllByRole("menu")).toHaveLength(1);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
  });
  it("shows the reports area and the selected report without a breadcrumb", async () => {
    const user = userEvent.setup();
    render(<WorkspaceSectionMenu pathname="/backoffice/reports/history" roles={["administrativo"]} />);
    await user.click(screen.getByRole("button", { name: "Secciones de Reportes" }));
    expect(await screen.findByRole("menuitem", { name: "Historial de reportes" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("menuitem", { name: "Usuarios aceptados" })).toHaveAttribute("href", "/backoffice/reports/registered-users");
    expect(screen.queryByRole("navigation", { name: "Ruta de navegación" })).toBeNull();
  });
  it("does not render an unnecessary menu for an area with a single permitted destination", () => {
    render(<WorkspaceSectionMenu pathname="/mentorship/mentors" roles={["estudiante"]} />);
    expect(screen.getByText("Mentorías")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByText("Mi disponibilidad")).toBeNull();
  });
});
