import { afterEach, describe, expect, it, vi } from "vitest"
import { formatDayAndMonth, formatLongDate, getBoliviaToday, toCalendarDate, toDateString } from "./calendar-date"
import { pad } from "./pad"

describe("calendar-date", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it("pad completa con cero a dos dígitos", () => {
    expect(pad(7)).toBe("07")
    expect(pad(22)).toBe("22")
  })

  it("convierte entre YYYY-MM-DD y fecha de calendario", () => {
    const date = toCalendarDate("2026-10-03")

    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(9)
    expect(date.getDate()).toBe(3)
    expect(toDateString(date)).toBe("2026-10-03")
  })

  it("formatea la fecha larga en español", () => {
    expect(formatLongDate("2026-10-10")).toBe("Sábado 10 de octubre de 2026")
  })

  it("formatea el día y el mes sin el año", () => {
    expect(formatDayAndMonth("2026-10-10")).toBe("Sábado 10 de octubre")
  })

  it("devuelve el día actual de Bolivia aunque en UTC sea el día siguiente", () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-10-09T02:00:00Z"))

    expect(toDateString(getBoliviaToday())).toBe("2026-10-08")
  })
})
