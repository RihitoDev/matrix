import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { toast } from "sonner"
import { createQueryWrapper } from "@/shared/testing/create-query-wrapper"
import { useCreateAvailabilityBlock } from "./use-create-availability-block"
import { availabilityApi } from "../services/availability.api"
import type { AvailabilityBlock } from "../types/availability-block.types"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const input = { startAt: "2024-01-15T10:00", endAt: "2024-01-15T11:00" }

const mockBlock: AvailabilityBlock = {
  id: "1",
  mentorId: "m1",
  startAt: "2024-01-15T14:00:00Z",
  endAt: "2024-01-15T15:00:00Z",
  state: "free",
  createdAt: "",
  updatedAt: "",
}

describe("useCreateAvailabilityBlock", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
  })

  it("no pide la lista de bloques al montar", () => {
    const spy = vi.spyOn(availabilityApi, "getAvailabilityBlocks")

    const { result } = renderHook(() => useCreateAvailabilityBlock(), createQueryWrapper())

    expect(spy).not.toHaveBeenCalled()
    expect(result.current.isSubmitting).toBe(false)
  })

  it("crea el bloque, avisa con un toast e invalida las consultas de bloques", async () => {
    const createSpy = vi.spyOn(availabilityApi, "createAvailabilityBlock").mockResolvedValue(mockBlock)
    const queryWrapper = createQueryWrapper()
    const invalidateSpy = vi.spyOn(queryWrapper.client, "invalidateQueries")

    const { result } = renderHook(() => useCreateAvailabilityBlock(), queryWrapper)

    const created = await act(async () => result.current.createBlock(input))

    expect(createSpy).toHaveBeenCalledWith(input)
    expect(created).toEqual(mockBlock)
    expect(toast.success).toHaveBeenCalledWith("Bloque guardado correctamente.")
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["availability"] })
  })

  it("muestra el detail del backend en un toast de error", async () => {
    vi.spyOn(availabilityApi, "createAvailabilityBlock").mockRejectedValue({
      response: { data: { statusCode: 409, detail: "Ya tienes un bloque en ese horario" } },
    })

    const { result } = renderHook(() => useCreateAvailabilityBlock(), createQueryWrapper())

    const failed = await act(async () => result.current.createBlock(input))

    expect(failed).toBeNull()
    expect(toast.error).toHaveBeenCalledWith("Ya tienes un bloque en ese horario")
  })

  it("usa el mensaje genérico si el backend no manda detail", async () => {
    vi.spyOn(availabilityApi, "createAvailabilityBlock").mockRejectedValue(new Error("Network error"))

    const { result } = renderHook(() => useCreateAvailabilityBlock(), createQueryWrapper())

    await act(async () => result.current.createBlock(input))

    expect(toast.error).toHaveBeenCalledWith("Error al crear el bloque de disponibilidad")
  })
})
