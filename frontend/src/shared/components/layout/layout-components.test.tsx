import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { Breadcrumbs } from "./breadcrumbs"

const link = (name: RegExp) => screen.getByRole("link", { name })

afterEach(() => {
  cleanup()
})

describe("Breadcrumbs", () => {
  const items = [
    { label: "UMSSY", href: "/" },
    { label: "Mentorías" },
    { label: "Áreas técnicas" },
  ]

  it("renderiza los items y marca el último como página actual", () => {
    render(<Breadcrumbs items={items} />)
    expect(link(/UMSSY/).getAttribute("href")).toBe("/")
    expect(screen.getByText("Mentorías")).toBeTruthy()
    expect(screen.getByText("Áreas técnicas").getAttribute("aria-current")).toBe("page")
  })
})
