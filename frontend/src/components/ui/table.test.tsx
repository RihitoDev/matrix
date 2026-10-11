import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"

describe("Table", () => {
  afterEach(() => cleanup())

  it("renderiza encabezados y celdas con sus marcas data-slot", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="extra">Ana</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    expect(screen.getByRole("columnheader", { name: "Nombre" })).toHaveAttribute("data-slot", "table-head")
    expect(screen.getByRole("cell", { name: "Ana" })).toHaveClass("extra")
  })
})
