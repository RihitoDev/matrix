import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SKILLS_VALIDATION_MESSAGES } from "../constants/skills.constants";
import type { SkillItem } from "../types/skill-item.types";
import type { SkillsSelectorProps } from "../types/skills-selector-props.types";
import { SkillsSelector } from "./skills-selector";

const MOCK_CATALOG: SkillItem[] = [
  { id: "skill-1", name: "React", category: "Desarrollo web" },
  { id: "skill-2", name: "TypeScript" },
];

function renderSelector(overrides: Partial<SkillsSelectorProps> = {}) {
  const props: SkillsSelectorProps = {
    catalogSkills: MOCK_CATALOG,
    selectedSkills: [],
    onAddSkill: vi.fn(),
    onRemoveSkill: vi.fn(),
    onCreateCustomSkill: vi.fn(),
    onSave: vi.fn(),
    ...overrides,
  };

  render(<SkillsSelector {...props} />);

  return props;
}

describe("SkillsSelector", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the catalog skills with their category when available", () => {
    renderSelector();

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Desarrollo web")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });

  it("shows only the skills that match the search term", async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.type(screen.getByLabelText("Buscar en el catálogo"), "  type ");

    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.queryByText("React")).not.toBeInTheDocument();
  });

  it("informs when the search has no matches", async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.type(screen.getByLabelText("Buscar en el catálogo"), "Python");

    expect(screen.getByText("No se encontraron coincidencias en el catálogo.")).toBeInTheDocument();
  });

  it("calls onAddSkill when clicking Añadir", async () => {
    const user = userEvent.setup();
    const { onAddSkill } = renderSelector();

    await user.click(screen.getAllByRole("button", { name: "Añadir" })[0]);

    expect(onAddSkill).toHaveBeenCalledWith(MOCK_CATALOG[0]);
  });

  it("disables the add option of a skill that is already selected", () => {
    renderSelector({ selectedSkills: [MOCK_CATALOG[0]] });

    expect(screen.getByRole("button", { name: "Agregada" })).toBeDisabled();
  });

  it("shows a message when there are no selected skills", () => {
    renderSelector();

    expect(screen.getByText("No tienes habilidades seleccionadas aún.")).toBeInTheDocument();
  });

  it("calls onRemoveSkill when clicking the remove option of a tag", async () => {
    const user = userEvent.setup();
    const { onRemoveSkill } = renderSelector({ selectedSkills: [MOCK_CATALOG[0]] });

    await user.click(screen.getByRole("button", { name: "Quitar React" }));

    expect(onRemoveSkill).toHaveBeenCalledWith("skill-1");
  });

  it("creates a custom skill with the trimmed name and clears the field", async () => {
    const user = userEvent.setup();
    const { onCreateCustomSkill } = renderSelector();
    const input = screen.getByLabelText("Agregar habilidad propia");

    await user.type(input, "  Docker ");
    await user.click(screen.getByRole("button", { name: "Agregar" }));

    expect(onCreateCustomSkill).toHaveBeenCalledWith("Docker");
    expect(input).toHaveValue("");
  });

  it("does not create a custom skill with an empty name", async () => {
    const user = userEvent.setup();
    const { onCreateCustomSkill } = renderSelector();

    await user.click(screen.getByRole("button", { name: "Agregar" }));

    expect(screen.getByText(SKILLS_VALIDATION_MESSAGES.emptyName)).toBeInTheDocument();
    expect(screen.getByLabelText("Agregar habilidad propia")).toHaveAttribute("aria-invalid", "true");
    expect(onCreateCustomSkill).not.toHaveBeenCalled();
  });

  it("does not create a custom skill that already exists in the catalog", async () => {
    const user = userEvent.setup();
    const { onCreateCustomSkill } = renderSelector();

    await user.type(screen.getByLabelText("Agregar habilidad propia"), "react");
    await user.click(screen.getByRole("button", { name: "Agregar" }));

    expect(screen.getByText(SKILLS_VALIDATION_MESSAGES.duplicated)).toBeInTheDocument();
    expect(onCreateCustomSkill).not.toHaveBeenCalled();
  });

  it("does not create a custom skill that is already in my skills", async () => {
    const user = userEvent.setup();
    const { onCreateCustomSkill } = renderSelector({
      selectedSkills: [{ id: "custom-docker", name: "Docker" }],
    });

    await user.type(screen.getByLabelText("Agregar habilidad propia"), "DOCKER");
    await user.click(screen.getByRole("button", { name: "Agregar" }));

    expect(screen.getByText(SKILLS_VALIDATION_MESSAGES.duplicated)).toBeInTheDocument();
    expect(onCreateCustomSkill).not.toHaveBeenCalled();
  });

  it("clears the custom skill error when the user types again", async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(screen.getByRole("button", { name: "Agregar" }));
    await user.type(screen.getByLabelText("Agregar habilidad propia"), "G");

    expect(screen.queryByText(SKILLS_VALIDATION_MESSAGES.emptyName)).not.toBeInTheDocument();
  });

  it("calls onSave when clicking Guardar habilidades", async () => {
    const user = userEvent.setup();
    const { onSave } = renderSelector();

    await user.click(screen.getByRole("button", { name: "Guardar habilidades" }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("disables the save button and shows a spinner while saving", () => {
    renderSelector({ isSaving: true });

    const saveButton = screen.getByRole("button", { name: "Guardando..." });
    expect(saveButton).toBeDisabled();
    expect(saveButton.querySelector("svg.lucide-loader-circle")).toBeInTheDocument();
  });

  it("disables add, remove, and custom creation actions while isSaving is true", () => {
    renderSelector({
      selectedSkills: [MOCK_CATALOG[0]],
      isSaving: true,
    });

    expect(screen.getByRole("button", { name: "Quitar React" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Añadir" })).toBeDisabled();
    expect(screen.getByLabelText("Agregar habilidad propia")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Agregar" })).toBeDisabled();
  });

  it("disables actions and enables retry button when hasLoadError is true", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    renderSelector({
      hasLoadError: true,
      onRetry,
      feedback: { type: "error", message: "Error al cargar" },
    });

    expect(screen.getByRole("button", { name: "Guardar habilidades" })).toBeDisabled();
    screen.getAllByRole("button", { name: "Añadir" }).forEach((button) => {
      expect(button).toBeDisabled();
    });
    expect(screen.getByLabelText("Agregar habilidad propia")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Agregar" })).toBeDisabled();

    const retryButton = screen.getByRole("button", { name: "Reintentar" });
    expect(retryButton).toBeInTheDocument();
    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the feedback message after saving", () => {
    renderSelector({
      feedback: { type: "success", message: "Tus habilidades se guardaron correctamente." },
    });

    expect(screen.getByRole("status")).toHaveTextContent("Tus habilidades se guardaron correctamente.");
  });
});
