import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { VacanciesView } from "./vacancies-view";

afterEach(cleanup);

describe("VacanciesView", () => {
  it("permite recuperar los resultados desde una búsqueda sin coincidencias", () => {
    render(<VacanciesView />);
    const initialLinks = screen.getAllByRole("link", { name: /^Ver detalles de / });
    const searchInput = screen.getByRole("searchbox", { name: /Buscar vacantes/ });

    fireEvent.change(searchInput, { target: { value: "vacante-sin-coincidencias" } });

    expect(screen.getByRole("heading", { name: "No se encontraron vacantes" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("0 vacantes encontradas");
    expect(screen.queryByRole("link", { name: /^Ver detalles de / })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));

    expect(searchInput).toHaveValue("");
    expect(screen.getAllByRole("link", { name: /^Ver detalles de / })).toHaveLength(initialLinks.length);
    expect(screen.queryByRole("button", { name: "Limpiar búsqueda" })).toBeNull();
  });
});
