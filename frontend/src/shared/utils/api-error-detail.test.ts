import { describe, expect, it } from "vitest"
import { getApiErrorDetail } from "./api-error-detail"

describe("getApiErrorDetail", () => {
  it("extrae el detail del error de negocio del backend", () => {
    const error = { response: { data: { statusCode: 409, detail: "El bloque tiene una cita asociada", ok: false } } }

    expect(getApiErrorDetail(error)).toBe("El bloque tiene una cita asociada")
  })

  it("devuelve undefined cuando no hay respuesta (red caída)", () => {
    expect(getApiErrorDetail(new Error("Network error"))).toBeUndefined()
  })

  it("devuelve undefined cuando el detail está vacío o no es texto", () => {
    expect(getApiErrorDetail({ response: { data: { detail: "" } } })).toBeUndefined()
    expect(getApiErrorDetail({ response: { data: { detail: 409 } } })).toBeUndefined()
    expect(getApiErrorDetail({ response: { data: {} } })).toBeUndefined()
  })

  it("devuelve undefined para valores no objeto", () => {
    expect(getApiErrorDetail(undefined)).toBeUndefined()
    expect(getApiErrorDetail(null)).toBeUndefined()
    expect(getApiErrorDetail("boom")).toBeUndefined()
  })
})
