import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { Input } from "./input"
import { Label } from "./label"

describe("Label", () => {
  afterEach(() => cleanup())

  it("se asocia con su control mediante htmlFor", () => {
    render(
      <>
        <Label htmlFor="correo">Correo</Label>
        <Input id="correo" />
      </>
    )
    expect(screen.getByLabelText("Correo")).toBeInTheDocument()
  })

  it("combina la clase recibida con las propias", () => {
    render(<Label className="extra">Texto</Label>)
    const label = screen.getByText("Texto")
    expect(label).toHaveAttribute("data-slot", "label")
    expect(label).toHaveClass("extra")
  })
})
