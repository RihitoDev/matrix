import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu"
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

describe("Overlay primitives", () => {
  afterEach(() => cleanup())

  it("renders an open select with groups, labels and separators", async () => {
    render(
      <Select open defaultValue="ana">
        <SelectTrigger size="sm" aria-label="Persona">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Personas</SelectLabel>
            <SelectItem value="ana">Ana</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectItem value="luis">Luis</SelectItem>
        </SelectContent>
      </Select>
    )

    expect(await screen.findByRole("option", { name: "Luis" })).toBeInTheDocument()
    expect(screen.getByText("Personas")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Persona" })).toHaveAttribute("data-size", "sm")
  })

  it("renders an open dropdown menu with every item type", async () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Opciones</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel inset>Cuenta</DropdownMenuLabel>
            <DropdownMenuItem>
              Perfil
              <DropdownMenuShortcut>Ctrl+P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">Eliminar</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked>Notificaciones</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup value="claro">
            <DropdownMenuRadioItem value="claro">Tema claro</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSub open>
            <DropdownMenuSubTrigger>Más</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Ayuda</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    expect(await screen.findByRole("menuitem", { name: /Perfil/ })).toBeInTheDocument()
    expect(screen.getByText("Ctrl+P")).toBeInTheDocument()
    expect(screen.getByRole("menuitemcheckbox", { name: "Notificaciones" })).toHaveAttribute("aria-checked", "true")
    expect(screen.getByRole("menuitemradio", { name: "Tema claro" })).toHaveAttribute("aria-checked", "true")
    expect(await screen.findByRole("menuitem", { name: "Ayuda" })).toBeInTheDocument()
  })
})
