import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { RadioGroup, RadioGroupItem } from "./radio-group"

describe("RadioGroup", () => {
  afterEach(() => cleanup())

  it("renderiza las opciones y avisa de la elegida", () => {
    const onValueChange = vi.fn()
    render(
      <RadioGroup onValueChange={onValueChange} aria-label="Motivo">
        <RadioGroupItem value="a" aria-label="Opción A" />
        <RadioGroupItem value="b" aria-label="Opción B" />
      </RadioGroup>
    )

    expect(screen.getByRole("radiogroup", { name: "Motivo" })).toHaveAttribute("data-slot", "radio-group")
    fireEvent.click(screen.getByRole("radio", { name: "Opción B" }))
    expect(onValueChange).toHaveBeenCalledWith("b", expect.anything())
    expect(screen.getByRole("radio", { name: "Opción B" })).toBeChecked()
  })
})
