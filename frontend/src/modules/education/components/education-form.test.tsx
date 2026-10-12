import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useEducationInstitutions } from "../hooks/use-education-institutions";
import type { EducationFormValues } from "../types/education-form-values.types";
import type { EducationFormProps } from "../types/education-form-props.types";
import { EducationForm } from "./education-form";

vi.mock("../hooks/use-education-institutions", () => ({ useEducationInstitutions: vi.fn() }));
const INSTITUTIONS = [{ name: 'Universidad Mayor de San Simón (UMSS)', aliases: ['UMSS', 'Universidad Mayor de San Simón'] }];

const VALUES: EducationFormValues = {
  institution: "Universidad Mayor de San Simón (UMSS)",
  degree: "Ingeniería Informática",
  startDate: "2020-02-01",
  endDate: "2025-11-30",
  description: "Software engineering studies.",
};

function setupForm(overrides: Partial<EducationFormProps> = {}) {
  const user = userEvent.setup();
  const props = { onSubmit: vi.fn(), onCancel: vi.fn(), ...overrides };
  const view = render(<EducationForm {...props} />);
  return { ...view, user, ...props };
}

describe("EducationForm", () => {
  beforeEach(() => {
    vi.mocked(useEducationInstitutions).mockReturnValue({ institutions: INSTITUTIONS, isLoading: false, error: null, reload: vi.fn() });
  });
  afterEach(() => { cleanup(); vi.resetAllMocks(); });

  describe("Universidad y carrera", () => {
    it('filters by university, clears incompatible degrees and submits the recognized pair', async () => {
      const upb = { name: 'Universidad Privada Boliviana (UPB)', aliases: ['UPB'] };
      vi.mocked(useEducationInstitutions).mockReturnValue({ institutions: [...INSTITUTIONS, upb], isLoading: false, error: null, reload: vi.fn() });
      const { user, onSubmit } = setupForm({ initialValues: VALUES });
      const degree = screen.getByRole('combobox', { name: /Título o carrera/ });
      await user.clear(degree);
      await user.type(degree, 'inteligencia');
      expect(screen.queryByRole('option', { name: /Inteligencia Artificial/ })).not.toBeInTheDocument();
      await user.clear(screen.getByLabelText(/Institución/));
      expect(screen.getByLabelText(/Título o carrera/)).toBeDisabled();
      await user.type(screen.getByLabelText(/Institución/), 'UPB');
      const upbDegree = screen.getByRole('combobox', { name: /Título o carrera/ });
      expect(upbDegree).toHaveValue('');
      await user.type(upbDegree, 'inteligencia');
      expect(screen.getAllByRole('option')).toHaveLength(1);
      await user.keyboard('{ArrowDown}{Enter}');
      expect(onSubmit).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Guardar formación' }));
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ ...VALUES, institution: upb.name, degree: 'Ingeniería en Inteligencia Artificial' });
    });

    it('preserves a shared degree after typing a different university', async () => {
      const ucatec = { name: 'Universidad Privada de Ciencias Administrativas y Tecnológicas (UCATEC)', aliases: ['UCATEC'] };
      vi.mocked(useEducationInstitutions).mockReturnValue({ institutions: [...INSTITUTIONS, ucatec], isLoading: false, error: null, reload: vi.fn() });
      const { user } = setupForm({ initialValues: { ...VALUES, degree: 'Ingeniería de Sistemas' } });
      await user.clear(screen.getByLabelText(/Institución/));
      await user.type(screen.getByLabelText(/Institución/), 'UCATEC');
      expect(screen.getByLabelText(/Título o carrera/)).toHaveValue('Ingeniería de Sistemas');
      expect(screen.getByLabelText(/Título o carrera/)).toBeEnabled();
    });

    it('keeps an unknown legacy title visible and requires correction before saving', async () => {
      const { user, onSubmit } = setupForm({ initialValues: { ...VALUES, degree: 'Legacy unknown title' } });
      await user.click(screen.getByRole('button', { name: 'Guardar formación' }));
      expect(onSubmit).not.toHaveBeenCalled();
      const degree = screen.getByLabelText(/Título o carrera/);
      expect(degree).toHaveValue('Legacy unknown title');
      expect(degree).toHaveAccessibleDescription('Selecciona una carrera de Ciencias y Tecnología de la universidad elegida.');
      await user.clear(degree);
      await user.type(degree, '  ingenieria en informatica  ');
      await user.click(screen.getByRole('button', { name: 'Guardar formación' }));
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith(VALUES);
    });

    it.each(['Universidad Privada Abierta Latinoamericana (UPAL)', 'Universidad NUR', 'Universidad Pedagógica'])(
      'preserves excluded legacy institution %s until a valid selection is made', async (institution) => {
        const { user, onSubmit } = setupForm({ initialValues: { ...VALUES, institution } });
        expect(screen.getByLabelText(/Institución/)).toHaveValue(institution);
        expect(screen.getByLabelText(/Título o carrera/)).toHaveValue(VALUES.degree);
        expect(screen.getByLabelText(/Título o carrera/)).toBeDisabled();
        await user.click(screen.getByRole('button', { name: 'Guardar formación' }));
        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getByLabelText(/Institución/)).toHaveAccessibleDescription('Selecciona una universidad de la lista permitida.');
        await user.clear(screen.getByLabelText(/Institución/));
        await user.type(screen.getByLabelText(/Institución/), 'UMSS');
        await user.click(screen.getByRole('option', { name: VALUES.institution }));
        await user.click(screen.getByRole('button', { name: 'Guardar formación' }));
        expect(onSubmit).toHaveBeenCalledExactlyOnceWith(VALUES);
      },
    );

    it('filters universities by alias and selects with the keyboard without submitting', async () => {
      const { user, onSubmit } = setupForm({ initialValues: { ...VALUES, institution: '' } });
      const input = screen.getByRole('combobox', { name: /Institución/ });
      await user.type(input, 'umss');
      expect(screen.getByRole('option', { name: INSTITUTIONS[0].name })).toBeVisible();
      await user.keyboard('{ArrowDown}');
      expect(input).toHaveAttribute('aria-activedescendant');
      await user.keyboard('{Enter}');
      expect(input).toHaveValue(INSTITUTIONS[0].name);
      expect(input).toHaveAttribute('aria-expanded', 'false');
      expect(onSubmit).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Guardar formación' }));
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith(VALUES);
    });

    it.each([false, true])('rejects unknown typed or legacy institution (editing: %s)', async (editing) => {
      const { user, onSubmit } = setupForm({ initialValues: editing ? { ...VALUES, institution: 'gggggg' } : VALUES });
      if (!editing) {
        await user.clear(screen.getByRole('combobox', { name: /Institución/ }));
        await user.type(screen.getByRole('combobox', { name: /Institución/ }), 'gggggg');
        expect(screen.getByText('No se encontraron universidades.')).toBeVisible();
      }
      await user.click(screen.getByRole('button', { name: 'Guardar formación' }));
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByRole('combobox', { name: /Institución/ })).toHaveAccessibleDescription('Selecciona una universidad de la lista permitida.');
      expect(screen.getByRole('combobox', { name: /Institución/ })).toHaveValue('gggggg');
    });

    it('canonicalizes a recognized legacy alias when editing', async () => {
      const { user, onSubmit } = setupForm({ initialValues: { ...VALUES, institution: ' umss ' } });
      await user.click(screen.getByRole('button', { name: 'Guardar formación' }));
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith(VALUES);
    });
  });

  describe("Validaciones y descripción", () => {
    it.each(['startDate', 'endDate'] as const)('rejects an early %s and advertises the minimum', async (field) => {
      const { user, onSubmit } = setupForm({ initialValues: { ...VALUES, [field]: '1939-12-31' } });
      expect(screen.getByLabelText(/Desde/)).toHaveAttribute('min', '1940-01-01');
      expect(screen.getByLabelText(/Hasta/)).toHaveAttribute('min', '1940-01-01');
      await user.click(screen.getByRole('button', { name: 'Guardar formación' }));
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Fecha inválida.')).toBeVisible();
    });

    it("updates the description counter while typing, deleting and clearing before saving", async () => {
      const { user, onSubmit } = setupForm();
      const description = screen.getByLabelText(/Descripción/);
      expect(screen.getByText("0/400")).toBeInTheDocument();
      expect(description).toHaveAccessibleDescription("0/400");
      await user.type(description, "a".repeat(50));
      expect(screen.getByText("50/400")).toBeInTheDocument();
      await user.keyboard("{Backspace}");
      expect(screen.getByText("49/400")).toBeInTheDocument();
      await user.clear(description);
      expect(screen.getByText("0/400")).toBeInTheDocument();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("limits pasted text to 400 characters and allows saving at the limit", async () => {
      const { user, onSubmit } = setupForm({ initialValues: { ...VALUES, description: "" } });
      const description = screen.getByLabelText(/Descripción/);
      expect(description).toHaveAttribute("maxlength", "400");
      await user.click(description);
      await user.paste("a".repeat(450));
      expect(description).toHaveValue("a".repeat(400));
      expect(screen.getByText("400/400")).toBeInTheDocument();
      await user.type(description, "b");
      expect(description).toHaveValue("a".repeat(400));
      await user.click(screen.getByRole("button", { name: "Guardar formación" }));
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ ...VALUES, description: "a".repeat(400) });
    });

    it("preserves an oversized existing description and requires correction before saving", async () => {
      const { user, onSubmit } = setupForm({ initialValues: { ...VALUES, description: "a".repeat(401) } });
      const description = screen.getByLabelText(/Descripción/);
      expect(screen.getByText("401/400")).toBeInTheDocument();
      expect(description).toHaveValue("a".repeat(401));
      await user.click(screen.getByRole("button", { name: "Guardar formación" }));
      expect(onSubmit).not.toHaveBeenCalled();
      expect(description).toHaveAttribute("aria-invalid", "true");
      expect(description).toHaveAccessibleDescription("La descripción no puede superar los 400 caracteres. 401/400");
      await user.clear(description);
      expect(description).toHaveAttribute("aria-invalid", "false");
      expect(screen.getByText("0/400")).toBeInTheDocument();
      await user.click(screen.getByRole("button", { name: "Guardar formación" }));
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ ...VALUES, description: "" });
    });

    it("shows accessible errors and blocks an empty submission", async () => {
      const { user, onSubmit } = setupForm();
      await user.click(screen.getByRole("button", { name: "Guardar formación" }));

      expect(onSubmit).not.toHaveBeenCalled();
      for (const label of [/Institución/, /Título o carrera/, /Desde/, /Hasta/]) {
        expect(screen.getByLabelText(label)).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText(label)).toHaveAccessibleDescription();
      }
      expect(screen.getByText("La fecha de fin es obligatoria.")).toBeInTheDocument();
    });

    it("revalidates both dates when correcting the start date and allows no description", async () => {
      const { user, onSubmit } = setupForm({ initialValues: { ...VALUES, startDate: "2026-01-01", description: "" } });
      await user.click(screen.getByRole("button", { name: "Guardar formación" }));
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByLabelText(/Hasta/)).toHaveAccessibleDescription("La fecha de fin no puede ser anterior a la fecha de inicio.");

      fireEvent.change(screen.getByLabelText(/Desde/), { target: { value: VALUES.endDate } });
      expect(screen.getByLabelText(/Hasta/)).toHaveAttribute("aria-invalid", "false");
      await user.click(screen.getByRole("button", { name: "Guardar formación" }));
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ ...VALUES, startDate: VALUES.endDate, description: "" });
    });
  });

  describe("Creación y edición", () => {
    it("submits the values entered in the create form", async () => {
      const { user, onSubmit } = setupForm();

      await user.type(screen.getByLabelText(/Institución/), VALUES.institution);
      await user.type(screen.getByLabelText(/Título o carrera/), VALUES.degree);
      await user.type(screen.getByLabelText(/Desde/), VALUES.startDate);
      await user.type(screen.getByLabelText(/Hasta/), VALUES.endDate);
      await user.type(screen.getByLabelText(/Descripción/), VALUES.description);
      await user.click(screen.getByRole("button", { name: "Guardar formación" }));

      expect(onSubmit).toHaveBeenCalledExactlyOnceWith(VALUES);
    });

    it("prefills all fields when editing and submits the changes", async () => {
      const { user, onSubmit } = setupForm({ initialValues: VALUES });

      expect(screen.getByRole("form", { name: "Editar formación" })).toBeInTheDocument();
      expect(screen.getByLabelText(/Institución/)).toHaveValue(VALUES.institution);
      expect(screen.getByLabelText(/Título o carrera/)).toHaveValue(VALUES.degree);
      expect(screen.getByLabelText(/Desde/)).toHaveValue(VALUES.startDate);
      expect(screen.getByLabelText(/Hasta/)).toHaveValue(VALUES.endDate);
      expect(screen.getByLabelText(/Descripción/)).toHaveValue(VALUES.description);

      await user.clear(screen.getByLabelText(/Título o carrera/));
      await user.type(screen.getByLabelText(/Título o carrera/), "Ingeniería de Sistemas");
      await user.click(screen.getByRole("button", { name: "Guardar formación" }));

      expect(onSubmit).toHaveBeenCalledWith({ ...VALUES, degree: "Ingeniería de Sistemas" });
    });

    it("allows editing a legacy description with an empty non-required end date", async () => {
      const { user, onSubmit } = setupForm({ initialValues: { ...VALUES, endDate: "" }, allowMissingEndDate: true });
      expect(screen.getByLabelText(/Hasta/)).not.toBeRequired();
      fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: "Updated description" } });
      await user.click(screen.getByRole("button", { name: "Guardar formación" }));
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ ...VALUES, endDate: "", description: "Updated description" });
    });

    it("does not allow clearing an existing end date", async () => {
      const { user, onSubmit } = setupForm({ initialValues: VALUES });
      fireEvent.change(screen.getByLabelText(/Hasta/), { target: { value: "" } });
      await user.click(screen.getByRole("button", { name: "Guardar formación" }));
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByLabelText(/Hasta/)).toBeRequired();
    });
  });

  describe("Carga, errores y acciones bloqueadas", () => {
    it.each([true, false])('blocks even programmatic submissions while catalogue is unavailable (loading: %s)', (loading) => {
      const onSubmit = vi.fn();
      vi.mocked(useEducationInstitutions).mockReturnValue({ institutions: [], isLoading: loading, error: loading ? null : 'No se pudo cargar la lista de universidades.', reload: vi.fn() });
      render(<EducationForm initialValues={VALUES} onSubmit={onSubmit} onCancel={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Guardar formación' })).toBeDisabled();
      expect(screen.getByRole('combobox', { name: /Institución/ })).toBeDisabled();
      fireEvent.submit(screen.getByRole('form'));
      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText(loading ? 'Cargando universidades...' : 'No se pudo cargar la lista de universidades.')).toBeVisible();
    });

    it("blocks input, cancellation and submissions while saving", async () => {
      const { user, onSubmit, onCancel } = setupForm({ initialValues: VALUES, isPending: true });

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
      const { user, onSubmit, onCancel } = setupForm({ initialValues: VALUES });
      await user.click(screen.getByRole("button", { name: "Cancelar" }));

      expect(onCancel).toHaveBeenCalledOnce();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
