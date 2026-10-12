import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { BreadcrumbEllipsis } from "./breadcrumb"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

describe("Data display primitives", () => {
  afterEach(() => cleanup())

  it("renders a table with header, body, footer and caption", () => {
    render(
      <Table>
        <TableCaption>Usuarios</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ana</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>Total: 1</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    )

    expect(screen.getByRole("table", { name: "Usuarios" })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: "Nombre" })).toBeInTheDocument()
    expect(screen.getByRole("cell", { name: "Total: 1" })).toBeInTheDocument()
  })

  it("renders pagination links with the active page and ellipsis", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#anterior" text="Anterior" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#1" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#2">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#siguiente" text="Siguiente" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )

    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page")
    expect(screen.getByRole("button", { name: "2" })).not.toHaveAttribute("aria-current")
    expect(screen.getByRole("button", { name: "Go to previous page" })).toHaveAttribute("href", "#anterior")
    expect(screen.getByRole("button", { name: "Go to next page" })).toHaveAttribute("href", "#siguiente")
    expect(screen.getByText("More pages")).toBeInTheDocument()
  })

  it("renders a breadcrumb ellipsis", () => {
    render(<BreadcrumbEllipsis />)
    expect(document.querySelector('[data-slot="breadcrumb-ellipsis"]')).not.toBeNull()
  })
})
