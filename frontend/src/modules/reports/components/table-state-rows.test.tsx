import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Table, TableBody } from "@/components/ui/table";
import { TableMessageRow, TableNoResultsRow } from "./table-state-rows";

function renderInTable(row: ReactNode) {
  return render(
    <Table>
      <TableBody>{row}</TableBody>
    </Table>,
  );
}

describe("table state rows", () => {
  afterEach(() => {
    cleanup();
  });

  it("mantiene el mensaje en el área visible cuando la tabla se desplaza en pantallas angostas", () => {
    renderInTable(<TableMessageRow columnCount={5} message="No hay usuarios rechazados." />);

    const content = screen.getByText("No hay usuarios rechazados.");

    expect(content.className).toContain("sticky");
    expect(content.className).toContain("w-[100cqw]");
    expect(content.closest("td")?.getAttribute("colspan")).toBe("5");
  });

  it("mantiene el estado sin resultados en el área visible cuando la tabla se desplaza", () => {
    renderInTable(<TableNoResultsRow columnCount={5} message="No se encontró ningún usuario con el correo" />);

    const content = screen.getByRole("status").parentElement;

    expect(screen.getByRole("status").textContent).toBe("No se encontró ningún usuario con el correo");
    expect(content?.className).toContain("sticky");
    expect(content?.className).toContain("w-[100cqw]");
  });
});
