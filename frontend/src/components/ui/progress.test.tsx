import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { Progress } from "./progress"

describe("Progress", () => {
  afterEach(() => cleanup())

  it("expone el rol progressbar con su valor", () => {
    render(<Progress value={40} aria-label="Avance" />)
    const bar = screen.getByRole("progressbar", { name: "Avance" })
    expect(bar).toHaveAttribute("aria-valuenow", "40")
    expect(bar).toHaveAttribute("data-slot", "progress")
  })

  it("combina la clase recibida con las propias", () => {
    render(<Progress value={10} aria-label="Avance" className="extra" />)
    expect(screen.getByRole("progressbar")).toHaveClass("extra")
  })

  it("dibuja la pista y el indicador", () => {
    const { container } = render(<Progress value={70} aria-label="Avance" />)
    expect(container.querySelector("[data-slot='progress-track']")).not.toBeNull()
    expect(container.querySelector("[data-slot='progress-indicator']")).not.toBeNull()
  })
})
