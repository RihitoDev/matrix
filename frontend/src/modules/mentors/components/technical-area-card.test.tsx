import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TechnicalAreaCard } from "./technical-area-card";

const area = {
  id: "0424f370-00f0-43cf-9b8a-997af81840b9",
  name: "Backend",
  description: "APIs, lógica de negocio",
};

describe("TechnicalAreaCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("muestra nombre y descripción", () => {
    render(
      <TechnicalAreaCard area={area} isSelected={false} onToggle={vi.fn()} />,
    );
    expect(screen.getByText("Backend")).toBeTruthy();
    expect(screen.getByText("APIs, lógica de negocio")).toBeTruthy();
  });

  it("no seleccionada: fondo neutro, desmarcada y sin tilde", () => {
    const { container } = render(
      <TechnicalAreaCard area={area} isSelected={false} onToggle={vi.fn()} />,
    );
    const card = screen.getByRole("checkbox");
    expect(card.getAttribute("aria-checked")).toBe("false");
    expect(card.className).toContain("bg-[#F3F4F6]");
    expect(container.querySelector("svg")).toBeNull();
  });

  it("seleccionada: fondo rosado, marcada y con tilde", () => {
    const { container } = render(
      <TechnicalAreaCard area={area} isSelected onToggle={vi.fn()} />,
    );
    const card = screen.getByRole("checkbox");
    expect(card.getAttribute("aria-checked")).toBe("true");
    expect(card.className).toContain("bg-[#FEE2E2]");
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("llama onToggle con el id al hacer clic", () => {
    const onToggle = vi.fn();
    render(
      <TechnicalAreaCard area={area} isSelected={false} onToggle={onToggle} />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith(area.id);
  });

  it("omite la descripción cuando el catálogo no la define", () => {
    render(
      <TechnicalAreaCard
        area={{ ...area, description: null }}
        isSelected={false}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("Backend")).toBeTruthy();
    expect(screen.queryByText("APIs, lógica de negocio")).toBeNull();
  });
});
