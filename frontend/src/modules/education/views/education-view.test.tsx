import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { educationsService } from "../services/educations.service";
import type { EducationItem } from "../types/education-item.types";
import { EDUCATION_FEEDBACK_MESSAGES } from "../constants/education-feedback.constants";
import { EducationView } from "./education-view";

vi.mock("../services/educations.service", () => ({
  educationsService: {
    getEducations: vi.fn(),
    createEducation: vi.fn(),
    updateEducation: vi.fn(),
    deleteEducation: vi.fn(),
  },
}));

const EDUCATIONS: EducationItem[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    institution: "Example University",
    degree: "Computer Science",
    startDate: "2021-02-01",
    endDate: "2025-11-30",
    description: "Software development studies.",
    createdAt: "2025-12-01T00:00:00.000Z",
    updatedAt: "2025-12-01T00:00:00.000Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    institution: "Example School",
    degree: "High School Diploma",
    startDate: "2015-02-01",
    endDate: "2020-11-30",
    description: null,
    createdAt: "2025-12-01T00:00:00.000Z",
    updatedAt: "2025-12-01T00:00:00.000Z",
  },
];

describe("EducationView", () => {
  beforeEach(() => {
    vi.mocked(educationsService.getEducations).mockResolvedValue(EDUCATIONS);
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it("shows multiple records from the API with their institution, degree, period and description", async () => {
    render(<EducationView />);

    expect(screen.getByRole("heading", { level: 1, name: "Trayectoria" })).toBeInTheDocument();
    const list = await screen.findByRole("list", { name: "Formación registrada" });
    const records = within(list).getAllByRole("listitem");

    expect(records).toHaveLength(2);
    expect(within(records[0]).getByRole("heading", { name: "Computer Science" })).toBeInTheDocument();
    expect(records[0]).toHaveTextContent("Example University · Feb 2021 – Nov 2025");
    expect(records[0]).toHaveTextContent("Software development studies.");
    expect(within(records[1]).getByRole("heading", { name: "High School Diploma" })).toBeInTheDocument();
    expect(records[1]).toHaveTextContent("Example School · Feb 2015 – Nov 2020");
    expect(records[1].querySelectorAll("p")).toHaveLength(1);
    expect(screen.queryByText("Ingeniería Informática")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
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
    const user = userEvent.setup();
    render(<EducationView />);
    await user.click(await screen.findByRole("button", { name: "Editar Computer Science" }));
    expect(screen.getByLabelText(/Hasta/)).not.toBeRequired();
    fireEvent.change(screen.getByLabelText(/Descripción/), { target: { value: "Updated description" } });
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));
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
    const user = userEvent.setup();
    render(<EducationView />);
    await user.click(await screen.findByRole("button", { name: "Editar Computer Science" }));
    fireEvent.change(screen.getByLabelText(/Hasta/), { target: { value: "2025-11-30" } });
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));
    await screen.findByText("Formación académica actualizada correctamente.");
    expect(educationsService.updateEducation).toHaveBeenCalledWith(legacy.id, expect.objectContaining({ endDate: "2025-11-30" }));
  });

  it("retains the form after a conflict without reloading, clearing or retrying", async () => {
    vi.mocked(educationsService.updateEducation).mockRejectedValue({ response: { status: 409 } });
    const user = userEvent.setup();
    render(<EducationView />);
    await user.click(await screen.findByRole("button", { name: "Editar Computer Science" }));
    fireEvent.change(screen.getByLabelText(/Título o carrera/), { target: { value: "Unsaved title" } });
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(EDUCATION_FEEDBACK_MESSAGES.updateConflict);
    expect(screen.getByLabelText(/Título o carrera/)).toHaveValue("Unsaved title");
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
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Agregar información" }));

    expect(screen.getByLabelText(/Institución/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Título o carrera/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Desde/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hasta/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción \(opcional\)/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar formación" })).toBeInTheDocument();
  });

  it("creates an education record and reloads the list", async () => {
    const created = { ...EDUCATIONS[0], id: "33333333-3333-4333-8333-333333333333", degree: "Systems Engineering" };
    vi.mocked(educationsService.createEducation).mockResolvedValue(created);
    vi.mocked(educationsService.getEducations)
      .mockResolvedValueOnce(EDUCATIONS)
      .mockResolvedValueOnce([...EDUCATIONS, created]);
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });
    await user.click(screen.getByRole("button", { name: "Agregar información" }));

    await user.type(screen.getByLabelText(/Institución/), "  Example University ");
    await user.type(screen.getByLabelText(/Título o carrera/), "Systems Engineering");
    await user.type(screen.getByLabelText(/Desde/), "2021-02-01");
    await user.type(screen.getByLabelText(/Hasta/), "2025-11-30");
    await user.type(screen.getByLabelText(/Descripción \(opcional\)/), "   ");
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));

    expect(educationsService.createEducation).toHaveBeenCalledWith({
      institution: "Example University",
      degree: "Systems Engineering",
      startDate: "2021-02-01",
      endDate: "2025-11-30",
      description: null,
    });
    expect(await screen.findByText("Formación académica agregada correctamente.")).toBeInTheDocument();
    expect(educationsService.getEducations).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole("heading", { name: "Systems Engineering" })).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Formación registrada" })).getAllByRole("listitem")).toHaveLength(3);
    for (const label of [/Institución/, /Título o carrera/, /Desde/, /Hasta/, /Descripción/]) {
      expect(screen.getByLabelText(label)).toHaveValue("");
    }
  });

  it("shows a Spanish error when creating fails", async () => {
    vi.mocked(educationsService.createEducation).mockRejectedValue(new Error("Bad request"));
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });

    await user.click(screen.getByRole("button", { name: "Agregar información" }));
    await user.type(screen.getByLabelText(/Institución/), "Example University");
    await user.type(screen.getByLabelText(/Título o carrera/), "Engineering");
    fireEvent.change(screen.getByLabelText(/Desde/), { target: { value: "2020-01-01" } });
    fireEvent.change(screen.getByLabelText(/Hasta/), { target: { value: "2024-01-01" } });
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));

    expect(
      await screen.findByText("No se pudo agregar la formación académica. Inténtalo de nuevo."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Bad request")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Institución/)).toHaveValue("Example University");
    expect(educationsService.getEducations).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await user.click(screen.getByRole("button", { name: "Agregar información" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Institución/)).toHaveValue("");
  });

  it("edits an existing record and cancels back to the empty form", async () => {
    const updated = { ...EDUCATIONS[0], degree: "Systems Engineering" };
    vi.mocked(educationsService.updateEducation).mockResolvedValue(updated);
    vi.mocked(educationsService.getEducations)
      .mockResolvedValueOnce(EDUCATIONS)
      .mockResolvedValueOnce([updated, EDUCATIONS[1]]);
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });

    await user.click(screen.getByRole("button", { name: "Editar Computer Science" }));

    expect(screen.getByRole("form", { name: "Editar formación" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Institución/)).toHaveValue("Example University");
    expect(screen.getByLabelText(/Hasta/)).toHaveValue("2025-11-30");

    await user.clear(screen.getByLabelText(/Título o carrera/));
    await user.type(screen.getByLabelText(/Título o carrera/), "Systems Engineering");
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));

    expect(educationsService.updateEducation).toHaveBeenCalledWith(EDUCATIONS[0].id, {
      institution: "Example University",
      degree: "Systems Engineering",
      startDate: "2021-02-01",
      endDate: "2025-11-30",
      description: "Software development studies.",
    });
    expect(
      await screen.findByText("Formación académica actualizada correctamente."),
    ).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Systems Engineering" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Computer Science" })).not.toBeInTheDocument();
    expect(educationsService.createEducation).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Título o carrera/)).toHaveValue("");

    await user.click(screen.getByRole("button", { name: "Editar High School Diploma" }));
    await user.type(screen.getByLabelText(/Institución/), " unsaved changes");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(educationsService.updateEducation).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole("button", { name: "Agregar información" }));
    expect(screen.getByRole("form", { name: "Agregar formación" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Institución/)).toHaveValue("");
  });

  it("shows a Spanish error when updating fails", async () => {
    vi.mocked(educationsService.updateEducation).mockRejectedValue(new Error("Not found"));
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });

    await user.click(screen.getByRole("button", { name: "Editar Computer Science" }));
    await user.clear(screen.getByLabelText(/Título o carrera/));
    await user.type(screen.getByLabelText(/Título o carrera/), "Systems Engineering");
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));

    expect(
      await screen.findByText("No se pudo actualizar la formación académica. Inténtalo de nuevo."),
    ).toBeInTheDocument();
    expect(screen.getByRole("form", { name: "Editar formación" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Título o carrera/)).toHaveValue("Systems Engineering");
    expect(educationsService.getEducations).toHaveBeenCalledTimes(1);
    expect(educationsService.createEducation).not.toHaveBeenCalled();
  });

  it("switches from editing to a clean create form using add information", async () => {
    vi.mocked(educationsService.createEducation).mockResolvedValue(EDUCATIONS[0]);
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });
    await user.click(screen.getByRole("button", { name: "Editar Computer Science" }));
    await user.click(screen.getByRole("button", { name: "Agregar información" }));

    expect(screen.getByRole("form", { name: "Agregar formación" })).toBeInTheDocument();
    for (const label of [/Institución/, /Título o carrera/, /Desde/, /Hasta/, /Descripción/]) {
      expect(screen.getByLabelText(label)).toHaveValue("");
    }
    await user.type(screen.getByLabelText(/Institución/), "Another University");
    await user.type(screen.getByLabelText(/Título o carrera/), "Data Science");
    await user.type(screen.getByLabelText(/Desde/), "2023-01-01");
    await user.type(screen.getByLabelText(/Hasta/), "2025-01-01");
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));

    await screen.findByText("Formación académica agregada correctamente.");
    expect(educationsService.createEducation).toHaveBeenCalledOnce();
    expect(educationsService.updateEducation).not.toHaveBeenCalled();
  });

  it("allows adding information when the list is empty and cancelling without saving", async () => {
    vi.mocked(educationsService.getEducations).mockResolvedValue([]);
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByText("Todavía no tienes formación académica registrada.");
    await user.click(screen.getByRole("button", { name: "Agregar información" }));
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
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });
    await user.click(screen.getByRole("button", { name: "Editar Computer Science" }));
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));

    for (const name of ["Agregar información", "Editar High School Diploma", "Eliminar Computer Science", "Cancelar", "Guardando..."]) {
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
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });

    await user.click(screen.getByRole("button", { name: "Editar Computer Science" }));
    await user.click(screen.getByRole("button", { name: "Eliminar Computer Science" }));
    const dialog = await screen.findByRole("alertdialog", { name: "¿Eliminar esta formación?" });
    expect(dialog).toHaveTextContent('Se eliminará "Computer Science" de tu trayectoria.');

    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    expect(educationsService.deleteEducation).toHaveBeenCalledWith(EDUCATIONS[0].id);
    expect(await screen.findByText("Formación académica eliminada correctamente.")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(educationsService.getEducations).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("form", { name: "Agregar formación" })).toBeInTheDocument();
  });

  it("keeps the record when the deletion is cancelled", async () => {
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });

    await user.click(screen.getByRole("button", { name: "Eliminar High School Diploma" }));
    await user.click(await screen.findByRole("button", { name: "Cancelar" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(educationsService.deleteEducation).not.toHaveBeenCalled();
  });

  it("shows a Spanish error when deleting fails", async () => {
    vi.mocked(educationsService.deleteEducation).mockRejectedValue(new Error("Server error"));
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });

    await user.click(screen.getByRole("button", { name: "Eliminar High School Diploma" }));
    await user.click(await screen.findByRole("button", { name: "Eliminar" }));

    expect(
      await screen.findByText("No se pudo eliminar la formación académica. Inténtalo de nuevo."),
    ).toBeInTheDocument();
  });

  it("preserves the edit form after a failed deletion and allows retrying inside the dialog", async () => {
    vi.mocked(educationsService.deleteEducation).mockRejectedValueOnce(new Error("Server error")).mockResolvedValueOnce();
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });
    await user.click(screen.getByRole("button", { name: "Editar Computer Science" }));
    await user.type(screen.getByLabelText(/Institución/), " edited");
    const institution = screen.getByLabelText(/Institución/);
    await user.click(screen.getByRole("button", { name: "Eliminar Computer Science" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("No se pudo eliminar");
    expect(institution).toHaveValue("Example University edited");
    expect(educationsService.getEducations).toHaveBeenCalledTimes(1);
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(educationsService.deleteEducation).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText(/Institución/)).toHaveValue("");
  });

  it("disables cancellation, escape and repeated confirmation while deleting", async () => {
    let finishDelete!: () => void;
    vi.mocked(educationsService.deleteEducation).mockReturnValue(new Promise((resolve) => { finishDelete = resolve; }));
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });
    await user.click(screen.getByRole("button", { name: "Eliminar Computer Science" }));
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
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByRole("list", { name: "Formación registrada" });
    await user.click(screen.getByRole("button", { name: editing ? "Editar Computer Science" : "Agregar información" }));
    for (const label of [/Institución/, /Título o carrera/, /Desde/, /Hasta/]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value: "" } });
    }
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));
    expect(screen.getByText("La institución es obligatoria.")).toBeInTheDocument();
    expect(screen.getByText("El título o carrera es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("La fecha de inicio es obligatoria.")).toBeInTheDocument();
    expect(screen.getByText("La fecha de fin es obligatoria.")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Institución/), { target: { value: "University" } });
    fireEvent.change(screen.getByLabelText(/Título o carrera/), { target: { value: "Engineering" } });
    fireEvent.change(screen.getByLabelText(/Desde/), { target: { value: "2024-01-02" } });
    fireEvent.change(screen.getByLabelText(/Hasta/), { target: { value: "2024-01-01" } });
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));
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
    const user = userEvent.setup();
    render(<EducationView />);
    await screen.findByText("Todavía no tienes formación académica registrada.");
    for (const [index, degree] of ["Engineering", "Data Science"].entries()) {
      await user.click(screen.getByRole("button", { name: "Agregar información" }));
      for (const [label, value] of [[/Institución/, "University"], [/Título o carrera/, degree], [/Desde/, "2020-01-01"], [/Hasta/, "2024-01-01"]] as const) {
        fireEvent.change(screen.getByLabelText(label), { target: { value } });
      }
      await user.click(screen.getByRole("button", { name: "Guardar formación" }));
      await screen.findByRole("heading", { name: degree });
      expect(within(screen.getByRole("list", { name: "Formación registrada" })).getAllByRole("listitem")).toHaveLength(index + 1);
      expect(screen.getByLabelText(/Institución/)).toHaveValue("");
    }
    await user.click(screen.getByRole("button", { name: "Editar Engineering" }));
    fireEvent.change(screen.getByLabelText(/Título o carrera/), { target: { value: "Updated Engineering" } });
    await user.click(screen.getByRole("button", { name: "Guardar formación" }));
    await screen.findByRole("heading", { name: "Updated Engineering" });
    await user.click(screen.getByRole("button", { name: "Eliminar Updated Engineering" }));
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Cancelar" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(educationsService.deleteEducation).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Updated Engineering" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Eliminar Updated Engineering" }));
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    const list = screen.getByRole("list", { name: "Formación registrada" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(1);
    expect(within(list).getByRole("heading", { name: "Data Science" })).toBeInTheDocument();
    expect(educationsService.createEducation).toHaveBeenCalledTimes(2);
    expect(educationsService.updateEducation).toHaveBeenCalledExactlyOnceWith(EDUCATIONS[0].id, expect.objectContaining({ degree: "Updated Engineering" }));
    expect(educationsService.deleteEducation).toHaveBeenCalledExactlyOnceWith(EDUCATIONS[0].id);
  });
});
