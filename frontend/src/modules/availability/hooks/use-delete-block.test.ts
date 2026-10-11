import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { toast } from "sonner"
import { createQueryWrapper } from "@/shared/testing/create-query-wrapper"
import { useDeleteBlock } from "./use-delete-block"
import { availabilityApi } from "../services/availability.api"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

describe("useDeleteBlock", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
  })

  it("inicia sin eliminación", () => {
    const { result } = renderHook(() => useDeleteBlock(), createQueryWrapper())

    expect(result.current.isDeleting).toBe(false)
  })

  it("elimina el bloque, avisa con un toast e invalida las consultas de bloques", async () => {
    const deleteSpy = vi
      .spyOn(availabilityApi, "deleteAvailabilityBlock")
      .mockResolvedValue(undefined)
    const queryWrapper = createQueryWrapper()
    const invalidateSpy = vi.spyOn(queryWrapper.client, "invalidateQueries")
    const { result } = renderHook(() => useDeleteBlock(), queryWrapper)

    let removed: boolean | undefined
    await act(async () => {
      removed = await result.current.deleteBlock("b1")
    })

    expect(removed).toBe(true)
    expect(deleteSpy).toHaveBeenCalledWith("b1")
    expect(toast.success).toHaveBeenCalledWith("Bloque eliminado correctamente.")
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["availability"] })
  })

  it("usa el mensaje genérico cuando la API falla sin detalle", async () => {
    vi.spyOn(availabilityApi, "deleteAvailabilityBlock").mockRejectedValue(new Error("Network error"))
    const { result } = renderHook(() => useDeleteBlock(), createQueryWrapper())

    let removed: boolean | undefined
    await act(async () => {
      removed = await result.current.deleteBlock("b1")
    })

    expect(removed).toBe(false)
    expect(toast.error).toHaveBeenCalledWith("Error al eliminar el bloque de disponibilidad")
  })

  it("muestra el detalle del backend en un toast cuando responde con un error de negocio", async () => {
    vi.spyOn(availabilityApi, "deleteAvailabilityBlock").mockRejectedValue({
      response: { data: { statusCode: 409, detail: "El bloque tiene una cita asociada", ok: false } },
    })
    const { result } = renderHook(() => useDeleteBlock(), createQueryWrapper())

    await act(async () => {
      await result.current.deleteBlock("b1")
    })

    expect(toast.error).toHaveBeenCalledWith("El bloque tiene una cita asociada")
  })

  it("marca isDeleting mientras la petición está en curso", async () => {
    let resolveDelete!: () => void
    vi.spyOn(availabilityApi, "deleteAvailabilityBlock").mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve
        }),
    )
    const { result } = renderHook(() => useDeleteBlock(), createQueryWrapper())

    let pending!: Promise<boolean>
    act(() => {
      pending = result.current.deleteBlock("b1")
    })

    await waitFor(() => expect(result.current.isDeleting).toBe(true))

    await act(async () => {
      resolveDelete()
      await pending
    })

    await waitFor(() => expect(result.current.isDeleting).toBe(false))
  })
})
