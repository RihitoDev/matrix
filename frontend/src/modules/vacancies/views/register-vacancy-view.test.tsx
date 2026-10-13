import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EMPTY_CONDITIONS, VALID_CONDITIONS } from "../testing/vacancy-fixtures";
import { RegisterVacancyView } from "./register-vacancy-view";

const { form, publication } = vi.hoisted(() => ({
  form: {
    currentStep: 1,
    conditions: {},
    errors: {},
    updateField: vi.fn(),
    selectModality: vi.fn(),
    validateField: vi.fn(),
    handleContinue: vi.fn(),
    handleRequirementsContinue: vi.fn(),
    goBack: vi.fn(),
    reset: vi.fn(),
  },
  publication: {
    status: "idle",
    error: null,
    isSubmitting: false,
    isSuccess: false,
    submit: vi.fn(),
    reset: vi.fn(),
  },
}));

vi.mock("../hooks/use-job-offer-form", () => ({ useJobOfferForm: () => form }));
vi.mock("../hooks/use-publish-job-offer", () => ({ usePublishJobOffer: () => publication }));
vi.mock("../components/vacancy-stepper", () => ({
  VacancyStepper: ({ currentStep }: { currentStep: number }) => <div data-testid="stepper">Paso {currentStep}</div>,
}));
vi.mock("../components/information-step", () => ({
  InformationStep: ({ onContinue }: { onContinue: () => void }) => (
    <div data-testid="information-step"><button onClick={onContinue}>Continuar</button></div>
  ),
}));
vi.mock("../components/requirements-step", () => ({
  RequirementsStep: ({ onPrevious, onContinue }: { onPrevious: () => void; onContinue: () => void }) => (
    <div data-testid="requirements-step">
      <button onClick={onPrevious}>Anterior</button>
      <button onClick={onContinue}>Continuar</button>
    </div>
  ),
}));
vi.mock("../components/preview-step", () => ({
  PreviewStep: ({
    onPrevious,
    onConfirm,
    onFinish,
    isSubmitting,
    isPublished,
  }: {
    onPrevious: () => void;
    onConfirm: () => void;
    onFinish: () => void;
    isSubmitting: boolean;
    isPublished: boolean;
  }) => (
    <div data-testid="preview-step">
      <span>{isSubmitting ? "enviando" : "libre"}</span>
      <span>{isPublished ? "publicada" : "pendiente"}</span>
      <button onClick={onPrevious}>Anterior</button>
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onFinish}>Aceptar</button>
    </div>
  ),
}));

function setStep(currentStep: number, conditions = EMPTY_CONDITIONS) {
  form.currentStep = currentStep;
  form.conditions = conditions;
}

describe("RegisterVacancyView", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    publication.isSubmitting = false;
    publication.isSuccess = false;
  });

  it("muestra solo el paso que corresponde al paso actual", () => {
    setStep(1);
    render(<RegisterVacancyView />);

    expect(screen.getByTestId("information-step")).toBeInTheDocument();
    expect(screen.queryByTestId("requirements-step")).not.toBeInTheDocument();
    expect(screen.queryByTestId("preview-step")).not.toBeInTheDocument();
  });

  it("conecta Continuar del paso 1 con la validación del paso 1", () => {
    setStep(1);
    render(<RegisterVacancyView />);

    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(form.handleContinue).toHaveBeenCalledOnce();
  });

  it("conecta el paso 2 con la validación de descripción y habilidades", () => {
    setStep(2);
    render(<RegisterVacancyView />);

    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(form.goBack).toHaveBeenCalledOnce();
    expect(form.handleRequirementsContinue).toHaveBeenCalledOnce();
  });

  it("publica con los datos acumulados al confirmar en el paso 3", () => {
    setStep(3, VALID_CONDITIONS);
    render(<RegisterVacancyView />);

    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(publication.submit).toHaveBeenCalledWith(VALID_CONDITIONS);
  });

  it("refleja el estado de la publicación en la vista previa", () => {
    setStep(3, VALID_CONDITIONS);
    publication.isSubmitting = true;
    render(<RegisterVacancyView />);

    expect(screen.getByText("enviando")).toBeInTheDocument();
    cleanup();

    publication.isSubmitting = false;
    publication.isSuccess = true;
    render(<RegisterVacancyView />);
    expect(screen.getByText("publicada")).toBeInTheDocument();
  });

  it("al aceptar el éxito limpia la publicación y el formulario", () => {
    setStep(3, VALID_CONDITIONS);
    render(<RegisterVacancyView />);

    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    expect(publication.reset).toHaveBeenCalledOnce();
    expect(form.reset).toHaveBeenCalledOnce();
  });

  it("vuelve al paso anterior desde la vista previa", () => {
    setStep(3, VALID_CONDITIONS);
    render(<RegisterVacancyView />);

    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));

    expect(form.goBack).toHaveBeenCalledOnce();
  });
});
