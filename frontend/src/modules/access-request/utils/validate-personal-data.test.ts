import { describe, expect, it } from "vitest";
import type { PersonalDataValues } from "../types/access-request.types";
import { validatePersonalData } from "./validate-personal-data";

const NOW = new Date("2026-10-05T12:00:00Z");

const valid: PersonalDataValues = {
  firstName: "María José",
  lastName: "Peña Ñáñez",
  idCardNumber: "1234567",
  idCardIssuedIn: "CB",
  sisCode: "202012345",
  email: "Maria@Umss.edu.bo",
  phone: "71234567",
  birthDate: "2000-05-10",
  graduationYear: "2019",
  career: "Licenciatura en Ingeniería de Sistemas",
};

const errorsOf = (overrides: Partial<PersonalDataValues>) =>
  validatePersonalData({ ...valid, ...overrides }, NOW);

describe("validatePersonalData", () => {
  it("acepta datos válidos y el teléfono vacío", () => {
    expect(validatePersonalData(valid, NOW)).toEqual({});
    expect(errorsOf({ phone: "" })).toEqual({});
  });

  it("no se rompe si phone es undefined y lo trata como vacío", () => {
    const withoutPhone = { ...valid, phone: undefined } as unknown as PersonalDataValues;

    expect(() => validatePersonalData(withoutPhone, NOW)).not.toThrow();
    expect(validatePersonalData(withoutPhone, NOW)).toEqual({});
  });

  it("exige nombres y apellidos", () => {
    expect(errorsOf({ firstName: "  " }).firstName).toBe("Los nombres son obligatorios");
    expect(errorsOf({ lastName: "" }).lastName).toBe("Los apellidos son obligatorios");
  });

  it.each(["Juan3", "Juan_", "Juan  Pérez"])("rechaza el nombre %j", (firstName) => {
    expect(errorsOf({ firstName }).firstName).toBe("Los nombres solo pueden contener letras y espacios");
  });

  it("rechaza apellidos con símbolos y nombres largos", () => {
    expect(errorsOf({ lastName: "Pérez1" }).lastName).toBe("Los apellidos solo pueden contener letras y espacios");
    expect(errorsOf({ firstName: "a".repeat(101) }).firstName).toBe("Los nombres no pueden superar los 100 caracteres");
  });

  it("valida carnet y SIS: obligatorios, dígitos y máximo 20", () => {
    expect(errorsOf({ idCardNumber: "" }).idCardNumber).toBe("El carnet de identidad es obligatorio");
    expect(errorsOf({ idCardNumber: "12a" }).idCardNumber).toBe("El carnet de identidad solo puede contener dígitos");
    expect(errorsOf({ sisCode: "1".repeat(21) }).sisCode).toBe("El código SIS no puede superar los 20 dígitos");
    expect(errorsOf({ sisCode: "2020AB" }).sisCode).toBe("El código SIS solo puede contener dígitos");
    expect(errorsOf({ sisCode: "1".repeat(20) }).sisCode).toBeUndefined();
  });

  it("valida el departamento de expedición", () => {
    expect(errorsOf({ idCardIssuedIn: "XX" }).idCardIssuedIn).toBe("El departamento de expedición no es válido");
    expect(errorsOf({ idCardIssuedIn: "" }).idCardIssuedIn).toBeDefined();
    for (const code of ["CB", "LP", "SC", "OR", "PT", "CH", "TJ", "BE", "PD"]) {
      expect(errorsOf({ idCardIssuedIn: code }).idCardIssuedIn).toBeUndefined();
    }
  });

  it("valida el correo", () => {
    expect(errorsOf({ email: "" }).email).toBe("El correo es obligatorio");
    expect(errorsOf({ email: "no-es-correo" }).email).toBe("El correo no tiene un formato válido");
    expect(errorsOf({ email: `${"a".repeat(150)}@umss.edu.bo` }).email).toBe("El correo no puede superar los 150 caracteres");
  });

  it.each(["12345", "123456789", "abcdefgh", "1234 567"])("rechaza el teléfono %j", (phone) => {
    expect(errorsOf({ phone }).phone).toBe("El teléfono debe tener entre 6 y 8 dígitos");
  });

  it.each(["123456", "1234567", "12345678", ""])("acepta el teléfono %j", (phone) => {
    expect(errorsOf({ phone }).phone).toBeUndefined();
  });

  describe("fecha de nacimiento (fecha fija 2026-10-05)", () => {
    it("acepta quien cumple 18 hoy", () => {
      expect(errorsOf({ birthDate: "2008-10-05", graduationYear: "2026" }).birthDate).toBeUndefined();
    });

    it("rechaza quien cumple 18 mañana", () => {
      expect(errorsOf({ birthDate: "2008-10-06", graduationYear: "2026" }).birthDate).toBe("Debes ser mayor de 18 años");
    });

    it("rechaza fechas inexistentes, formatos y vacío", () => {
      expect(errorsOf({ birthDate: "2000-02-30" }).birthDate).toBe("La fecha de nacimiento no es válida");
      expect(errorsOf({ birthDate: "10/05/2000" }).birthDate).toBe("La fecha de nacimiento debe tener el formato AAAA-MM-DD");
      expect(errorsOf({ birthDate: "" }).birthDate).toBe("La fecha de nacimiento es obligatoria");
    });
  });

  describe("año de titulación (nacida en 2000)", () => {
    it("acepta 2018 y rechaza 2017", () => {
      expect(errorsOf({ graduationYear: "2018" }).graduationYear).toBeUndefined();
      expect(errorsOf({ graduationYear: "2017" }).graduationYear).toBe("El año de titulación no puede ser anterior a los 18 años de edad");
    });

    it("acepta el año actual y rechaza uno futuro", () => {
      expect(errorsOf({ graduationYear: "2026" }).graduationYear).toBeUndefined();
      expect(errorsOf({ graduationYear: "2027" }).graduationYear).toBe("El año de titulación no puede ser futuro");
    });

    it("rechaza vacío, decimales y textos", () => {
      expect(errorsOf({ graduationYear: "" }).graduationYear).toBe("El año de titulación es obligatorio");
      expect(errorsOf({ graduationYear: "2019.5" }).graduationYear).toBe("El año de titulación debe ser un número entero");
      expect(errorsOf({ graduationYear: "abcd" }).graduationYear).toBe("El año de titulación debe ser un número entero");
    });

    it("no evalúa la coherencia si la fecha de nacimiento es inválida", () => {
      expect(errorsOf({ birthDate: "2000-02-30", graduationYear: "1990" }).graduationYear).toBeUndefined();
    });
  });

  it("valida la carrera contra los nombres de WebSIS", () => {
    expect(errorsOf({ career: "Licenciatura Ingeniería en Informática" }).career).toBeUndefined();
    expect(errorsOf({ career: "Ingeniería de Sistemas" }).career).toBe("La carrera no es válida");
    expect(errorsOf({ career: "" }).career).toBe("La carrera no es válida");
  });

  it("no usa el término egresado en ningún mensaje", () => {
    const all = JSON.stringify(
      validatePersonalData(
        { firstName: "", lastName: "", idCardNumber: "", idCardIssuedIn: "", sisCode: "", email: "", phone: "1", birthDate: "", graduationYear: "", career: "" },
        NOW,
      ),
    );
    expect(all.toLowerCase()).not.toContain("egresad");
  });
});
