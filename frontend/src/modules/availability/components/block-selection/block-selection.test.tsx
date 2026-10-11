import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { getWeekRange } from "@/shared/utils/date-time"
import { BlockSelection } from "./block-selection"
import { BLOCK_SELECTION_TEXT } from "../../constants/block-selection.constants"
import type { AvailabilityBlock } from "../../types/availability-block.types"

const tuesdayBlock: AvailabilityBlock = {
  id: "1",
  mentorId: "m1",
  startAt: "2026-10-06T22:00:00.000Z",
  endAt: "2026-10-06T23:00:00.000Z",
  state: "free",
  createdAt: "",
  updatedAt: "",
}

const saturdayBlock: AvailabilityBlock = {
  ...tuesdayBlock,
  id: "2",
  startAt: "2026-10-10T14:00:00.000Z",
  endAt: "2026-10-10T15:00:00.000Z",
}

const weekRange = getWeekRange(tuesdayBlock.startAt)
const tuesdayButton = "libre, 18:00 a 19:00"
const saturdayButton = "libre, 10:00 a 11:00"

const renderSelection = (fetchFreeBlocks: () => Promise<AvailabilityBlock[]>) =>
  render(
    <BlockSelection
      blocks={[tuesdayBlock, saturdayBlock]}
      weekRange={weekRange}
      fetchFreeBlocks={fetchFreeBlocks}
    />
  )

describe("BlockSelection", () => {
  afterEach(() => {
    cleanup()
  })

  it("resalta en Tu selección el bloque libre marcado", async () => {
    const fetchFreeBlocks = vi.fn().mockResolvedValue([tuesdayBlock, saturdayBlock])
    renderSelection(fetchFreeBlocks)

    await userEvent.click(screen.getByRole("button", { name: tuesdayButton }))

    await waitFor(() => {
      expect(screen.getByText("Martes 6 de octubre de 2026")).toBeInTheDocument()
    })
    expect(fetchFreeBlocks).toHaveBeenCalledTimes(1)
    expect(screen.getByRole("button", { name: BLOCK_SELECTION_TEXT.requestAppointment })).toBeDisabled()
    expect(screen.getByRole("button", { name: tuesdayButton })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: saturdayButton })).not.toHaveAttribute("aria-pressed")
  })

  it("cambia la selección al marcar otro bloque", async () => {
    const fetchFreeBlocks = vi.fn().mockResolvedValue([tuesdayBlock, saturdayBlock])
    renderSelection(fetchFreeBlocks)

    await userEvent.click(screen.getByRole("button", { name: tuesdayButton }))
    await userEvent.click(screen.getByRole("button", { name: saturdayButton }))

    await waitFor(() => {
      expect(screen.getByText("Sábado 10 de octubre de 2026")).toBeInTheDocument()
    })
    expect(screen.queryByText("Martes 6 de octubre de 2026")).not.toBeInTheDocument()
  })

  it("muestra no disponible y quita de la grilla un bloque tomado por otro", async () => {
    const fetchFreeBlocks = vi.fn().mockResolvedValue([saturdayBlock])
    renderSelection(fetchFreeBlocks)

    await userEvent.click(screen.getByRole("button", { name: tuesdayButton }))

    await waitFor(() => {
      expect(screen.getByText(BLOCK_SELECTION_TEXT.unavailableTitle)).toBeInTheDocument()
    })
    expect(screen.queryByRole("button", { name: tuesdayButton })).not.toBeInTheDocument()
    expect(screen.getByText(BLOCK_SELECTION_TEXT.empty)).toBeInTheDocument()
  })
})
