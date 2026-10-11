import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { act, renderHook, waitFor } from "@testing-library/react"
import { focusManager } from "@tanstack/react-query"
import { createQueryWrapper } from "@/shared/testing/create-query-wrapper"
import { useMentorFreeBlocks } from "./use-mentor-free-blocks"
import { availabilityApi } from "../services/availability.api"
import type { AvailabilityBlock } from "../types/availability-block.types"

const CURRENT_WEEK = {
  startAt: "2026-09-28T04:00:00.000Z",
  endAt: "2026-10-05T03:59:59.999Z",
}

const NEXT_WEEK = {
  startAt: "2026-10-05T04:00:00.000Z",
  endAt: "2026-10-12T03:59:59.999Z",
}

const mockBlock: AvailabilityBlock = {
  id: "1",
  mentorId: "m1",
  startAt: "2026-09-29T10:00:00Z",
  endAt: "2026-09-29T11:00:00Z",
  state: "free",
  createdAt: "",
  updatedAt: "",
}

describe("useMentorFreeBlocks", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    focusManager.setFocused(undefined)
  })

  it("obtiene los bloques libres del mentor en la semana indicada", async () => {
    const spy = vi.spyOn(availabilityApi, "getMentorFreeBlocks").mockResolvedValue([mockBlock])

    const { result } = renderHook(() => useMentorFreeBlocks("m1", CURRENT_WEEK), createQueryWrapper())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(spy).toHaveBeenCalledWith("m1", CURRENT_WEEK)
    expect(result.current.blocks).toEqual([mockBlock])
    expect(result.current.error).toBeNull()
  })

  it("maneja error al obtener bloques libres", async () => {
    vi.spyOn(availabilityApi, "getMentorFreeBlocks").mockRejectedValue(new Error("Network error"))

    const { result } = renderHook(() => useMentorFreeBlocks("m1", CURRENT_WEEK), createQueryWrapper())

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe("Error al obtener los bloques de disponibilidad")
  })

  it("vuelve a pedir datos cuando cambia el mentor", async () => {
    const spy = vi.spyOn(availabilityApi, "getMentorFreeBlocks").mockResolvedValue([])

    const { result, rerender } = renderHook(
      ({ mentorId }) => useMentorFreeBlocks(mentorId, CURRENT_WEEK),
      { ...createQueryWrapper(), initialProps: { mentorId: "m1" } },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    rerender({ mentorId: "m2" })

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(spy).toHaveBeenLastCalledWith("m2", CURRENT_WEEK)
  })

  it("al cambiar de semana muestra solo los bloques de esa semana", async () => {
    const nextBlock: AvailabilityBlock = { ...mockBlock, id: "2" }
    vi.spyOn(availabilityApi, "getMentorFreeBlocks").mockImplementation(async (_id, range) =>
      range.startAt === CURRENT_WEEK.startAt ? [mockBlock] : [nextBlock],
    )

    const { result, rerender } = renderHook(
      ({ weekRange }) => useMentorFreeBlocks("m1", weekRange),
      { ...createQueryWrapper(), initialProps: { weekRange: CURRENT_WEEK } },
    )

    await waitFor(() => expect(result.current.blocks).toEqual([mockBlock]))

    rerender({ weekRange: NEXT_WEEK })

    expect(result.current.blocks).toEqual([])
    await waitFor(() => expect(result.current.blocks).toEqual([nextBlock]))
  })

  it("vuelve a pedir datos al recuperar el foco", async () => {
    const spy = vi.spyOn(availabilityApi, "getMentorFreeBlocks").mockResolvedValue([mockBlock])

    const { result } = renderHook(() => useMentorFreeBlocks("m1", CURRENT_WEEK), createQueryWrapper())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    const callsBeforeFocus = spy.mock.calls.length

    act(() => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
    })

    await waitFor(() => expect(spy.mock.calls.length).toBeGreaterThan(callsBeforeFocus))
  })

  it("reutiliza la disponibilidad mientras la caché sigue fresca", async () => {
    const spy = vi.spyOn(availabilityApi, "getMentorFreeBlocks").mockResolvedValue([mockBlock])

    const { result, rerender } = renderHook(
      ({ weekRange }) => useMentorFreeBlocks("m1", weekRange),
      { ...createQueryWrapper(), initialProps: { weekRange: CURRENT_WEEK } },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    rerender({ weekRange: NEXT_WEEK })
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    rerender({ weekRange: CURRENT_WEEK })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(spy).toHaveBeenCalledTimes(2)
  })
})
