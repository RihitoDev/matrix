import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_CONDITIONS, VALID_CONDITIONS } from "../testing/vacancy-fixtures";
import { RegisterVacancyView } from "./register-vacancy-view";

const { form, publication, leaveGuard } = vi.hoisted(() => ({
  form: {
    currentStep: 1,
    conditions: {},
    errors: {},
    hasUnsavedChanges: false,
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
  leaveGuard: {
    isLeaveDialogOpen: false,
    confirmLeave: vi.fn(),
    cancelLeave: vi.fn(),
  },
}));

const useLeaveGuard = vi.fn((isActive: boolean) => {
  void isActive;
  return leaveGuard;
});

vi.mock("../hooks/use-job-offer-form", () => ({ useJobOfferForm: () => form }));
vi.mock("../hooks/use-publish-job-offer", () => ({ usePublishJobOffer: () => publication }));
vi.mock("../hooks/use-leave-guard", () => ({ useLeaveGuard: (isActive: boolean) => useLeaveGuard(isActive) }));
vi.mock("../components/vacancy-stepper", () => ({
  VacancyStepper: ({ currentStep }: { currentStep: number }) => <div data-testid="stepper">Paso {currentStep}</div>,
}));
vi.mock("../components/information-step", () => ({
  InformationStep: ({ onCancel, onContinue }: { onCancel: () => void; onContinue: () => void }) => (
    <div data-testid="information-step">
      <button onClick={onCancel}>Cancelar</button>
      <button onClick={onContinue}>Continuar</button>
    </div>
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
  PreviewStep: (props: {
    onPrevious: () => void;
    onConfirm: () => void;
    onFinish: () => void;
    isSubmitting: boolean;
    isPublished: boolean;
    company: { name: string };
  }) => (
    <div data-testid="preview-step">
      <span>{props.isSubmitting ? "enviando" : "libre"}</span>
      <span>{props.isPublished ? "publicada" : "pendiente"}</span>
      <span>{props.company.name}</span>
      <button onClick={props.onPrevious}>Anterior</button>
      <button onClick={props.onConfirm}>Confirmar</button>
      <button onClick={props.onFinish}>Aceptar</button>
    </div>
  ),
}));

function setStep(currentStep: number, conditions = EMPTY_CONDITIONS, hasUnsavedChanges = false) {
  form.currentStep = currentStep;
  form.conditions = conditions;
  form.hasUnsavedChanges = hasUnsavedChanges;
}

describe("RegisterVacancyView", () => {
  beforeEach(() => {
    publication.isSubmitting = false;
    publication.isSuccess = false;
    leaveGuard.isLeaveDialogOpen = false;
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("muestra solo el paso actual", () => {
    setStep(1);
    render(<RegisterVacancyView />);

    expect(screen.getByTestId("information-step")).toBeInTheDocument();
    expect(screen.queryByTestId("requirements-step")).not.toBeInTheDocument();
    expect(screen.queryByTestId("preview-step")).not.toBeInTheDocument();
  });

  it("conecta Continuar de cada paso con su validación", () => {
    setStep(1);
    render(<RegisterVacancyView />);
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(form.handleContinue).toHaveBeenCalledOnce();

    cleanup();
    setStep(2);
    render(<RegisterVacancyView />);
    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(form.goBack).toHaveBeenCalledOnce();
    expect(form.handleRequirementsContinue).toHaveBeenCalledOnce();
  });

  it("Cancelar sin cambios no abre el diálogo", () => {
    setStep(1);
    render(<RegisterVacancyView />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByText("¿Descartar los cambios?")).not.toBeInTheDocument();
  });

  it("Cancelar con cambios pide confirmación y descarta al confirmar", async () => {
    setStep(1, VALID_CONDITIONS, true);
    render(<RegisterVacancyView />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByText("¿Descartar los cambios?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Descartar" }));

    expect(form.reset).toHaveBeenCalledOnce();
    expect(publication.reset).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByText("¿Descartar los cambios?")).not.toBeInTheDocument());
  });

  it("Seguir editando cierra el diálogo sin descartar", async () => {
    setStep(1, VALID_CONDITIONS, true);
    render(<RegisterVacancyView />);

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(screen.getByRole("button", { name: "Seguir editando" }));

    await waitFor(() => expect(screen.queryByText("¿Descartar los cambios?")).not.toBeInTheDocument());
    expect(form.reset).not.toHaveBeenCalled();
  });

  it("activa el aviso de salida solo con cambios y sin publicar", () => {
    setStep(1, VALID_CONDITIONS, true);
    render(<RegisterVacancyView />);
    expect(useLeaveGuard).toHaveBeenLastCalledWith(true);

    cleanup();
    publication.isSuccess = true;
    render(<RegisterVacancyView />);
    expect(useLeaveGuard).toHaveBeenLastCalledWith(false);
  });

  it("muestra el diálogo de salida y delega la decisión", () => {
    setStep(1, VALID_CONDITIONS, true);
    leaveGuard.isLeaveDialogOpen = true;
    render(<RegisterVacancyView />);

    expect(screen.getByText("¿Salir sin publicar?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salir" }));
    expect(leaveGuard.confirmLeave).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: "Quedarme" }));
    expect(leaveGuard.cancelLeave).toHaveBeenCalled();
  });

  it("publica con los datos acumulados y muestra el estado del envío", () => {
    setStep(3, VALID_CONDITIONS, true);
    publication.isSubmitting = true;
    render(<RegisterVacancyView />);

    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(publication.submit).toHaveBeenCalledWith(VALID_CONDITIONS);
    expect(screen.getByText("enviando")).toBeInTheDocument();
    expect(screen.getByText("TechBolivia S.R.L.")).toBeInTheDocument();
  });

  it("al aceptar el éxito limpia la publicación y el formulario", () => {
    setStep(3, VALID_CONDITIONS, true);
    publication.isSuccess = true;
    render(<RegisterVacancyView />);

    expect(screen.getByText("publicada")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));

    expect(publication.reset).toHaveBeenCalledOnce();
    expect(form.reset).toHaveBeenCalledOnce();
  });

  it("vuelve al paso anterior desde la vista previa", () => {
    setStep(3, VALID_CONDITIONS, true);
    render(<RegisterVacancyView />);

    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));

    expect(form.goBack).toHaveBeenCalledOnce();
  });
});
