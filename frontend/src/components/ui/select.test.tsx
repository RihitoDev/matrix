import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select"

function renderSelect(props: { open?: boolean; size?: "sm" | "default" } = {}) {
  return render(
    <Select open={props.open}>
      <SelectTrigger aria-label="Ciudad" size={props.size}>
        <SelectValue placeholder="Selecciona" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Departamentos</SelectLabel>
          <SelectItem value="cb">Cochabamba</SelectItem>
          <SelectSeparator />
          <SelectItem value="lp">La Paz</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

describe("Select", () => {
  afterEach(() => cleanup())

  it("muestra el placeholder en el trigger", () => {
    renderSelect()
    expect(screen.getByRole("combobox", { name: "Ciudad" })).toHaveTextContent("Selecciona")
  })

  it("acepta el tamaño pequeño", () => {
    renderSelect({ size: "sm" })
    expect(screen.getByRole("combobox", { name: "Ciudad" })).toHaveAttribute("data-size", "sm")
  })

  it("abre la lista con grupo, etiqueta, separador y opciones", async () => {
    const user = userEvent.setup()
    renderSelect()

    await user.click(screen.getByRole("combobox", { name: "Ciudad" }))

    expect(await screen.findByText("Departamentos")).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "Cochabamba" })).toBeInTheDocument()
    expect(screen.getByRole("option", { name: "La Paz" })).toBeInTheDocument()
    expect(document.querySelector('[data-slot="select-separator"]')).not.toBeNull()
  })

  it("selecciona una opción", async () => {
    const user = userEvent.setup()
    renderSelect()

    await user.click(screen.getByRole("combobox", { name: "Ciudad" }))
    await user.click(await screen.findByRole("option", { name: "La Paz" }))

    expect(screen.getByRole("combobox", { name: "Ciudad" })).toHaveTextContent("lp")
  })
})
