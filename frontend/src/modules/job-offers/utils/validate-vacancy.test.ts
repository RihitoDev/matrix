import { describe, expect, it } from "vitest";
import { buildLongDescription, EMPTY_CONDITIONS, DOCKER, VALID_CONDITIONS } from "../testing/vacancy-fixtures";
import { validateInformation, validateRequirements } from "./validate-vacancy";

const withValues = (values: Partial<typeof VALID_CONDITIONS>) => ({ ...VALID_CONDITIONS, ...values });

describe("validateInformation", () => {
  it("no devuelve errores con datos válidos", () => {
    expect(validateInformation(VALID_CONDITIONS)).toEqual({});
  });

  it("marca todos los campos obligatorios vacíos, incluido el salario", () => {
    expect(Object.keys(validateInformation(EMPTY_CONDITIONS)).sort()).toEqual(
      ["category", "contractType", "languages", "mapsLink", "modality", "salary", "title", "vacancyCount"].sort(),
    );
    expect(validateInformation(EMPTY_CONDITIONS).title).toBe("Este campo es obligatorio");
  });

  it("trata los textos con solo espacios como vacíos", () => {
    const errors = validateInformation(withValues({ title: "   ", languages: "  ", category: " " }));
    expect(errors.title).toBe("Este campo es obligatorio");
    expect(errors.languages).toBe("Este campo es obligatorio");
    expect(errors.category).toBe("Este campo es obligatorio");
  });

  it("valida el título: símbolos y longitud", () => {
    expect(validateInformation(withValues({ title: "Dev@" })).title).toMatch(/alfanum/);
    expect(validateInformation(withValues({ title: "a".repeat(61) })).title).toMatch(/60/);
    expect(validateInformation(withValues({ title: "Ingeniero Peña" })).title).toBeUndefined();
  });

  it("acepta solo los enlaces de Google Maps que acepta el backend", () => {
    const invalid = "Ingresa un enlace válido de Google Maps";
    expect(validateInformation(withValues({ mapsLink: "hola.com" })).mapsLink).toBe(invalid);
    expect(validateInformation(withValues({ mapsLink: "http://maps.google.com/?q=x" })).mapsLink).toBe(invalid);
    expect(validateInformation(withValues({ mapsLink: "https://goo.gl/maps/abc" })).mapsLink).toBeUndefined();
  });

  it("exige un número de vacantes entre 1 y 500", () => {
    expect(validateInformation(withValues({ vacancyCount: "0" })).vacancyCount).toBe("Debe ser al menos 1");
    expect(validateInformation(withValues({ vacancyCount: "501" })).vacancyCount).toMatch(/500/);
    expect(validateInformation(withValues({ vacancyCount: "500" })).vacancyCount).toBeUndefined();
  });

  it("valida el salario: mayor a 0, rango ordenado y rango completo", () => {
    expect(validateInformation(withValues({ salary: "Bs 0" })).salary).toBe("El salario debe ser mayor a 0");
    expect(validateInformation(withValues({ salary: "Bs 9.000 - 8.000" })).salary).toMatch(/mínimo no puede ser mayor/);
    expect(validateInformation(withValues({ salary: "Bs 6.500 - " })).salary).toMatch(/Completa el rango/);
    expect(validateInformation(withValues({ salary: "Bs 5.000" })).salary).toBeUndefined();
  });

  it("limita los idiomas a 100 caracteres", () => {
    expect(validateInformation(withValues({ languages: "x".repeat(101) })).languages).toMatch(/100/);
  });
});

describe("validateRequirements", () => {
  it("no devuelve errores con descripción y habilidades válidas", () => {
    expect(validateRequirements(VALID_CONDITIONS)).toEqual({});
  });

  it("exige la descripción, también si solo tiene espacios", () => {
    expect(validateRequirements(withValues({ description: "" })).description).toBe("Este campo es obligatorio");
    expect(validateRequirements(withValues({ description: "   \n  " })).description).toBe("Este campo es obligatorio");
  });

  it("limita la descripción a 3000 caracteres", () => {
    expect(validateRequirements(withValues({ description: buildLongDescription(3001) })).description).toMatch(/3000/);
    expect(validateRequirements(withValues({ description: buildLongDescription(3000) })).description).toBeUndefined();
  });

  it("exige al menos una habilidad y como máximo diez", () => {
    expect(validateRequirements(withValues({ skills: [] })).skills).toBe(
      "Debes seleccionar al menos una habilidad requerida",
    );
    const eleven = Array.from({ length: 11 }, (_, index) => ({ ...DOCKER, id: `id-${index}` }));
    expect(validateRequirements(withValues({ skills: eleven })).skills).toMatch(/máximo de 10/);
  });
});
