import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RefreshButton } from "./refresh-button";

function completeSpinTurn(element: Element) {
  fireEvent(element, new Event("animationiteration", { bubbles: true }));
  fireEvent(element, new Event("webkitAnimationIteration", { bubbles: true }));
}

describe("RefreshButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("gira el ícono en cada clic y se detiene al completar la vuelta", () => {
    const onClick = vi.fn();
    render(<RefreshButton label="Actualizar" onClick={onClick} />);
    const icon = screen.getByTestId("refresh-icon");

    expect(icon.getAttribute("class")).not.toContain("animate-spin");

    fireEvent.click(screen.getByRole("button", { name: "Actualizar" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(icon.getAttribute("class")).toContain("animate-spin");

    completeSpinTurn(icon);
    expect(icon.getAttribute("class")).not.toContain("animate-spin");

    fireEvent.click(screen.getByRole("button", { name: "Actualizar" }));
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(icon.getAttribute("class")).toContain("animate-spin");
  });

  it("sigue girando mientras carga aunque termine una vuelta", () => {
    render(<RefreshButton label="Actualizar" onClick={vi.fn()} isRefreshing />);
    const icon = screen.getByTestId("refresh-icon");

    completeSpinTurn(icon);

    expect(icon.getAttribute("class")).toContain("animate-spin");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Actualizar" }).disabled).toBe(true);
  });

  it("no gira si el botón no tiene acción", () => {
    render(<RefreshButton />);

    fireEvent.click(screen.getByRole("button", { name: "actualizar" }));

    expect(screen.getByTestId("refresh-icon").getAttribute("class")).not.toContain("animate-spin");
  });
});
