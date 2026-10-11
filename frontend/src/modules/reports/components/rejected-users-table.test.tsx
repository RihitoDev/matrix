import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RejectedUsersTable } from "./rejected-users-table";

describe("RejectedUsersTable", () => {
  afterEach(() => {
    cleanup();
  });

  it("mantiene el alto del recuadro aunque la búsqueda devuelva un solo resultado", () => {
    render(
      <RejectedUsersTable
        users={[
          {
            id: "rejected-1",
            fullName: "Luis Cruz Camacho",
            email: "rechazado.luis.cruz23@hotmail.com",
            identifier: "202334283",
            documentType: "academic_diploma",
            rejectionReason: null,
            registeredAt: "2026-03-15T14:00:00.000Z",
          },
        ]}
        isLoading={false}
        searchTerm="rechazado.luis"
      />,
    );

    const container = screen.getByRole("table").closest('[data-slot="table-container"]')?.parentElement;

    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(container).toHaveClass("min-h-151");
    expect(container).toHaveClass("@container");
  });

  it("indica en celular que la tabla se puede deslizar para ver todas las columnas", () => {
    render(<RejectedUsersTable users={[]} isLoading={false} />);

    const hint = screen.getByText("Desliza la tabla para ver todas las columnas");

    expect(hint).toHaveClass("md:hidden");
  });
});
