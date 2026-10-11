import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { Textarea } from "./textarea"

describe("Textarea", () => {
  afterEach(() => cleanup())

  it("renderiza un textarea con su marca data-slot y avisa de los cambios", () => {
    const onChange = vi.fn()
    render(<Textarea aria-label="Motivo" className="extra" onChange={onChange} />)
    const field = screen.getByLabelText("Motivo")

    expect(field).toHaveAttribute("data-slot", "textarea")
    expect(field).toHaveClass("extra")
    fireEvent.change(field, { target: { value: "texto" } })
    expect(onChange).toHaveBeenCalledOnce()
  })
})
