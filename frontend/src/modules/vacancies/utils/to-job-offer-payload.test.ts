import { describe, expect, it } from "vitest";
import { DOCKER, KUBERNETES, VALID_CONDITIONS } from "../testing/vacancy-fixtures";
import { toJobOfferPayload } from "./to-job-offer-payload";

describe("toJobOfferPayload", () => {
  it("traduce el estado del wizard al contrato del backend", () => {
    expect(toJobOfferPayload(VALID_CONDITIONS)).toEqual({
      tituloPuesto: "DevOps Senior",
      descripcion: "Buscamos un perfil DevOps con experiencia en Docker y Kubernetes.",
      modalidad: "Híbrido",
      tipoContrato: "Tiempo completo",
      categoria: "Tecnología",
      numeroVacantes: 2,
      salarioMin: 6500,
      salarioMax: 8000,
      idiomas: "Español, inglés intermedio",
      enlaceGoogleMaps: "https://maps.google.com/?q=Av.+Ballivian+742+Cochabamba",
      tecnologias: [DOCKER.id, KUBERNETES.id],
    });
  });

  it("no envía salarioMax cuando el salario es un monto fijo", () => {
    const payload = toJobOfferPayload({ ...VALID_CONDITIONS, salary: "Bs 5.000" });

    expect(payload.salarioMin).toBe(5000);
    expect(payload).not.toHaveProperty("salarioMax");
  });

  it("recorta los espacios de los textos", () => {
    const payload = toJobOfferPayload({ ...VALID_CONDITIONS, title: "  DevOps  ", languages: " Español " });

    expect(payload.tituloPuesto).toBe("DevOps");
    expect(payload.idiomas).toBe("Español");
  });

  it("envía los ids (UUID) de las habilidades, no sus nombres", () => {
    expect(toJobOfferPayload(VALID_CONDITIONS).tecnologias).toEqual([DOCKER.id, KUBERNETES.id]);
  });
});
