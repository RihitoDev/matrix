import { cleanup, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { toast } from "sonner"
import { renderWithQuery } from "@/shared/testing/render-with-query"
import { EditBlockPanel } from "./edit-block-panel"
import { availabilityApi } from "../services/availability.api"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockBlock = {
  id: "1",
  mentorId: "m1",
  startAt: "2030-05-13T14:00:00Z",
  endAt: "2030-05-13T16:00:00Z",
  state: "free" as const,
  createdAt: "",
  updatedAt: "",
}

describe("EditBlockPanel", () => {
  beforeEach(() => {
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it("muestra el formulario en modo edición con los datos del bloque", () => {
    renderWithQuery(<EditBlockPanel block={mockBlock} onClose={vi.fn()} />)

    expect(screen.getByText("Editar bloque")).toBeInTheDocument()
    expect(screen.getByText("Modifica la fecha o el horario del bloque.")).toBeInTheDocument()
    expect(screen.getByText("Lunes 13 de mayo")).toBeInTheDocument()
    expect(screen.getByLabelText(/Día/)).toHaveValue("2030-05-13")
    expect(screen.getByLabelText(/Desde/)).toHaveValue("10:00")
    expect(screen.getByLabelText(/Hasta/)).toHaveValue("12:00")
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Eliminar bloque" }),
    ).toHaveClass("border-danger", "text-danger")
    expect(
      screen.queryByText("Solo se puede editar si el bloque no tiene ninguna cita asociada."),
    ).not.toBeInTheDocument()
  })

  it.each(["pending", "confirmed"] as const)(
    "deshabilita Guardar y Eliminar cuando el bloque está %s",
    (state) => {
      renderWithQuery(<EditBlockPanel block={{ ...mockBlock, state }} onClose={vi.fn()} />)

      expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeDisabled()
      expect(screen.getByRole("button", { name: "Eliminar bloque" })).toBeDisabled()
      expect(
        screen.getByText("Solo se puede editar si el bloque no tiene ninguna cita asociada."),
      ).toBeInTheDocument()
    },
  )

  it("no elimina ni abre el diálogo si el bloque tiene una cita asociada", async () => {
    const deleteSpy = vi.spyOn(availabilityApi, "deleteAvailabilityBlock")
    const user = userEvent.setup()

    renderWithQuery(<EditBlockPanel block={{ ...mockBlock, state: "pending" }} onClose={vi.fn()} />)

    await user.click(screen.getByRole("button", { name: "Eliminar bloque" }))

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument()
    expect(deleteSpy).not.toHaveBeenCalled()
  })

  it("guarda los cambios, avisa con un toast y notifica el cierre", async () => {
    const onClose = vi.fn()
    const updateSpy = vi
      .spyOn(availabilityApi, "updateAvailabilityBlock")
      .mockResolvedValue({ ...mockBlock, endAt: "2030-05-13T18:00:00.000Z" })
    const user = userEvent.setup()

    renderWithQuery(<EditBlockPanel block={mockBlock} onClose={onClose} />)

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }))

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith("1", {
        startAt: "2030-05-13T14:00:00.000Z",
        endAt: "2030-05-13T16:00:00.000Z",
      })
    })
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
    expect(toast.success).toHaveBeenCalledWith("Bloque actualizado correctamente.")
  })

  it("muestra el detalle del backend (409) en un toast y no cierra el panel", async () => {
    const onClose = vi.fn()
    vi.spyOn(availabilityApi, "updateAvailabilityBlock").mockRejectedValue({
      response: {
        data: { statusCode: 409, detail: "Ya tienes un bloque en ese horario", ok: false },
      },
    })
    const user = userEvent.setup()

    renderWithQuery(<EditBlockPanel block={mockBlock} onClose={onClose} />)

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Ya tienes un bloque en ese horario"),
    )
    expect(onClose).not.toHaveBeenCalled()
  })

  it("elimina el bloque y notifica el cierre", async () => {
    const onClose = vi.fn()
    const deleteSpy = vi
      .spyOn(availabilityApi, "deleteAvailabilityBlock")
      .mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderWithQuery(<EditBlockPanel block={mockBlock} onClose={onClose} />)

    await user.click(screen.getByRole("button", { name: "Eliminar bloque" }))
    const dialog = await screen.findByRole("alertdialog")
    expect(within(dialog).getByText("¿Eliminar este bloque?")).toBeInTheDocument()

    await user.click(within(dialog).getByRole("button", { name: "Eliminar bloque" }))

    await waitFor(() => expect(deleteSpy).toHaveBeenCalledWith("1"))
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1))
  })

  it("cancelar el diálogo de eliminar conserva el bloque", async () => {
    const onClose = vi.fn()
    const deleteSpy = vi
      .spyOn(availabilityApi, "deleteAvailabilityBlock")
      .mockResolvedValue(undefined)
    const user = userEvent.setup()

    renderWithQuery(<EditBlockPanel block={mockBlock} onClose={onClose} />)

    await user.click(screen.getByRole("button", { name: "Eliminar bloque" }))
    const dialog = await screen.findByRole("alertdialog")
    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }))

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument())
    expect(deleteSpy).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText("Editar bloque")).toBeInTheDocument()
  })

  it("cancelar cierra el panel sin guardar", async () => {
    const onClose = vi.fn()
    const updateSpy = vi.spyOn(availabilityApi, "updateAvailabilityBlock")
    const user = userEvent.setup()

    renderWithQuery(<EditBlockPanel block={mockBlock} onClose={onClose} />)

    await user.click(screen.getByRole("button", { name: "Cancelar" }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(updateSpy).not.toHaveBeenCalled()
  })

  it("muestra error cuando el bloque no existe", () => {
    renderWithQuery(<EditBlockPanel block={null} onClose={vi.fn()} />)

    expect(
      screen.getByText("No se pudo cargar el bloque de disponibilidad"),
    ).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Guardar cambios" })).not.toBeInTheDocument()
  })
})
