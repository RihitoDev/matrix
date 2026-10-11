import { useState } from "react"
import { act, cleanup, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { toast } from "sonner"
import { renderWithQuery } from "@/shared/testing/render-with-query"
import { DeleteBlockDialog } from "./delete-block-dialog"
import { availabilityApi } from "../services/availability.api"
import type { AvailabilityBlock } from "../types/availability-block.types"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockBlock: AvailabilityBlock = {
  id: "b1",
  mentorId: "m1",
  startAt: "2024-01-15T14:00:00Z",
  endAt: "2024-01-15T15:00:00Z",
  state: "free",
  createdAt: "",
  updatedAt: "",
}

function Harness({ onDeleted }: { onDeleted?: () => void }) {
  const [open, setOpen] = useState(true)
  return (
    <DeleteBlockDialog block={mockBlock} open={open} onOpenChange={setOpen} onDeleted={onDeleted} />
  )
}

describe("DeleteBlockDialog", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("muestra título, panel del bloque y acciones al abrirse", async () => {
    renderWithQuery(<Harness />)

    expect(await screen.findByText("¿Eliminar este bloque?")).toBeInTheDocument()
    expect(screen.getByText("BLOQUE LIBRE")).toBeInTheDocument()
    expect(screen.getByText(/15 de enero/)).toBeInTheDocument()
    expect(screen.getByText(/\d{2}:\d{2} - \d{2}:\d{2} · Hora de Bolivia \(GMT-4\)/)).toBeInTheDocument()
    expect(screen.getByText(/Los egresados dejarán de ver este horario/)).toBeInTheDocument()
    expect(screen.getByText(/Esta acción no se puede deshacer\./)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Eliminar bloque" })).toBeInTheDocument()
  })

  it("cancelar cierra el modal sin eliminar (CA4)", async () => {
    const user = userEvent.setup()
    const deleteSpy = vi
      .spyOn(availabilityApi, "deleteAvailabilityBlock")
      .mockResolvedValue(undefined)

    renderWithQuery(<Harness />)

    await user.click(await screen.findByRole("button", { name: "Cancelar" }))

    await waitFor(() => {
      expect(screen.queryByText("¿Eliminar este bloque?")).not.toBeInTheDocument()
    })
    expect(deleteSpy).not.toHaveBeenCalled()
  })

  it("confirmar elimina el bloque, avisa con un toast y cierra el modal (CA3)", async () => {
    const user = userEvent.setup()
    const deleteSpy = vi
      .spyOn(availabilityApi, "deleteAvailabilityBlock")
      .mockResolvedValue(undefined)
    const onDeleted = vi.fn()

    renderWithQuery(<Harness onDeleted={onDeleted} />)

    await user.click(await screen.findByRole("button", { name: "Eliminar bloque" }))

    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith("b1"))
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Bloque eliminado correctamente."))
    await waitFor(() => {
      expect(screen.queryByText("¿Eliminar este bloque?")).not.toBeInTheDocument()
    })
    expect(onDeleted).toHaveBeenCalledTimes(1)
  })

  it("mantiene el modal abierto y avisa con un toast si la eliminación falla", async () => {
    const user = userEvent.setup()
    vi.spyOn(availabilityApi, "deleteAvailabilityBlock").mockRejectedValue(new Error("Network error"))
    const onDeleted = vi.fn()

    renderWithQuery(<Harness onDeleted={onDeleted} />)

    await user.click(await screen.findByRole("button", { name: "Eliminar bloque" }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Error al eliminar el bloque de disponibilidad"),
    )
    expect(screen.getByText("¿Eliminar este bloque?")).toBeInTheDocument()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it("muestra el detalle del backend (409) en un toast y mantiene el modal abierto", async () => {
    const user = userEvent.setup()
    vi.spyOn(availabilityApi, "deleteAvailabilityBlock").mockRejectedValue({
      response: { data: { statusCode: 409, detail: "El bloque tiene una cita asociada", ok: false } },
    })
    const onDeleted = vi.fn()

    renderWithQuery(<Harness onDeleted={onDeleted} />)

    await user.click(await screen.findByRole("button", { name: "Eliminar bloque" }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("El bloque tiene una cita asociada"),
    )
    expect(screen.getByText("¿Eliminar este bloque?")).toBeInTheDocument()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it("deshabilita los botones mientras la eliminación está en curso", async () => {
    const user = userEvent.setup()
    let resolveDelete!: () => void
    vi.spyOn(availabilityApi, "deleteAvailabilityBlock").mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve
        }),
    )

    renderWithQuery(<Harness />)

    await user.click(await screen.findByRole("button", { name: "Eliminar bloque" }))

    expect(await screen.findByRole("button", { name: "Eliminando..." })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled()

    await act(async () => {
      resolveDelete()
    })

    await waitFor(() => {
      expect(screen.queryByText("¿Eliminar este bloque?")).not.toBeInTheDocument()
    })
  })

  it("no llama a la API si no hay bloque seleccionado", async () => {
    const user = userEvent.setup()
    const deleteSpy = vi
      .spyOn(availabilityApi, "deleteAvailabilityBlock")
      .mockResolvedValue(undefined)

    renderWithQuery(<DeleteBlockDialog block={null} open onOpenChange={vi.fn()} />)

    await user.click(await screen.findByRole("button", { name: "Eliminar bloque" }))

    expect(deleteSpy).not.toHaveBeenCalled()
    expect(screen.queryByText("BLOQUE LIBRE")).not.toBeInTheDocument()
  })
})
