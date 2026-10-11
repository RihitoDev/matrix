import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithQuery } from "@/shared/testing/render-with-query";
import { MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY } from "../constants/mentorship-wizard.constants";
import { clearMentorshipWizardDraft } from "../services/mentorship-wizard-draft.service";
import { MentorshipView } from "./mentorship-view";

const integrationMocks = vi.hoisted(() => ({
  activateMentor: vi.fn(),
  retryTechnicalAreas: vi.fn(),
  retryOrientationTypes: vi.fn(),
  isTechnicalAreasError: false,
  isOrientationTypesError: false,
}));

vi.mock("../services/mentor-activation.service", () => ({
  activateMentor: integrationMocks.activateMentor,
}));

vi.mock("../hooks/use-mentorship-catalogs", () => ({
  useMentorshipCatalogs: () => ({
    technicalAreas: [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "Backend",
        description: "Desarrollo backend",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Frontend",
        description: "Desarrollo frontend",
      },
    ],
    orientationTypes: [
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Orientación profesional",
        description: "Orientación profesional",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        name: "Orientación técnica",
        description: "Orientación técnica",
      },
    ],
    isTechnicalAreasLoading: false,
    isTechnicalAreasError: integrationMocks.isTechnicalAreasError,
    retryTechnicalAreas: integrationMocks.retryTechnicalAreas,
    isOrientationTypesLoading: false,
    isOrientationTypesError: integrationMocks.isOrientationTypesError,
    retryOrientationTypes: integrationMocks.retryOrientationTypes,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  integrationMocks.isTechnicalAreasError = false;
  integrationMocks.isOrientationTypesError = false;
  integrationMocks.activateMentor.mockResolvedValue({
    id: "550e8400-e29b-41d4-a716-446655440005",
  });
});

afterEach(() => {
  cleanup();
  clearMentorshipWizardDraft();
});

function advanceToConfirmation() {
  fireEvent.click(screen.getByRole("checkbox"));

  const nextButton = screen.getByRole("button", {
    name: /Continuar/i,
  });

  fireEvent.click(nextButton);
  fireEvent.click(screen.getByRole("button", { name: /Backend/i }));
  fireEvent.click(nextButton);
  fireEvent.click(
    screen.getByRole("button", { name: /Orientación profesional/i }),
  );
  fireEvent.click(nextButton);
}

describe("MentorshipView", () => {
  it("renderiza inicialmente el paso 1 con participación desmarcada", () => {
    renderWithQuery(<MentorshipView />);

    expect(
      screen.getByRole("heading", { name: "Participación" }),
    ).toBeDefined();

    expect(
      screen.getByText("Quiero participar como mentor"),
    ).toBeDefined();

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    expect((nextButton as HTMLButtonElement).disabled).toBe(true);
  });

  it("habilita Continuar al seleccionar participación", () => {
    renderWithQuery(<MentorshipView />);

    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    expect((nextButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("permite seleccionar participación desde toda la fila sin duplicar el cambio", () => {
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByText("Quiero participar como mentor"));

    expect(
      screen.getByRole("checkbox", {
        name: "Quiero participar como mentor",
      }),
    ).toBeChecked();
  });

  it("permite avanzar entre los pasos después de aceptar participación", () => {
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByRole("checkbox"));

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    fireEvent.click(nextButton);

    expect(
      screen.getByText("Paso 2: Áreas técnicas"),
    ).toBeDefined();
  });

  it("no permite avanzar del paso 2 sin seleccionar un área", () => {
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByRole("checkbox"));

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    fireEvent.click(nextButton);

    expect(
      screen.getByText("Paso 2: Áreas técnicas"),
    ).toBeDefined();

    expect((nextButton as HTMLButtonElement).disabled).toBe(true);

    expect(
      screen.getByText(
        "Debe seleccionarse al menos un área para continuar",
      ),
    ).toBeDefined();
  });

  it("permite avanzar del paso 2 al seleccionar al menos un área", () => {
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByRole("checkbox"));

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    fireEvent.click(nextButton);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Backend/i,
      }),
    );

    expect((nextButton as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(nextButton);

    expect(
      screen.getByRole("heading", {
        name: "Paso 3: Tipos de orientación",
      }),
    ).toBeDefined();
  });

  it("deshabilita Volver en el primer paso", () => {
    renderWithQuery(<MentorshipView />);

    const backButton = screen.getByRole("button", {
      name: /Volver/i,
    });

    expect(
      (backButton as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("permite regresar al paso anterior", () => {
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByRole("checkbox"));

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    fireEvent.click(nextButton);

    const backButton = screen.getByRole("button", {
      name: /Volver/i,
    });

    fireEvent.click(backButton);

    expect(
      screen.getByRole("heading", {
        name: "Participación",
      }),
    ).toBeDefined();
  });

  it("conserva la participación al avanzar y regresar", () => {
    renderWithQuery(<MentorshipView />);

    const checkbox = screen.getByRole("checkbox");

    fireEvent.click(checkbox);

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    fireEvent.click(nextButton);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Volver/i,
      }),
    );

    const participationCheckbox = screen.getByRole("checkbox");

    expect(participationCheckbox).toBeChecked();
  });

  it("muestra el título principal del wizard", () => {
    renderWithQuery(<MentorshipView />);

    expect(
      screen.getByText("Participa como mentor"),
    ).toBeDefined();
  });

  it("actualiza el contador al seleccionar áreas", () => {
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByRole("checkbox"));

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    fireEvent.click(nextButton);

    expect(
      screen.getByText("0 seleccionadas"),
    ).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Backend/i,
      }),
    );

    expect(
      screen.getByText("1 seleccionada"),
    ).toBeDefined();
  });

  it("deshabilita Continuar en el paso 3 sin orientación seleccionada", () => {
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByRole("checkbox"));

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    fireEvent.click(nextButton);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Backend/i,
      }),
    );

    fireEvent.click(nextButton);

    expect(
      screen.getByRole("heading", {
        name: "Paso 3: Tipos de orientación",
      }),
    ).toBeDefined();

    expect(
      (nextButton as HTMLButtonElement).disabled,
    ).toBe(true);

    expect(
      screen.getByRole("alert"),
    ).toHaveTextContent(
      "Debe seleccionarse al menos un tipo de orientación para continuar",
    );
  });

  it("habilita Continuar en el paso 3 al seleccionar una orientación", () => {
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByRole("checkbox"));

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    fireEvent.click(nextButton);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Backend/i,
      }),
    );

    fireEvent.click(nextButton);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Orientación profesional/i,
      }),
    );

    expect(
      (nextButton as HTMLButtonElement).disabled,
    ).toBe(false);
  });

  it("muestra la confirmación en el último paso", () => {
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByRole("checkbox"));

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    fireEvent.click(nextButton);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Backend/i,
      }),
    );

    fireEvent.click(nextButton);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Orientación profesional/i,
      }),
    );

    fireEvent.click(nextButton);

    expect(
      screen.getByRole("heading", {
        name: "Confirma tu participación",
      }),
    ).toBeDefined();

    expect(
      screen.getByRole("button", {
        name: "Activar participación",
      }),
    ).toBeDefined();
  });

  it("muestra las orientaciones y permite seleccionar varias", () => {
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByRole("checkbox"));

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    fireEvent.click(nextButton);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Backend/i,
      }),
    );

    fireEvent.click(nextButton);

    const professionalButton = screen.getByRole("button", {
      name: /Orientación profesional/i,
    });

    const technicalButton = screen.getByRole("button", {
      name: /Orientación técnica/i,
    });

    fireEvent.click(professionalButton);
    fireEvent.click(technicalButton);

    expect(
      screen.getByText("2 seleccionadas"),
    ).toBeDefined();

    expect(
      professionalButton.getAttribute("aria-pressed"),
    ).toBe("true");

    expect(
      technicalButton.getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("conserva las orientaciones al avanzar y regresar", () => {
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByRole("checkbox"));

    const nextButton = screen.getByRole("button", {
      name: /Continuar/i,
    });

    fireEvent.click(nextButton);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Backend/i,
      }),
    );

    fireEvent.click(nextButton);

    fireEvent.click(
      screen.getByRole("button", {
        name: /Orientación profesional/i,
      }),
    );

    fireEvent.click(nextButton);

    expect(
      screen.getByRole("heading", {
        name: "Confirma tu participación",
      }),
    ).toBeDefined();

    fireEvent.click(
      screen.getByRole("button", {
        name: /Volver/i,
      }),
    );

    expect(
      screen.getByText("1 seleccionada"),
    ).toBeDefined();

    const professionalButton = screen.getByRole("button", {
      name: /Orientación profesional/i,
    });

    expect(
      professionalButton.getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("retries only technical areas from their error state", () => {
    integrationMocks.isTechnicalAreasError = true;
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(integrationMocks.retryTechnicalAreas).toHaveBeenCalledTimes(1);
    expect(integrationMocks.retryOrientationTypes).not.toHaveBeenCalled();
  });

  it("does not show a technical-area error when orientation types fail", () => {
    integrationMocks.isOrientationTypesError = true;
    renderWithQuery(<MentorshipView />);

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));

    expect(screen.getByText("Paso 2: Áreas técnicas")).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(
      screen.queryByText("No se pudieron cargar las áreas técnicas."),
    ).not.toBeInTheDocument();
  });

  it("shows success only after one activation resolves and clears the draft", async () => {
    let resolveActivation!: (value: { id: string }) => void;
    integrationMocks.activateMentor.mockReturnValue(
      new Promise((resolve) => {
        resolveActivation = resolve;
      }),
    );
    renderWithQuery(<MentorshipView />);
    advanceToConfirmation();

    await waitFor(() => {
      expect(
        localStorage.getItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY),
      ).not.toBeNull();
    });

    const activateButton = screen.getByRole("button", {
      name: "Activar participación",
    });
    fireEvent.click(activateButton);
    fireEvent.click(activateButton);

    expect(integrationMocks.activateMentor).toHaveBeenCalledTimes(1);
    expect(integrationMocks.activateMentor).toHaveBeenCalledWith({
      technicalAreaIds: ["550e8400-e29b-41d4-a716-446655440001"],
      orientationTypeIds: ["550e8400-e29b-41d4-a716-446655440003"],
    });
    expect(
      screen.queryByRole("heading", {
        name: "Tu participación como mentor está activa",
      }),
    ).not.toBeInTheDocument();
    expect(
      localStorage.getItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY),
    ).not.toBeNull();

    await act(async () => {
      resolveActivation({ id: "550e8400-e29b-41d4-a716-446655440005" });
    });

    expect(
      screen.getByRole("heading", {
        name: "Tu participación como mentor está activa",
      }),
    ).toBeInTheDocument();
    expect(
      localStorage.getItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY),
    ).toBeNull();
  });

  it("keeps selections and the draft when activation returns a conflict", async () => {
    integrationMocks.activateMentor.mockRejectedValue({
      isAxiosError: true,
      response: { status: 409 },
    });
    renderWithQuery(<MentorshipView />);
    advanceToConfirmation();

    await waitFor(() => {
      expect(
        localStorage.getItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY),
      ).not.toBeNull();
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Activar participación" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Tu participación como mentor ya está activa.",
    );
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("Orientación profesional")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: "Tu participación como mentor está activa",
      }),
    ).not.toBeInTheDocument();
    expect(
      localStorage.getItem(MENTORSHIP_WIZARD_DRAFT_STORAGE_KEY),
    ).not.toBeNull();
  });
});
