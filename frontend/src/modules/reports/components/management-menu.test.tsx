import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ManagementMenuProps } from "../types/management-menu-props.types";
import type { AcademicPeriod } from "../types/registered-user.types";
import { ManagementMenu } from "./management-menu";

function ControlledManagementMenu({ onChange }: ManagementMenuProps) {
  const [value, setValue] = useState<AcademicPeriod>();

  return (
    <ManagementMenu value={value} onChange={(period) => {
      setValue(period);
      onChange(period);
    }} />
  );
}

describe("ManagementMenu", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-08T12:00:00-04:00"));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("abre el menú con los periodos de gestión", () => {
    render(<ManagementMenu onChange={vi.fn()} />);

    const toggle = screen.getByRole("button", { name: "Gestión" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("menu")).toBeNull();

    fireEvent.click(toggle);

    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    const options = screen.getAllByRole("menuitemradio").map((option) => option.textContent);
    expect(options.slice(0, 5)).toEqual(["Todas", "II-2026", "I-2026", "II-2025", "I-2025"]);
    expect(options.at(-1)).toBe("I-2020");
    expect(screen.getByRole("menuitemradio", { name: "Todas" })).toHaveAttribute("aria-checked", "true");
  });

  it("cierra el menú al volver a hacer clic en el botón", () => {
    render(<ManagementMenu onChange={vi.fn()} />);
    const toggle = screen.getByRole("button", { name: "Gestión" });

    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("no cierra el menú al hacer clic dentro de él", () => {
    render(<ManagementMenu onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Gestión" }));

    fireEvent.mouseDown(screen.getByRole("menuitemradio", { name: "I-2026" }));

    expect(screen.getByRole("menu")).toBeDefined();
  });

  it("cierra el menú al hacer clic fuera", () => {
    render(<ManagementMenu onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Gestión" }));

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("cierra el menú con la tecla Escape", () => {
    render(<ManagementMenu onChange={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Gestión" }));

    fireEvent.keyDown(document, { key: "Enter" });
    expect(screen.getByRole("menu")).toBeDefined();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("selecciona una gestión, la marca y permite volver a Todas", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledManagementMenu onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Gestión" }));
    await user.click(screen.getByRole("menuitemradio", { name: "II-2025" }));
    expect(onChange).toHaveBeenLastCalledWith("II-2025");
    expect(screen.queryByRole("menu")).toBeNull();

    await waitFor(() => expect(screen.getByRole("button", { name: "Gestión II-2025" })).toHaveFocus());
    fireEvent.click(screen.getByRole("button", { name: "Gestión II-2025" }));
    expect(await screen.findByRole("menuitemradio", { name: "II-2025" })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("menuitemradio", { name: "Todas" }));
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("permite seleccionar una gestión con el teclado", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ManagementMenu onChange={onChange} />);

    screen.getByRole("button", { name: "Gestión" }).focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(screen.getByRole("menuitemradio", { name: "Todas" })).toHaveFocus());
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onChange).toHaveBeenLastCalledWith("II-2026");
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
