import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { BlockSelectionPanel } from "./block-selection-panel"
import { BOLIVIA_TIME_LABEL } from "@/shared/constants/date-time.constants"
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

const renderPanel = (props: Partial<React.ComponentProps<typeof BlockSelectionPanel>> = {}) =>
  render(
    <BlockSelectionPanel
      selectedBlock={null}
      unavailableBlock={null}
      isChecking={false}
      error={null}
      {...props}
    />
  )

describe("BlockSelectionPanel", () => {
  afterEach(() => {
    cleanup()
  })

  it("muestra el estado vacío y Solicitar cita deshabilitado", () => {
    renderPanel()

    expect(screen.getByText(BLOCK_SELECTION_TEXT.title)).toBeInTheDocument()
    expect(screen.getByText(BLOCK_SELECTION_TEXT.empty)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: BLOCK_SELECTION_TEXT.requestAppointment })).toBeDisabled()
  })

  it("muestra la fecha, la hora en Bolivia y la duración del bloque seleccionado", () => {
    renderPanel({ selectedBlock: tuesdayBlock })

    expect(screen.getByText("Martes 6 de octubre de 2026")).toBeInTheDocument()
    expect(screen.getByText("18:00 - 19:00 · 60 min")).toBeInTheDocument()
    expect(screen.getByText(BOLIVIA_TIME_LABEL)).toBeInTheDocument()
    expect(screen.queryByText(BLOCK_SELECTION_TEXT.empty)).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: BLOCK_SELECTION_TEXT.requestAppointment })).toBeDisabled()
  })

  it("muestra no disponible para un bloque tomado", () => {
    renderPanel({ unavailableBlock: tuesdayBlock })

    expect(screen.getByText(BLOCK_SELECTION_TEXT.unavailableTitle)).toBeInTheDocument()
    expect(screen.getByText(/Martes 6 de octubre de 2026, 18:00 - 19:00/)).toBeInTheDocument()
  })

  it("muestra un skeleton en lugar del bloque mientras verifica", () => {
    renderPanel({ isChecking: true, selectedBlock: tuesdayBlock })

    expect(screen.getByText(BLOCK_SELECTION_TEXT.checking)).toBeInTheDocument()
    expect(screen.queryByText("Martes 6 de octubre de 2026")).not.toBeInTheDocument()
  })

  it("muestra el error de verificación", () => {
    renderPanel({ error: BLOCK_SELECTION_TEXT.checkError })

    expect(screen.getByText(BLOCK_SELECTION_TEXT.checkError)).toBeInTheDocument()
  })
})
