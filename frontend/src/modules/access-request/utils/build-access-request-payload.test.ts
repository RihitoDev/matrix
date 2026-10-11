import { describe, expect, it } from "vitest";
import type { PersonalDataValues } from "../types/access-request.types";
import { buildAccessRequestPayload } from "./build-access-request-payload";

const values: PersonalDataValues = {
  firstName: "  Ana María ",
  lastName: " Rojas ",
  idCardNumber: " 1234567 ",
  idCardIssuedIn: "LP",
  sisCode: " 202012345 ",
  email: " ana@umss.edu.bo ",
  phone: " 71234567 ",
  birthDate: "2000-05-10",
  graduationYear: "2019",
  career: "Licenciatura Ingeniería en Informática",
};

describe("buildAccessRequestPayload", () => {
  it("recorta los textos y envía graduationYear como número", () => {
    expect(buildAccessRequestPayload(values, "create")).toEqual({
      firstName: "Ana María",
      lastName: "Rojas",
      idCardNumber: "1234567",
      idCardIssuedIn: "LP",
      sisCode: "202012345",
      email: "ana@umss.edu.bo",
      phone: "71234567",
      birthDate: "2000-05-10",
      graduationYear: 2019,
      career: "Licenciatura Ingeniería en Informática",
    });
  });

  it("omite la clave phone en POST si está vacío", () => {
    const payload = buildAccessRequestPayload({ ...values, phone: "   " }, "create");
    expect(payload).not.toHaveProperty("phone");
  });

  it("envía phone null en PATCH si está vacío", () => {
    expect(buildAccessRequestPayload({ ...values, phone: "" }, "update").phone).toBeNull();
  });

  it("trata phone undefined como vacío: se omite en POST y es null en PATCH", () => {
    const withoutPhone = { ...values, phone: undefined } as unknown as PersonalDataValues;

    expect(buildAccessRequestPayload(withoutPhone, "create")).not.toHaveProperty("phone");
    expect(buildAccessRequestPayload(withoutPhone, "update").phone).toBeNull();
  });

  it("envía el teléfono en PATCH si está lleno", () => {
    expect(buildAccessRequestPayload(values, "update").phone).toBe("71234567");
  });
});
