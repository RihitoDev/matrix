import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { toast } from "sonner"
import { createQueryWrapper } from "@/shared/testing/create-query-wrapper"
import { useUpdateAvailabilityBlock } from "./use-update-availability-block"
import { availabilityApi } from "../services/availability.api"
import type { AvailabilityBlock } from "../types/availability-block.types"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockBlock: AvailabilityBlock = {
  id: "b1",
  mentorId: "m1",
  startAt: "2030-05-13T14:00:00Z",
  endAt: "2030-05-13T16:00:00Z",
  state: "free",
  createdAt: "",
  updatedAt: "",
}

describe("useUpdateAvailabilityBlock", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
  })

  it("inicia sin envío", () => {
    const { result } = renderHook(() => useUpdateAvailabilityBlock(), createQueryWrapper())

    expect(result.current.isSubmitting).toBe(false)
  })

  it("actualiza el bloque, avisa con un toast e invalida las consultas de bloques", async () => {
    const updateSpy = vi
      .spyOn(availabilityApi, "updateAvailabilityBlock")
      .mockResolvedValue(mockBlock)
    const queryWrapper = createQueryWrapper()
    const invalidateSpy = vi.spyOn(queryWrapper.client, "invalidateQueries")
    const { result } = renderHook(() => useUpdateAvailabilityBlock(), queryWrapper)

    let updated: AvailabilityBlock | null = null
    await act(async () => {
      updated = await result.current.updateBlock("b1", { startAt: mockBlock.startAt })
    })

    expect(updated).toEqual(mockBlock)
    expect(updateSpy).toHaveBeenCalledWith("b1", { startAt: mockBlock.startAt })
    expect(toast.success).toHaveBeenCalledWith("Bloque actualizado correctamente.")
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["availability"] })
  })

  it("muestra el detalle del backend en un toast cuando responde con un error de negocio (409)", async () => {
    vi.spyOn(availabilityApi, "updateAvailabilityBlock").mockRejectedValue({
      response: { data: { statusCode: 409, detail: "Ya tienes un bloque en ese horario", ok: false } },
    })
    const { result } = renderHook(() => useUpdateAvailabilityBlock(), createQueryWrapper())

    let updated: AvailabilityBlock | null = mockBlock
    await act(async () => {
      updated = await result.current.updateBlock("b1", {})
    })

    expect(updated).toBeNull()
    expect(toast.error).toHaveBeenCalledWith("Ya tienes un bloque en ese horario")
  })

  it("usa el mensaje genérico cuando la API falla sin detalle", async () => {
    vi.spyOn(availabilityApi, "updateAvailabilityBlock").mockRejectedValue(new Error("Network error"))
    const { result } = renderHook(() => useUpdateAvailabilityBlock(), createQueryWrapper())

    await act(async () => {
      await result.current.updateBlock("b1", {})
    })

    expect(toast.error).toHaveBeenCalledWith("Error al actualizar el bloque de disponibilidad")
  })

  it("marca isSubmitting mientras la petición está en curso", async () => {
    let resolveUpdate!: (block: AvailabilityBlock) => void
    vi.spyOn(availabilityApi, "updateAvailabilityBlock").mockImplementation(
      () =>
        new Promise<AvailabilityBlock>((resolve) => {
          resolveUpdate = resolve
        }),
    )
    const { result } = renderHook(() => useUpdateAvailabilityBlock(), createQueryWrapper())

    let pending!: Promise<AvailabilityBlock | null>
    act(() => {
      pending = result.current.updateBlock("b1", {})
    })

    await waitFor(() => expect(result.current.isSubmitting).toBe(true))

    await act(async () => {
      resolveUpdate(mockBlock)
      await pending
    })

    await waitFor(() => expect(result.current.isSubmitting).toBe(false))
  })
})
