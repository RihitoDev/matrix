import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RequestPagination } from "./request-pagination";

describe("RequestPagination", () => {
  afterEach(() => cleanup());

  it("muestra el rango y navega con Anterior y Siguiente", () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(<RequestPagination from={11} to={20} total={25} hasPrevious hasNext onPrevious={onPrevious} onNext={onNext} />);

    expect(screen.getByText("Mostrando 11 a 20 de 25 solicitudes, de la más reciente a la más antigua")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("deshabilita los botones en los extremos", () => {
    render(<RequestPagination from={1} to={5} total={5} hasPrevious={false} hasNext={false} onPrevious={vi.fn()} onNext={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });
});
