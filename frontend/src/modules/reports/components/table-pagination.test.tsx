import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TablePagination } from "./table-pagination";

describe("TablePagination", () => {
  afterEach(cleanup);

  it("muestra las páginas próximas y los extremos con saltos no interactivos", () => {
    const onPageChange = vi.fn();
    const { container } = render(<TablePagination currentPage={10} totalPages={20} onPageChange={onPageChange} />);

    expect(screen.getAllByRole("button", { name: /^Página \d+$/ }).map((button) => button.textContent)).toEqual([
      "1", "9", "10", "11", "20",
    ]);
    expect(screen.getByRole("button", { name: "Página 10" })).toHaveAttribute("aria-current", "page");
    expect(container.querySelectorAll('[data-slot="pagination-ellipsis"]')).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Página anterior" }));
    expect(onPageChange).toHaveBeenLastCalledWith(9);
    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    expect(onPageChange).toHaveBeenLastCalledWith(11);
    fireEvent.click(screen.getByRole("button", { name: "Página 1" }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(screen.getByRole("button", { name: "Página 20" }));
    expect(onPageChange).toHaveBeenLastCalledWith(20);
  });

  it("desactiva las flechas en los extremos y actualiza las páginas visibles", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(<TablePagination currentPage={1} totalPages={20} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Página anterior" }));
    expect(onPageChange).not.toHaveBeenCalled();

    rerender(<TablePagination currentPage={20} totalPages={20} onPageChange={onPageChange} />);

    expect(screen.getAllByRole("button", { name: /^Página \d+$/ }).map((button) => button.textContent)).toEqual([
      "1", "16", "17", "18", "19", "20",
    ]);
    expect(screen.getByRole("button", { name: "Página siguiente" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("muestra todas las páginas cuando la lista es corta", () => {
    const { container } = render(<TablePagination currentPage={2} totalPages={3} onPageChange={vi.fn()} />);

    expect(screen.getAllByRole("button", { name: /^Página \d+$/ }).map((button) => button.textContent)).toEqual(["1", "2", "3"]);
    expect(container.querySelector('[data-slot="pagination-ellipsis"]')).toBeNull();
  });

  it.each([0, 1])("no permite salir del rango cuando hay %i páginas", (totalPages) => {
    const onPageChange = vi.fn();
    render(<TablePagination currentPage={1} totalPages={totalPages} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Página siguiente" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Página anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
