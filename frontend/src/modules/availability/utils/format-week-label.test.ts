import { describe, expect, it } from "vitest"
import { formatWeekLabel } from "./format-week-label"

describe("formatWeekLabel", () => {
  it("muestra la semana en hora de Bolivia", () => {
    expect(
      formatWeekLabel({ startAt: "2026-10-05T04:00:00.000Z", endAt: "2026-10-12T03:59:59.999Z" }),
    ).toBe("5 – 11 de octubre de 2026")
  })

  it("muestra ambos meses cuando la semana cruza el cambio de mes", () => {
    expect(
      formatWeekLabel({ startAt: "2026-09-28T04:00:00.000Z", endAt: "2026-10-05T03:59:59.999Z" }),
    ).toBe("28 de septiembre – 4 de octubre de 2026")
  })

  it("muestra ambos años cuando la semana cruza el cambio de año", () => {
    expect(
      formatWeekLabel({ startAt: "2026-12-28T04:00:00.000Z", endAt: "2027-01-04T03:59:59.999Z" }),
    ).toBe("28 de diciembre de 2026 – 3 de enero de 2027")
  })
})
