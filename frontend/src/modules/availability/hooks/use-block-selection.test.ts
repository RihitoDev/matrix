import { describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useBlockSelection } from "./use-block-selection"
import { BLOCK_SELECTION_TEXT } from "../constants/block-selection.constants"
import type { AvailabilityBlock } from "../types/availability-block.types"

const block = (id: string): AvailabilityBlock => ({
  id,
  mentorId: "m1",
  startAt: "2026-10-06T22:00:00.000Z",
  endAt: "2026-10-06T23:00:00.000Z",
  state: "free",
  createdAt: "",
  updatedAt: "",
})

describe("useBlockSelection", () => {
  it("selecciona el bloque si sigue libre al consultar de nuevo", async () => {
    const fetchFreeBlocks = vi.fn().mockResolvedValue([block("1")])
    const { result } = renderHook(() => useBlockSelection(fetchFreeBlocks))

    await act(() => result.current.selectBlock(block("1")))

    expect(fetchFreeBlocks).toHaveBeenCalledTimes(1)
    expect(result.current.selectedBlock?.id).toBe("1")
    expect(result.current.isChecking).toBe(false)
  })

  it("mantiene un solo bloque seleccionado a la vez", async () => {
    const fetchFreeBlocks = vi.fn().mockResolvedValue([block("1"), block("2")])
    const { result } = renderHook(() => useBlockSelection(fetchFreeBlocks))

    await act(() => result.current.selectBlock(block("1")))
    await act(() => result.current.selectBlock(block("2")))

    expect(result.current.selectedBlock?.id).toBe("2")
  })

  it("no selecciona un bloque que ya no está libre y lo marca como no disponible", async () => {
    const fetchFreeBlocks = vi.fn().mockResolvedValue([block("2")])
    const { result } = renderHook(() => useBlockSelection(fetchFreeBlocks))

    await act(() => result.current.selectBlock(block("1")))

    expect(result.current.selectedBlock).toBeNull()
    expect(result.current.unavailableBlock?.id).toBe("1")
    expect(result.current.unavailableBlockIds).toEqual(["1"])
  })

  it("quita la selección si el bloque seleccionado deja de estar libre", async () => {
    const fetchFreeBlocks = vi.fn().mockResolvedValueOnce([block("1")]).mockResolvedValueOnce([])
    const { result } = renderHook(() => useBlockSelection(fetchFreeBlocks))

    await act(() => result.current.selectBlock(block("1")))
    await act(() => result.current.selectBlock(block("1")))
    await act(() => result.current.selectBlock(block("1")))

    expect(result.current.selectedBlock).toBeNull()
    expect(result.current.unavailableBlockIds).toEqual(["1"])
  })

  it("muestra un error si no se puede verificar el horario", async () => {
    const fetchFreeBlocks = vi.fn().mockRejectedValue(new Error("Network error"))
    const { result } = renderHook(() => useBlockSelection(fetchFreeBlocks))

    await act(() => result.current.selectBlock(block("1")))

    expect(result.current.selectedBlock).toBeNull()
    expect(result.current.error).toBe(BLOCK_SELECTION_TEXT.checkError)
    expect(result.current.isChecking).toBe(false)
  })

  it("ignora la respuesta de una selección anterior", async () => {
    let resolveFirst: (blocks: AvailabilityBlock[]) => void = () => {}
    const fetchFreeBlocks = vi
      .fn()
      .mockReturnValueOnce(new Promise<AvailabilityBlock[]>((resolve) => { resolveFirst = resolve }))
      .mockResolvedValueOnce([block("2")])
    const { result } = renderHook(() => useBlockSelection(fetchFreeBlocks))

    let first: Promise<void> = Promise.resolve()
    act(() => { first = result.current.selectBlock(block("1")) })
    await act(() => result.current.selectBlock(block("2")))
    await act(async () => {
      resolveFirst([block("1")])
      await first
    })

    expect(result.current.selectedBlock?.id).toBe("2")
  })
})
