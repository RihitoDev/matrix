import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { educationsService } from "../services/educations.service";
import type { EducationItem } from "../types/education-item.types";
import type { EducationFormValues } from "../types/education-form-values.types";
import { EDUCATION_FEEDBACK_MESSAGES } from "../constants/education-feedback.constants";
import { EducationView } from "./education-view";

vi.mock("../services/educations.service", () => ({
  educationsService: {
    getInstitutions: vi.fn(),
    getEducations: vi.fn(),
    createEducation: vi.fn(),
    updateEducation: vi.fn(),
    deleteEducation: vi.fn(),
  },
}));

const EDUCATIONS: EducationItem[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    institution: "Universidad Mayor de San Simón (UMSS)",
    degree: "Ingeniería Informática",
    startDate: "2021-02-01",
    endDate: "2025-11-30",
    description: "Software development studies.",
    createdAt: "2025-12-01T00:00:00.000Z",
    updatedAt: "2025-12-01T00:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    institution: "Universidad Privada Boliviana (UPB)",
    degree: "Ingeniería Civil",
    startDate: "2015-02-01",
    endDate: "2020-11-30",
    description: null,
    createdAt: "2025-12-01T00:00:00.000Z",
    updatedAt: "2025-12-01T00:00:00.000Z",
  },
];

function setupView() {
  const user = userEvent.setup();
  render(<EducationView />);
  return user;
}

async function openForm(user: ReturnType<typeof userEvent.setup>, action = "Agregar información") {
  await user.click(await screen.findByRole("button", { name: action }));
}

async function saveForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Guardar formación" }));
}

async function fillForm(user: ReturnType<typeof userEvent.setup>, values: Partial<EducationFormValues>) {
  const labels: Record<keyof EducationFormValues, RegExp> = {
    institution: /Institución/, degree: /Título o carrera/, startDate: /Desde/, endDate: /Hasta/, description: /Descripción/,
  };
  for (const field of Object.keys(labels) as (keyof EducationFormValues)[]) {
    const value = values[field];
    if (value === undefined) continue;
    const input = screen.getByLabelText(labels[field]);
    if (field === "startDate" || field === "endDate") {
      fireEvent.change(input, { target: { value } });
    } else {
      await user.clear(input);
      if (value) await user.type(input, value);
    }
  }
}

describe("EducationView", () => {
  beforeEach(() => {
    vi.mocked(educationsService.getInstitutions).mockResolvedValue([
      { name: 'Universidad Mayor de San Simón (UMSS)', aliases: ['UMSS', 'Universidad Mayor de San Simón'] },
      { name: 'Universidad Privada Boliviana (UPB)', aliases: ['UPB'] },
    ]);
    vi.mocked(educationsService.getEducations).mockResolvedValue(EDUCATIONS);
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it.each(['Universidad Privada Abierta Latinoamericana (UPAL)', 'Universidad NUR', 'Universidad Pedagógica'])(
    'keeps the legacy record from %s visible and requires correction before updating', async (institution) => {
      const legacy = { ...EDUCATIONS[0], institution, endDate: null };
      const updated = { ...legacy, institution: EDUCATIONS[0].institution, description: 'Updated description' };
      vi.mocked(educationsService.getEducations).mockResolvedValueOnce([legacy]).mockResolvedValue([updated]);
      vi.mocked(educationsService.updateEducation).mockResolvedValue(updated);
      const user = setupView();
      const list = await screen.findByRole('list', { name: 'Formación registrada' });
      expect(list).toHaveTextContent(institution);
      await openForm(user, 'Editar Ingeniería Informática');
      expect(screen.getByLabelText(/Institución/)).toHaveValue(institution);
      await saveForm(user);
      expect(educationsService.updateEducation).not.toHaveBeenCalled();
      expect(educationsService.createEducation).not.toHaveBeenCalled();
      expect(list).toHaveTextContent(institution);
      expect(screen.getByLabelText(/Institución/)).toHaveAccessibleDescription('Selecciona una universidad de la lista permitida.');
      await fillForm(user, { institution: updated.institution, description: updated.description });
      await saveForm(user);
      await screen.findByText('Formación académica actualizada correctamente.');
      expect(educationsService.updateEducation).toHaveBeenCalledExactlyOnceWith(legacy.id, {
        institution: updated.institution, degree: legacy.degree, startDate: legacy.startDate, description: updated.description,
      });
      expect(screen.getByRole('list', { name: 'Formación registrada' })).toHaveTextContent('Fecha de fin no registrada');
    },
  );

  it.each([false, true])("preserves entered fields and the list when a duplicate is rejected (editing: %s)", async (editing) => {
    const error = { isAxiosError: true, response: { status: 409, data: { data: { code: "EDUCATION_DUPLICATE" } } } };
    vi.mocked(educationsService.createEducation).mockRejectedValue(error);
    vi.mocked(educationsService.updateEducation).mockRejectedValue(error);
    const user = setupView();
    const list = await screen.findByRole("list", { name: "Formación registrada" });
    await user.click(screen.getByRole("button", {
      name: editing ? "Editar Ingeniería Civil" : "Agregar información",
    }));
    const original = EDUCATIONS[0];
    for (const [label, value] of [
      [/Institución/, original.institution],
      [/Título o carrera/, original.degree],
      [/Desde/, original.startDate],
      [/Hasta/, original.endDate],
      [/Descripción/, "Different description"],
    ] as const) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    expect(screen.getByRole("combobox", { name: /Institución/ })).toBeInTheDocument();
    await saveForm(user);
    expect(await screen.findByRole("alert")).toHaveTextContent(EDUCATION_FEEDBACK_MESSAGES.duplicate);
    expect(screen.getByLabelText(/Institución/)).toHaveValue(original.institution);
    expect(screen.getByLabelText(/Título o carrera/)).toHaveValue(original.degree);
    expect(screen.getByLabelText(/Descripción/)).toHaveValue("Different description");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(educationsService.getEducations).toHaveBeenCalledTimes(1);
    expect(editing ? educationsService.updateEducation : educationsService.createEducation).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Guardar formación" })).toBeEnabled();
  });

  it("shows multiple records from the API with their institution, degree, period and description", async () => {
    render(<EducationView />);

    expect(screen.getByRole("heading", { level: 1, name: "Trayectoria" })).toBeInTheDocument();
    const list = await screen.findByRole("list", { name: "Formación registrada" });
    const records = within(list).getAllByRole("listitem");

    expect(records).toHaveLength(2);
    expect(within(records[0]).getByRole("heading", { name: "Ingeniería Informática" })).toBeInTheDocument();
    expect(records[0]).toHaveTextContent("Universidad Mayor de San Simón (UMSS) · Feb 2021 – Nov 2025");
    expect(records[0]).toHaveTextContent("Software development studies.");
    expect(within(records[1]).getByRole("heading", { name: "Ingeniería Civil" })).toBeInTheDocument();
    expect(records[1]).toHaveTextContent("Universidad Privada Boliviana (UPB) · Feb 2015 – Nov 2020");
    expect(records[1].querySelectorAll("p")).toHaveLength(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it('blocks saving until the failed catalogue load is retried successfully', async () => {
    vi.mocked(educationsService.getInstitutions).mockRejectedValueOnce(new Error('Unavailable'));
    const user = setupView();
    await openForm(user, "Editar Ingeniería Informática");
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar la lista de universidades.');
    expect(screen.getByRole('button', { name: 'Guardar formación' })).toBeDisabled();
    fireEvent.submit(screen.getByRole('form'));
    expect(educationsService.updateEducation).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByRole('combobox', { name: /Institución/ })).toBeEnabled());
    expect(screen.getByRole('combobox', { name: /Institución/ })).toHaveValue(EDUCATIONS[0].institution);
    expect(screen.getByRole('button', { name: 'Guardar formación' })).toBeEnabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it("shows loading without showing an empty list while waiting for the API", () => {
    vi.mocked(educationsService.getEducations).mockReturnValue(new Promise(() => {}));
    render(<EducationView />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando formación académica...");
    expect(screen.queryByRole("list", { name: "Formación registrada" })).not.toBeInTheDocument();
    expect(screen.queryByText("Todavía no tienes formación académica registrada.")).not.toBeInTheDocument();
  });

  it("shows the empty state when the API returns no records", async () => {
    vi.mocked(educationsService.getEducations).mockResolvedValue([]);
    render(<EducationView />);

    expect(await screen.findByText("Todavía no tienes formación académica registrada.")).toBeInTheDocument();
    expect(screen.queryByText("Cargando formación académica...")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a Spanish load error without showing the empty state or sample data", async () => {
    vi.mocked(educationsService.getEducations).mockRejectedValue(new Error("Internal server error"));
    render(<EducationView />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo cargar tu formación académica. Recarga la página para intentarlo de nuevo.",
    );
    expect(screen.queryByText("Todavía no tienes formación académica registrada.")).not.toBeInTheDocument();
    expect(screen.queryByText("Cargando formación académica...")).not.toBeInTheDocument();
    expect(screen.queryByText("Internal server error")).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Formación registrada" })).not.toBeInTheDocument();
  });

  it("displays records with a missing end date and an empty description", async () => {
    vi.mocked(educationsService.getEducations).mockResolvedValue([
      { ...EDUCATIONS[0], endDate: null, description: "" },
    ]);
    render(<EducationView />);

    const list = await screen.findByRole("list", { name: "Formación registrada" });
    expect(list).toHaveTextContent("Feb 2021 – Fecha de fin no registrada");
    expect(list.querySelectorAll("p")).toHaveLength(1);
  });

  it("edits a legacy description without sending or inventing an end date", async () => {
    const legacy = { ...EDUCATIONS[0], endDate: null };
    const updated = { ...legacy, description: "Updated description" };
    vi.mocked(educationsService.getEducations).mockResolvedValueOnce([legacy]).mockResolvedValueOnce([updated]);
    vi.mocked(educationsService.updateEducation).mockResolvedValue(updated);
    const user = setupView();
    await openForm(user, "Editar Ingeniería Informática");
    expect(screen.getByLabelText(/Hasta/)).not.toBeRequired();
    fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: "Updated description" } });
    await saveForm(user);
    await screen.findByText("Formación académica actualizada correctamente.");
    expect(educationsService.updateEducation).toHaveBeenCalledExactlyOnceWith(legacy.id, {
      institution: legacy.institution,
      degree: legacy.degree,
      startDate: legacy.startDate,
      description: "Updated description",
    });
    expect(await screen.findByText("Updated description")).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Formación registrada" })).toHaveTextContent("Fecha de fin no registrada");
    expect(screen.getByLabelText(/Hasta/)).toBeRequired();
  });

  it("allows adding a valid end date to a legacy record", async () => {
    const legacy = { ...EDUCATIONS[0], endDate: null };
    vi.mocked(educationsService.getEducations).mockResolvedValue([legacy]);
    vi.mocked(educationsService.updateEducation).mockResolvedValue(EDUCATIONS[0]);
    const user = setupView();
    await openForm(user, "Editar Ingeniería Informática");
    fireEvent.change(screen.getByLabelText(/Hasta/), { target: { value: "2025-11-30" } });
    await saveForm(user);
    await screen.findByText("Formación académica actualizada correctamente.");
    expect(educationsService.updateEducation).toHaveBeenCalledWith(legacy.id, expect.objectContaining({ endDate: "2025-11-30" }));
  });

  it("retains the form after a conflict without reloading, clearing or retrying", async () => {
    vi.mocked(educationsService.updateEducation).mockRejectedValue({ response: { status: 409 } });
    const user = setupView();
    await openForm(user, "Editar Ingeniería Informática");
    fireEvent.change(screen.getByLabelText(/Título o carrera/), { target: { value: "Ingeniería Química" } });
    await saveForm(user);
    expect(await screen.findByRole("alert")).toHaveTextContent(EDUCATION_FEEDBACK_MESSAGES.updateConflict);
    expect(screen.getByLabelText(/Título o carrera/)).toHaveValue("Ingeniería Química");
    expect(screen.getByRole("button", { name: "Guardar formación" })).toBeEnabled();
    expect(educationsService.getEducations).toHaveBeenCalledTimes(1);
    expect(educationsService.updateEducation).toHaveBeenCalledTimes(1);
    expect(educationsService.createEducation).not.toHaveBeenCalled();
  });

  it("renders the four numbered trajectory sub-tabs with education as active", async () => {
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });

    const list = screen.getByRole("list", { name: "Sub-secciones de trayectoria" });

    expect(list).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("Formación académica")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("Experiencia laboral")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("Habilidades")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
    expect(screen.getByText("Certificaciones")).toBeInTheDocument();
  });

  it("marks Trayectoria as the active tab", async () => {
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });

    expect(screen.getByRole("link", { name: "Trayectoria" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Datos personales" })).not.toHaveAttribute("aria-current");
  });

  it("opens an empty form from the add information button", async () => {
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    await openForm(user);

    expect(screen.getByLabelText(/Institución/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Título o carrera/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Desde/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hasta/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción \(opcional\)/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar formación" })).toBeInTheDocument();
  });

  it("creates an education record and reloads the list", async () => {
    const created = { ...EDUCATIONS[0], id: "33333333-3333-4333-8333-333333333333", degree: "Ingeniería de Sistemas" };
    vi.mocked(educationsService.createEducation).mockResolvedValue(created);
    vi.mocked(educationsService.getEducations)
      .mockResolvedValueOnce(EDUCATIONS)
      .mockResolvedValueOnce([...EDUCATIONS, created]);
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });
    await openForm(user);

    await fillForm(user, {
      institution: "  Universidad Mayor de San Simón (UMSS) ", degree: "Ingeniería de Sistemas",
      startDate: "2021-02-01", endDate: "2025-11-30", description: "   ",
    });
    await saveForm(user);

    expect(educationsService.createEducation).toHaveBeenCalledWith({
      institution: "Universidad Mayor de San Simón (UMSS)",
      degree: "Ingeniería de Sistemas",
      startDate: "2021-02-01",
      endDate: "2025-11-30",
      description: null,
    });
    expect(await screen.findByText("Formación académica agregada correctamente.")).toBeInTheDocument();
    expect(educationsService.getEducations).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole("heading", { name: "Ingeniería de Sistemas" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Formación registrada" })).getAllByRole("listitem")).toHaveLength(3);
    for (const label of [/Institución/, /Título o carrera/, /Desde/, /Hasta/, /Descripción/]) {
      expect(screen.getByLabelText(label)).toHaveValue("");
    }
  });

  it("shows a Spanish error when creating fails", async () => {
    vi.mocked(educationsService.createEducation).mockRejectedValue(new Error("Bad request"));
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });

    await openForm(user);
    await fillForm(user, {
      institution: "Universidad Mayor de San Simón (UMSS)", degree: "Ingeniería Civil",
      startDate: "2020-01-01", endDate: "2024-01-01",
    });
    await saveForm(user);

    expect(
      await screen.findByText("No se pudo agregar la formación académica. Inténtalo de nuevo."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Bad request")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Institución/)).toHaveValue("Universidad Mayor de San Simón (UMSS)");
    expect(educationsService.getEducations).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await openForm(user);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Institución/)).toHaveValue("");
  });

  it("edits an existing record and cancels back to the empty form", async () => {
    const updated = { ...EDUCATIONS[0], degree: "Ingeniería de Sistemas" };
    vi.mocked(educationsService.updateEducation).mockResolvedValue(updated);
    vi.mocked(educationsService.getEducations)
      .mockResolvedValueOnce(EDUCATIONS)
      .mockResolvedValueOnce([updated, EDUCATIONS[1]]);
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });

    await openForm(user, "Editar Ingeniería Informática");

    expect(screen.getByRole("form", { name: "Editar formación" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Institución/)).toHaveValue("Universidad Mayor de San Simón (UMSS)");
    expect(screen.getByLabelText(/Hasta/)).toHaveValue("2025-11-30");

    await fillForm(user, { degree: "Ingeniería de Sistemas" });
    await saveForm(user);

    expect(educationsService.updateEducation).toHaveBeenCalledWith(EDUCATIONS[0].id, {
      institution: "Universidad Mayor de San Simón (UMSS)",
      degree: "Ingeniería de Sistemas",
      startDate: "2021-02-01",
      endDate: "2025-11-30",
      description: "Software development studies.",
    });
    expect(
      await screen.findByText("Formación académica actualizada correctamente."),
    ).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Ingeniería de Sistemas" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Ingeniería Informática" })).not.toBeInTheDocument();
    expect(educationsService.createEducation).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Título o carrera/)).toHaveValue("");

    await openForm(user, "Editar Ingeniería Civil");
    await user.type(screen.getByLabelText(/Institución/), " unsaved changes");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(educationsService.updateEducation).toHaveBeenCalledTimes(1);
    await openForm(user);
    expect(screen.getByRole("form", { name: "Agregar formación" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Institución/)).toHaveValue("");
  });

  it("shows a Spanish error when updating fails", async () => {
    vi.mocked(educationsService.updateEducation).mockRejectedValue(new Error("Not found"));
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });

    await openForm(user, "Editar Ingeniería Informática");
    await fillForm(user, { degree: "Ingeniería de Sistemas" });
    await saveForm(user);

    expect(
      await screen.findByText("No se pudo actualizar la formación académica. Inténtalo de nuevo."),
    ).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Editar formación" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Título o carrera/)).toHaveValue("Ingeniería de Sistemas");
    expect(educationsService.getEducations).toHaveBeenCalledTimes(1);
    expect(educationsService.createEducation).not.toHaveBeenCalled();
  });

  it("switches from editing to a clean create form using add information", async () => {
    vi.mocked(educationsService.createEducation).mockResolvedValue(EDUCATIONS[0]);
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });
    await openForm(user, "Editar Ingeniería Informática");
    await openForm(user);

    expect(screen.getByRole("form", { name: "Agregar formación" })).toBeInTheDocument();
    for (const label of [/Institución/, /Título o carrera/, /Desde/, /Hasta/, /Descripción/]) {
      expect(screen.getByLabelText(label)).toHaveValue("");
    }
    await fillForm(user, {
      institution: "Universidad Privada Boliviana (UPB)", degree: "Ingeniería Electromecánica",
      startDate: "2023-01-01", endDate: "2025-01-01",
    });
    await saveForm(user);

    await screen.findByText("Formación académica agregada correctamente.");
    expect(educationsService.createEducation).toHaveBeenCalledOnce();
    expect(educationsService.updateEducation).not.toHaveBeenCalled();
  });

  it("allows adding information when the list is empty and cancelling without saving", async () => {
    vi.mocked(educationsService.getEducations).mockResolvedValue([]);
    const user = setupView();
    await screen.findByText("Todavía no tienes formación académica registrada.");
    await openForm(user);
    await user.type(screen.getByLabelText(/Institución/), "Unsaved University");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(educationsService.createEducation).not.toHaveBeenCalled();
    expect(educationsService.updateEducation).not.toHaveBeenCalled();
  });

  it("blocks other actions and duplicate submissions while an edit is being saved", async () => {
    let finishSave!: (record: EducationItem) => void;
    vi.mocked(educationsService.updateEducation).mockReturnValue(new Promise((resolve) => {
      finishSave = resolve;
    }));
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });
    await openForm(user, "Editar Ingeniería Informática");
    await saveForm(user);

    for (const name of ["Agregar información", "Editar Ingeniería Civil", "Eliminar Ingeniería Informática", "Cancelar", "Guardando..."]) {
      expect(screen.getByRole("button", { name })).toBeDisabled();
    }
    expect(screen.getByLabelText(/Institución/)).toBeDisabled();
    fireEvent.submit(screen.getByRole("form", { name: "Editar formación" }));
    expect(educationsService.updateEducation).toHaveBeenCalledTimes(1);
    await act(async () => { finishSave(EDUCATIONS[0]); });

    expect(await screen.findByText("Formación académica actualizada correctamente.")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "Guardar formación" })).toBeEnabled());
    expect(screen.getByLabelText(/Institución/)).toHaveValue("");
  });

  it("deletes a record after confirming and reloads the list", async () => {
    vi.mocked(educationsService.deleteEducation).mockResolvedValue();
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });

    await openForm(user, "Editar Ingeniería Informática");
    await user.click(screen.getByRole("button", { name: "Eliminar Ingeniería Informática" }));
    const dialog = await screen.findByRole("alertdialog", { name: "¿Eliminar esta formación?" });
    expect(dialog).toHaveTextContent('Se eliminará "Ingeniería Informática" de tu trayectoria.');

    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    expect(educationsService.deleteEducation).toHaveBeenCalledWith(EDUCATIONS[0].id);
    expect(await screen.findByText("Formación académica eliminada correctamente.")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(educationsService.getEducations).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("form", { name: "Agregar formación" })).toBeInTheDocument();
  });

  it("keeps the record when the deletion is cancelled", async () => {
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });

    await user.click(screen.getByRole("button", { name: "Eliminar Ingeniería Civil" }));
    await user.click(await screen.findByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(educationsService.deleteEducation).not.toHaveBeenCalled();
  });

  it("shows a Spanish error when deleting fails", async () => {
    vi.mocked(educationsService.deleteEducation).mockRejectedValue(new Error("Server error"));
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });

    await user.click(screen.getByRole("button", { name: "Eliminar Ingeniería Civil" }));
    await user.click(await screen.findByRole("button", { name: "Eliminar" }));

    expect(
      await screen.findByText("No se pudo eliminar la formación académica. Inténtalo de nuevo."),
    ).toBeInTheDocument();
  });

  it("preserves the edit form after a failed deletion and allows retrying inside the dialog", async () => {
    vi.mocked(educationsService.deleteEducation).mockRejectedValueOnce(new Error("Server error")).mockResolvedValueOnce();
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });
    await openForm(user, "Editar Ingeniería Informática");
    await user.type(screen.getByLabelText(/Institución/), " edited");
    const institution = screen.getByLabelText(/Institución/);
    await user.click(screen.getByRole("button", { name: "Eliminar Ingeniería Informática" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("No se pudo eliminar");
    expect(institution).toHaveValue("Universidad Mayor de San Simón (UMSS) edited");
    expect(educationsService.getEducations).toHaveBeenCalledTimes(1);
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(educationsService.deleteEducation).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText(/Institución/)).toHaveValue("");
  });

  it("disables cancellation, escape and repeated confirmation while deleting", async () => {
    let finishDelete!: () => void;
    vi.mocked(educationsService.deleteEducation).mockReturnValue(new Promise((resolve) => { finishDelete = resolve; }));
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });
    await user.click(screen.getByRole("button", { name: "Eliminar Ingeniería Informática" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));
    expect(within(dialog).getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Eliminando..." })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(dialog).toBeInTheDocument();
    expect(educationsService.deleteEducation).toHaveBeenCalledOnce();
    await act(async () => { finishDelete(); });
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it.each([false, true])("prevents invalid API writes while creating or editing (editing: %s)", async (editing) => {
    const user = setupView();
    await screen.findByRole("list", { name: "Formación registrada" });
    await user.click(screen.getByRole("button", { name: editing ? "Editar Ingeniería Informática" : "Agregar información" }));
    for (const label of [/Institución/, /Título o carrera/, /Desde/, /Hasta/]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value: "" } });
    }
    await saveForm(user);
    expect(screen.getByText("La institución es obligatoria.")).toBeInTheDocument();
    expect(screen.getByText("El título o carrera es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("La fecha de inicio es obligatoria.")).toBeInTheDocument();
    expect(screen.getByText("La fecha de fin es obligatoria.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Institución/), { target: { value: "Universidad Mayor de San Simón (UMSS)" } });
    fireEvent.change(screen.getByLabelText(/Título o carrera/), { target: { value: "Ingeniería Civil" } });
    fireEvent.change(screen.getByLabelText(/Desde/), { target: { value: "2024-01-02" } });
    fireEvent.change(screen.getByLabelText(/Hasta/), { target: { value: "2024-01-01" } });
    await saveForm(user);
    expect(screen.getByText("La fecha de fin no puede ser anterior a la fecha de inicio.")).toBeInTheDocument();
    expect(educationsService.createEducation).not.toHaveBeenCalled();
    expect(educationsService.updateEducation).not.toHaveBeenCalled();
  });

  it("creates two records, edits one, cancels deletion and then deletes only the confirmed record", async () => {
    let records: EducationItem[] = [];
    vi.mocked(educationsService.getEducations).mockImplementation(async () => [...records]);
    vi.mocked(educationsService.createEducation).mockImplementation(async (payload) => {
      const record = { ...EDUCATIONS[records.length], ...payload };
      records = [...records, record];
      return record;
    });
    vi.mocked(educationsService.updateEducation).mockImplementation(async (id, payload) => {
      records = records.map((record) => record.id === id ? { ...record, ...payload } : record);
      return records.find((record) => record.id === id)!;
    });
    vi.mocked(educationsService.deleteEducation).mockImplementation(async (id) => {
      records = records.filter((record) => record.id !== id);
    });
    const user = setupView();
    await screen.findByText("Todavía no tienes formación académica registrada.");
    for (const [index, degree] of ["Ingeniería Civil", "Ingeniería Electromecánica"].entries()) {
      await openForm(user);
      for (const [label, value] of [[/Institución/, "Universidad Mayor de San Simón (UMSS)"], [/Título o carrera/, degree], [/Desde/, "2020-01-01"], [/Hasta/, "2024-01-01"]] as const) {
        fireEvent.change(screen.getByLabelText(label), { target: { value } });
      }
      await saveForm(user);
      await screen.findByRole("heading", { name: degree });
      expect(within(screen.getByRole("list", { name: "Formación registrada" })).getAllByRole("listitem")).toHaveLength(index + 1);
      expect(screen.getByLabelText(/Institución/)).toHaveValue("");
    }
    await openForm(user, "Editar Ingeniería Civil");
    fireEvent.change(screen.getByLabelText(/Título o carrera/), { target: { value: "Ingeniería Química" } });
    await saveForm(user);
    await screen.findByRole("heading", { name: "Ingeniería Química" });
    await user.click(screen.getByRole("button", { name: "Eliminar Ingeniería Química" }));
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(educationsService.deleteEducation).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Ingeniería Química" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Eliminar Ingeniería Química" }));
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    const list = screen.getByRole("list", { name: "Formación registrada" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(within(list).getByRole("heading", { name: "Ingeniería Electromecánica" })).toBeInTheDocument();
    expect(educationsService.createEducation).toHaveBeenCalledTimes(2);
    expect(educationsService.updateEducation).toHaveBeenCalledExactlyOnceWith(EDUCATIONS[0].id, expect.objectContaining({ degree: "Ingeniería Química" }));
    expect(educationsService.deleteEducation).toHaveBeenCalledExactlyOnceWith(EDUCATIONS[0].id);
  });
});
