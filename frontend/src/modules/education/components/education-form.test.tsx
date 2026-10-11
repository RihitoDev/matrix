import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { EducationFormValues } from "../types/education-form-values.types";
import { EducationForm } from "./education-form";

const VALUES: EducationFormValues = {
  institution: "Example University",
  degree: "Computer Science",
  startDate: "2020-02-01",
  endDate: "2025-11-30",
  description: "Software engineering studies.",
};

describe("EducationForm", () => {
  afterEach(cleanup);

  it("shows accessible errors and blocks an empty submission", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EducationForm onSubmit={onSubmit} onCancel={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));

    expect(onSubmit).not.toHaveBeenCalled();
    for (const label of [/Institución/, /Título o carrera/, /Desde/, /Hasta/]) {
      expect(screen.getByLabelText(label)).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByLabelText(label)).toHaveAccessibleDescription();
    }
    expect(screen.getByText("La fecha de fin es obligatoria.")).toBeInTheDocument();
  });

  it("revalidates both dates when correcting the start date and allows no description", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EducationForm initialValues={{ ...VALUES, startDate: "2026-01-01", description: "" }} onSubmit={onSubmit} onCancel={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Hasta/)).toHaveAccessibleDescription("La fecha de fin no puede ser anterior a la fecha de inicio.");

    fireEvent.change(screen.getByLabelText(/Desde/), { target: { value: VALUES.endDate } });
    expect(screen.getByLabelText(/Hasta/)).toHaveAttribute("aria-invalid", "false");
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ ...VALUES, startDate: VALUES.endDate, description: "" });
  });

  it("submits the values entered in the create form", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EducationForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/Institución/), VALUES.institution);
    await user.type(screen.getByLabelText(/Título o carrera/), VALUES.degree);
    await user.type(screen.getByLabelText(/Desde/), VALUES.startDate);
    await user.type(screen.getByLabelText(/Hasta/), VALUES.endDate);
    await user.type(screen.getByLabelText(/Descripción/), VALUES.description);
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(VALUES);
  });

  it("prefills all fields when editing and submits the changes", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EducationForm initialValues={VALUES} onSubmit={onSubmit} onCancel={vi.fn()} />);

    expect(screen.getByRole("form", { name: "Editar formación" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Institución/)).toHaveValue(VALUES.institution);
    expect(screen.getByLabelText(/Título o carrera/)).toHaveValue(VALUES.degree);
    expect(screen.getByLabelText(/Desde/)).toHaveValue(VALUES.startDate);
    expect(screen.getByLabelText(/Hasta/)).toHaveValue(VALUES.endDate);
    expect(screen.getByLabelText(/Descripción/)).toHaveValue(VALUES.description);

    await user.clear(screen.getByLabelText(/Título o carrera/));
    await user.type(screen.getByLabelText(/Título o carrera/), "Systems Engineering");
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));

    expect(onSubmit).toHaveBeenCalledWith({ ...VALUES, degree: "Systems Engineering" });
  });

  it("blocks input, cancellation and submissions while saving", async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<EducationForm initialValues={VALUES} isPending onSubmit={onSubmit} onCancel={onCancel} />);

    for (const label of [/Institución/, /Título o carrera/, /Desde/, /Hasta/, /Descripción/]) {
      expect(screen.getByLabelText(label)).toBeDisabled();
    }
    expect(screen.getByRole("button", { name: "Guardando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("form")).toHaveAttribute("aria-busy", "true");
    fireEvent.submit(screen.getByRole("form"));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("keeps the entered values when an error is displayed after saving", async () => {
    const props = { onSubmit: vi.fn(), onCancel: vi.fn() };
    const user = userEvent.setup();
    const { rerender } = render(<EducationForm {...props} />);
    await user.type(screen.getByLabelText(/Institución/), VALUES.institution);
    rerender(<EducationForm {...props} isPending />);
    rerender(<EducationForm {...props} feedback={{ type: "error", message: "No se pudo guardar." }} />);

    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar.");
    expect(screen.getByLabelText(/Institución/)).toHaveValue(VALUES.institution);
    expect(screen.getByRole("button", { name: "Guardar formación" })).toBeEnabled();
  });

  it("cancels without submitting the form", async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(<EducationForm initialValues={VALUES} onSubmit={onSubmit} onCancel={onCancel} />);
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("allows editing a legacy description with an empty non-required end date", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EducationForm initialValues={{ ...VALUES, endDate: "" }} allowMissingEndDate onSubmit={onSubmit} onCancel={vi.fn()} />);
    expect(screen.getByLabelText(/Hasta/)).not.toBeRequired();
    fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: "Updated description" } });
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ ...VALUES, endDate: "", description: "Updated description" });
  });

  it("does not allow clearing an existing end date", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<EducationForm initialValues={VALUES} onSubmit={onSubmit} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Hasta/), { target: { value: "" } });
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Hasta/)).toBeRequired();
  });
});
