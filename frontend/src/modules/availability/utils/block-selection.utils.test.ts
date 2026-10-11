import { describe, expect, it } from "vitest"
import { formatBlockDate, getBlockDurationMinutes } from "./block-selection.utils"

describe("block-selection utils", () => {
  it("formatea la fecha del bloque en hora de Bolivia", () => {
    expect(formatBlockDate("2026-10-07T02:00:00.000Z")).toBe("Martes 6 de octubre de 2026")
  })

  it("calcula la duración del bloque en minutos", () => {
    expect(getBlockDurationMinutes("2026-10-06T22:00:00.000Z", "2026-10-06T23:30:00.000Z")).toBe(90)
  })
})
