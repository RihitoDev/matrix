import { describe, it, expect, vi, beforeEach } from "vitest"
import { availabilityApi } from "./availability.api"
import { apiClient } from "@/shared/services/api-client"
import type { AvailabilityBlock } from "../types/availability-block.types"

const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

const mockBlock: AvailabilityBlock = {
  id: "1",
  mentorId: "m1",
  startAt: "2024-01-15T10:00:00Z",
  endAt: "2024-01-15T11:00:00Z",
  state: "free",
  createdAt: "",
  updatedAt: "",
}

describe("availabilityApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("getAvailabilityBlocks envía from y to en UTC", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({ data: [mockBlock] })

    const result = await availabilityApi.getAvailabilityBlocks({
      from: "2024-01-15T00:00:00Z",
      to: "2024-01-16T00:00:00Z",
    })

    expect(getSpy).toHaveBeenCalledWith(
      "/availability-blocks?from=2024-01-15T00%3A00%3A00.000Z&to=2024-01-16T00%3A00%3A00.000Z"
    )
    expect(result).toEqual([mockBlock])
  })

  it("getAvailabilityBlocks llama a la API sin filtros", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({ data: [mockBlock] })

    const result = await availabilityApi.getAvailabilityBlocks()

    expect(getSpy).toHaveBeenCalledWith("/availability-blocks")
    expect(result).toEqual([mockBlock])
  })

  it("getMentorFreeBlocks llama a la ruta de bloques libres del mentor", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({ data: [mockBlock] })

    const result = await availabilityApi.getMentorFreeBlocks("m1", {
      startAt: "2026-10-05T04:00:00.000Z",
      endAt: "2026-10-12T03:59:59.999Z",
    })

    expect(getSpy).toHaveBeenCalledWith(
      "/mentors/m1/free-blocks?from=2026-10-05T04%3A00%3A00.000Z&to=2026-10-12T03%3A59%3A59.999Z",
    )
    expect(result).toEqual([mockBlock])
  })

  it("getAvailabilityBlockById llama a la API con ID correcto", async () => {
    const getSpy = vi.spyOn(apiClient, "get").mockResolvedValue({ data: mockBlock })

    const result = await availabilityApi.getAvailabilityBlockById("1")

    expect(getSpy).toHaveBeenCalledWith("/availability-blocks/1")
    expect(result).toEqual(mockBlock)
  })

  it("createAvailabilityBlock envía solo startAt y endAt en ISO", async () => {
    const postSpy = vi.spyOn(apiClient, "post").mockResolvedValue({ data: mockBlock })

    await availabilityApi.createAvailabilityBlock({ startAt: "2024-01-15T10:00", endAt: "2024-01-15T11:00" })

    const [url, payload] = postSpy.mock.calls[0] as [string, Record<string, unknown>]
    expect(url).toBe("/availability-blocks")
    expect(Object.keys(payload).sort()).toEqual(["endAt", "startAt"])
    expect(payload.startAt).toMatch(ISO_UTC)
    expect(payload.endAt).toMatch(ISO_UTC)
  })

  it("updateAvailabilityBlock llama a la API con ID y datos correctos", async () => {
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({ data: mockBlock })

    await availabilityApi.updateAvailabilityBlock("1", { startAt: "2024-01-15T12:00" })

    const [url, payload] = patchSpy.mock.calls[0] as [string, Record<string, unknown>]
    expect(url).toBe("/availability-blocks/1")
    expect(Object.keys(payload)).toEqual(["startAt"])
    expect(payload.startAt).toMatch(ISO_UTC)
  })

  it("updateAvailabilityBlock codifica el ID con caracteres especiales", async () => {
    const patchSpy = vi.spyOn(apiClient, "patch").mockResolvedValue({ data: mockBlock })

    await availabilityApi.updateAvailabilityBlock("a/b&c", { startAt: "2024-01-15T12:00" })

    expect(patchSpy).toHaveBeenCalledWith("/availability-blocks/a%2Fb%26c", expect.any(Object))
  })

  it("deleteAvailabilityBlock llama a la API con ID correcto", async () => {
    const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValue({})

    await availabilityApi.deleteAvailabilityBlock("1")

    expect(deleteSpy).toHaveBeenCalledWith("/availability-blocks/1")
  })

  it("deleteAvailabilityBlock codifica el ID con caracteres especiales", async () => {
    const deleteSpy = vi.spyOn(apiClient, "delete").mockResolvedValue({})

    await availabilityApi.deleteAvailabilityBlock("a/b&c")

    expect(deleteSpy).toHaveBeenCalledWith("/availability-blocks/a%2Fb%26c")
  })
})
