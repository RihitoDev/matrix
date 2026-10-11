import { describe, expect, it } from "vitest"
import { BLOCK_MESSAGES as MSG } from "../constants/availability.constants"
import { validateBlock } from "./block-validation"

// Ahora fijo: 1 de octubre de 2026, 08:00 en Bolivia (12:00 UTC).
const FIXED_NOW = new Date("2026-10-01T12:00:00Z")

const validate = (startAt: string, endAt: string) => validateBlock({ startAt, endAt }, FIXED_NOW)

describe("validateBlock", () => {
  it("acepta un bloque futuro válido (15:00 a 16:00 Bolivia)", () => {
    expect(validate("2026-10-10T19:00:00Z", "2026-10-10T20:00:00Z")).toEqual({})
  })

  it("acepta el borde 07:00 a 22:00 Bolivia", () => {
    expect(validate("2026-10-10T11:00:00Z", "2026-10-11T02:00:00Z")).toEqual({})
  })

  it("rechaza fin igual o anterior al inicio", () => {
    expect(validate("2026-10-10T20:00:00Z", "2026-10-10T19:00:00Z")).toEqual({ endAt: MSG.endBeforeStart })
    expect(validate("2026-10-10T19:00:00Z", "2026-10-10T19:00:00Z")).toEqual({ endAt: MSG.endBeforeStart })
  })

  it("rechaza un inicio que ya pasó", () => {
    expect(validate("2026-10-01T11:30:00Z", "2026-10-01T13:00:00Z").startAt).toBe(MSG.startInPast)
  })

  it("rechaza horas fuera de intervalos de 30 minutos", () => {
    expect(validate("2026-10-10T19:15:00Z", "2026-10-10T20:10:00Z")).toEqual({
      startAt: MSG.invalidStep,
      endAt: MSG.invalidStep,
    })
  })

  it("rechaza horas fuera del rango 07:00 a 22:00 Bolivia", () => {
    expect(validate("2026-10-10T10:00:00Z", "2026-10-10T12:00:00Z")).toEqual({ startAt: MSG.outOfRange })
    expect(validate("2026-10-11T01:00:00Z", "2026-10-11T02:30:00Z")).toEqual({ endAt: MSG.outOfRange })
  })

  it("usa dos dígitos en el mensaje de rango", () => {
    expect(MSG.outOfRange).toBe("El horario debe estar entre las 07:00 y las 22:00")
  })

  it("rechaza un bloque que cruza la medianoche de Bolivia", () => {
    expect(validate("2026-10-11T01:00:00Z", "2026-10-11T04:30:00Z")).toEqual({ endAt: MSG.differentDays })
  })

  it("usa la fecha actual por defecto", () => {
    expect(validateBlock({ startAt: "2020-01-01T12:00:00Z", endAt: "2020-01-01T13:00:00Z" }).startAt).toBe(MSG.startInPast)
  })
})
