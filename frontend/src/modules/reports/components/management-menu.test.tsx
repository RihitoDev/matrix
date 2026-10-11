import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ManagementMenu } from "./management-menu";

describe("ManagementMenu", () => {
  afterEach(() => {
    cleanup();
  });

  it("abre el menú con los periodos de gestión", () => {
    render(<ManagementMenu />);

    const toggle = screen.getByRole("button", { name: "Gestión" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("menu")).toBeNull();

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    const options = screen.getAllByRole("menuitem").map((option) => option.textContent);
    expect(options).toEqual(["I-2026", "II-2026", "I-2025", "II-2025"]);
  });

  it("cierra el menú al volver a hacer clic en el botón", () => {
    render(<ManagementMenu />);
    const toggle = screen.getByRole("button", { name: "Gestión" });

    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("no cierra el menú al hacer clic dentro de él", () => {
    render(<ManagementMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Gestión" }));

    fireEvent.mouseDown(screen.getByRole("menuitem", { name: "I-2026" }));

    expect(screen.getByRole("menu")).toBeDefined();
  });

  it("cierra el menú al hacer clic fuera", () => {
    render(<ManagementMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Gestión" }));

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("cierra el menú con la tecla Escape", () => {
    render(<ManagementMenu />);
    fireEvent.click(screen.getByRole("button", { name: "Gestión" }));

    fireEvent.keyDown(document, { key: "Enter" });
    expect(screen.getByRole("menu")).toBeDefined();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
