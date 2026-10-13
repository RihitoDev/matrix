import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DOCKER, VALID_CONDITIONS } from "../testing/vacancy-fixtures";
import { useJobOfferForm } from "./use-job-offer-form";

function fillInformation(result: { current: ReturnType<typeof useJobOfferForm> }) {
  act(() => {
    result.current.updateField("title", VALID_CONDITIONS.title);
    result.current.selectModality("Híbrido");
    result.current.updateField("mapsLink", VALID_CONDITIONS.mapsLink);
    result.current.updateField("contractType", VALID_CONDITIONS.contractType);
    result.current.updateField("category", VALID_CONDITIONS.category);
    result.current.updateField("vacancyCount", VALID_CONDITIONS.vacancyCount);
    result.current.updateField("salary", VALID_CONDITIONS.salary);
    result.current.updateField("languages", VALID_CONDITIONS.languages);
  });
}

describe("useJobOfferForm", () => {
  const scrollIntoView = vi.fn();

  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("empieza en el paso 1 con el estado vacío", () => {
    const { result } = renderHook(() => useJobOfferForm());

    expect(result.current.currentStep).toBe(1);
    expect(result.current.conditions.skills).toEqual([]);
    expect(result.current.errors).toEqual({});
  });

  it("al continuar con campos vacíos marca todos los obligatorios y enfoca el primero", () => {
    document.body.innerHTML = '<input id="title" />';
    const { result } = renderHook(() => useJobOfferForm());

    act(() => result.current.handleContinue());

    expect(result.current.currentStep).toBe(1);
    expect(Object.keys(result.current.errors)).toHaveLength(8);
    expect(document.activeElement).toBe(document.getElementById("title"));
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it("quita el error de un campo en cuanto se corrige", () => {
    const { result } = renderHook(() => useJobOfferForm());
    act(() => result.current.handleContinue());

    act(() => result.current.updateField("title", "DevOps"));

    expect(result.current.errors.title).toBeUndefined();
    expect(result.current.errors.category).toBe("Este campo es obligatorio");
  });

  it("avanza al paso 2 conservando los datos cuando el paso 1 es válido", () => {
    const { result } = renderHook(() => useJobOfferForm());
    fillInformation(result);

    act(() => result.current.handleContinue());

    expect(result.current.currentStep).toBe(2);
    expect(result.current.errors).toEqual({});
    expect(result.current.conditions.title).toBe("DevOps Senior");
  });

  it("no avanza con un enlace de Maps inválido", () => {
    const { result } = renderHook(() => useJobOfferForm());
    fillInformation(result);
    act(() => result.current.updateField("mapsLink", "hola.com"));

    act(() => result.current.handleContinue());

    expect(result.current.currentStep).toBe(1);
    expect(result.current.errors.mapsLink).toBe("Ingresa un enlace válido de Google Maps");
  });

  it("valida un campo al perder el foco sin marcar vacíos como error", () => {
    const { result } = renderHook(() => useJobOfferForm());

    act(() => result.current.validateField("mapsLink"));
    expect(result.current.errors.mapsLink).toBeUndefined();

    act(() => result.current.updateField("mapsLink", "hola.com"));
    act(() => result.current.validateMapsLink());
    expect(result.current.errors.mapsLink).toBe("Ingresa un enlace válido de Google Maps");

    act(() => result.current.updateField("mapsLink", "https://goo.gl/maps/abc"));
    act(() => result.current.validateField("mapsLink"));
    expect(result.current.errors.mapsLink).toBeUndefined();
  });

  it("en el paso 2 exige descripción y habilidades antes de pasar a la vista previa", () => {
    document.body.innerHTML = '<textarea id="description"></textarea>';
    const { result } = renderHook(() => useJobOfferForm());
    fillInformation(result);
    act(() => result.current.handleContinue());

    act(() => result.current.handleRequirementsContinue());
    expect(result.current.currentStep).toBe(2);
    expect(result.current.errors.description).toBe("Este campo es obligatorio");
    expect(result.current.errors.skills).toBe("Debes seleccionar al menos una habilidad requerida");

    act(() => {
      result.current.updateField("description", "Descripción");
      result.current.updateField("skills", [DOCKER]);
    });
    act(() => result.current.handleRequirementsContinue());

    expect(result.current.currentStep).toBe(3);
  });

  it("permite volver atrás sin perder los datos", () => {
    const { result } = renderHook(() => useJobOfferForm());
    fillInformation(result);
    act(() => result.current.handleContinue());

    act(() => result.current.goBack());

    expect(result.current.currentStep).toBe(1);
    expect(result.current.conditions.title).toBe("DevOps Senior");
    act(() => result.current.goBack());
    expect(result.current.currentStep).toBe(1);
  });

  it("no pasa del paso 3", () => {
    const { result } = renderHook(() => useJobOfferForm());

    act(() => { result.current.goNext(); result.current.goNext(); result.current.goNext(); });

    expect(result.current.currentStep).toBe(3);
  });

  it("indica si hay cambios sin guardar, ignorando los espacios en blanco", () => {
    const { result } = renderHook(() => useJobOfferForm());
    expect(result.current.hasUnsavedChanges).toBe(false);

    act(() => result.current.updateField("title", "   "));
    expect(result.current.hasUnsavedChanges).toBe(false);

    act(() => result.current.updateField("skills", [DOCKER]));
    expect(result.current.hasUnsavedChanges).toBe(true);

    act(() => result.current.reset());
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it("reset limpia los datos, los errores y vuelve al paso 1", () => {
    const { result } = renderHook(() => useJobOfferForm());
    fillInformation(result);
    act(() => result.current.handleContinue());

    act(() => result.current.reset());

    expect(result.current.currentStep).toBe(1);
    expect(result.current.conditions.title).toBe("");
    expect(result.current.conditions.modality).toBeNull();
    expect(result.current.errors).toEqual({});
  });
});
