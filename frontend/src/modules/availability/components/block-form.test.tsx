import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { BlockForm } from "./block-form"

// Ahora fijo: jueves 8 de octubre de 2026, 10:00 en Bolivia (14:00 UTC).
const FIXED_NOW = new Date("2026-10-08T14:00:00Z")

function renderForm(props: Partial<React.ComponentProps<typeof BlockForm>> = {}) {
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  render(<BlockForm mode="create" onSubmit={onSubmit} onCancel={onCancel} {...props} />)
  return { onSubmit, onCancel, user: userEvent.setup() }
}

async function fillForm(user: ReturnType<typeof userEvent.setup>, day: string, start: string, end: string) {
  await user.click(screen.getByRole("button", { name: day }))
  await user.selectOptions(screen.getByLabelText(/Hora de inicio/), start)
  await user.selectOptions(screen.getByLabelText(/Hora de fin/), end)
}

describe("BlockForm", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it("renderiza el modo creación con sus campos y botones", () => {
    renderForm()

    expect(screen.getByText("Nuevo bloque de disponibilidad")).toBeInTheDocument()
    expect(screen.getByLabelText(/Fecha/)).toHaveValue("")
    expect(screen.getByText("Los días anteriores a hoy no se pueden elegir.")).toBeInTheDocument()
    expect(screen.getByText(/Horario en hora de Bolivia/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Hora de inicio/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Hora de fin/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Guardar bloque" })).toBeInTheDocument()
  })

  it("deshabilita los días pasados y permite el día actual", () => {
    renderForm()

    expect(screen.getByRole("button", { name: "miércoles, 7 de octubre de 2026" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Hoy, jueves, 8 de octubre de 2026" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "viernes, 9 de octubre de 2026" })).toBeEnabled()
  })

  it("usa el día de Bolivia aunque en UTC ya sea el día siguiente", () => {
    // 22:00 del 8 de octubre en Bolivia = 02:00 UTC del 9 de octubre.
    vi.setSystemTime(new Date("2026-10-09T02:00:00Z"))
    renderForm()

    expect(screen.getByRole("button", { name: /jueves, 8 de octubre de 2026/ })).toBeEnabled()
  })

  it("ofrece horas de 07:00 a 22:00 cada 30 minutos", () => {
    renderForm()

    const options = Array.from((screen.getByLabelText(/Hora de inicio/) as HTMLSelectElement).options)
      .map((option) => option.value)
      .filter(Boolean)

    expect(options).toHaveLength(31)
    expect(options[0]).toBe("07:00")
    expect(options[1]).toBe("07:30")
    expect(options.at(-1)).toBe("22:00")
  })

  it("muestra los campos obligatorios sin llamar a onSubmit", async () => {
    const { onSubmit, user } = renderForm()

    await user.click(screen.getByRole("button", { name: "Guardar bloque" }))

    expect(screen.getByText("Selecciona una fecha")).toBeInTheDocument()
    expect(screen.getByText("Selecciona la hora de inicio")).toBeInTheDocument()
    expect(screen.getByText("Selecciona la hora de fin")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("muestra el error de fin anterior al inicio junto al campo de fin", async () => {
    const { onSubmit, user } = renderForm()

    await fillForm(user, "martes, 13 de octubre de 2026", "20:00", "18:00")
    await user.click(screen.getByRole("button", { name: "Guardar bloque" }))

    const endSelect = screen.getByLabelText(/Hora de fin/)
    const error = screen.getByText("La hora de fin debe ser posterior a la hora de inicio")
    expect(endSelect).toHaveAttribute("aria-invalid", "true")
    expect(endSelect).toHaveAttribute("aria-describedby", error.id)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("muestra el error de inicio pasado junto al campo de inicio", async () => {
    const { onSubmit, user } = renderForm()

    await fillForm(user, "Hoy, jueves, 8 de octubre de 2026", "08:00", "09:00")
    await user.click(screen.getByRole("button", { name: "Guardar bloque" }))

    const error = screen.getByText("La hora de inicio ya pasó")
    expect(screen.getByLabelText(/Hora de inicio/)).toHaveAttribute("aria-describedby", error.id)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("limpia el error del campo cuando el usuario lo corrige", async () => {
    const { user } = renderForm()

    await fillForm(user, "martes, 13 de octubre de 2026", "20:00", "18:00")
    await user.click(screen.getByRole("button", { name: "Guardar bloque" }))
    await user.selectOptions(screen.getByLabelText(/Hora de fin/), "21:00")

    expect(screen.queryByText("La hora de fin debe ser posterior a la hora de inicio")).not.toBeInTheDocument()
  })

  it("muestra la fecha elegida en el campo Fecha", async () => {
    const { user } = renderForm()

    await user.click(screen.getByRole("button", { name: "martes, 13 de octubre de 2026" }))

    expect(screen.getByLabelText(/Fecha/)).toHaveValue("Martes 13 de octubre de 2026")
  })

  it("envía el bloque en UTC cuando es válido", async () => {
    const { onSubmit, user } = renderForm()

    await fillForm(user, "martes, 13 de octubre de 2026", "18:00", "20:00")
    await user.click(screen.getByRole("button", { name: "Guardar bloque" }))

    expect(onSubmit).toHaveBeenCalledWith({
      startAt: "2026-10-13T22:00:00.000Z",
      endAt: "2026-10-14T00:00:00.000Z",
    })
  })

  it("Cancelar llama a onCancel sin enviar el formulario", async () => {
    const { onSubmit, onCancel, user } = renderForm()

    await fillForm(user, "martes, 13 de octubre de 2026", "18:00", "20:00")
    await user.click(screen.getByRole("button", { name: "Cancelar" }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("en modo edición carga initialValues en hora de Bolivia", async () => {
    const { onSubmit, user } = renderForm({
      mode: "edit",
      initialValues: { startAt: "2026-10-13T22:00:00.000Z", endAt: "2026-10-14T00:00:00.000Z" },
    })

    expect(screen.getByText("Editar bloque")).toBeInTheDocument()
    expect(screen.getByLabelText(/Día/)).toHaveValue("2026-10-13")
    expect(screen.getByText("Martes 13 de octubre")).toBeInTheDocument()
    expect(screen.getByLabelText(/Desde/)).toHaveValue("18:00")
    expect(screen.getByLabelText(/Hasta/)).toHaveValue("20:00")
    expect(screen.queryByText(/Horario en hora de Bolivia/)).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }))

    expect(onSubmit).toHaveBeenCalledWith({
      startAt: "2026-10-13T22:00:00.000Z",
      endAt: "2026-10-14T00:00:00.000Z",
    })
  })

  it("en modo edición muestra el chip rosa y el borde de tarjeta, oculta el calendario y pinta el botón rojo", () => {
    renderForm({
      mode: "edit",
      initialValues: { startAt: "2026-10-13T22:00:00.000Z", endAt: "2026-10-14T00:00:00.000Z" },
    })

    expect(screen.getByText("Martes 13 de octubre")).toHaveClass("bg-danger/10")
    const card = screen.getByText("Editar bloque").closest('[data-slot="card"]')
    expect(card).toHaveClass("ring-1", "ring-border-strong")
    expect(screen.queryByText("Los días anteriores a hoy no se pueden elegir.")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: "martes, 13 de octubre de 2026" }),
    ).not.toBeInTheDocument()

    const submit = screen.getByRole("button", { name: "Guardar cambios" })
    expect(submit).toHaveClass("bg-accent", "text-surface")
  })

  it("deshabilita el envío mientras se guarda y muestra el error del servidor", () => {
    renderForm({ isSubmitting: true, submitError: "Error al crear el bloque de disponibilidad" })

    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled()
    expect(screen.getByText("Error al crear el bloque de disponibilidad")).toBeInTheDocument()
  })
})
