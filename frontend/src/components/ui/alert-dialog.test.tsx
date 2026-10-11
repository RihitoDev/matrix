import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog"

function renderAlertDialog({
  onAction,
  onOpenChange,
}: {
  onAction?: () => void
  onOpenChange?: (open: boolean) => void
} = {}) {
  return render(
    <AlertDialog open onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar bloque?</AlertDialogTitle>
          <AlertDialogDescription>Descripción del diálogo</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onAction}>Eliminar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

describe("AlertDialog", () => {
  afterEach(() => cleanup())

  it("renders its content when open", async () => {
    renderAlertDialog()

    expect(await screen.findByText("¿Eliminar bloque?")).toBeInTheDocument()
    expect(screen.getByText("Descripción del diálogo")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Eliminar" })).toBeInTheDocument()
  })

  it("invoca onClick del action sin cerrar el diálogo", async () => {
    const user = userEvent.setup()
    const onAction = vi.fn()

    renderAlertDialog({ onAction })

    await user.click(screen.getByRole("button", { name: "Eliminar" }))

    expect(onAction).toHaveBeenCalledTimes(1)
    expect(screen.getByText("¿Eliminar bloque?")).toBeInTheDocument()
  })

  it("notifica el cierre al pulsar Cancelar", async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    renderAlertDialog({ onOpenChange })

    await user.click(screen.getByRole("button", { name: "Cancelar" }))

    expect(onOpenChange).toHaveBeenCalled()
    expect(onOpenChange.mock.calls[0]?.[0]).toBe(false)
  })
})
