import type { VacancyConditions } from "../hooks/use-job-offer-form";
import type { ContractType, CreateJobOfferPayload, Modality } from "../types/job-offer.types";
import { parseSalary } from "./parse-salary";

/**
 * Traduce el estado del wizard al contrato del backend.
 * Debe llamarse solo con datos ya validados (validateInformation + validateRequirements).
 */
export function toJobOfferPayload(conditions: VacancyConditions): CreateJobOfferPayload {
  const salary = parseSalary(conditions.salary);

  return {
    tituloPuesto: conditions.title.trim(),
    descripcion: conditions.description.trim(),
    modalidad: conditions.modality as Modality,
    tipoContrato: conditions.contractType as ContractType,
    categoria: conditions.category.trim(),
    numeroVacantes: Number.parseInt(conditions.vacancyCount, 10),
    salarioMin: salary.min ?? 0,
    ...(salary.max === null ? {} : { salarioMax: salary.max }),
    idiomas: conditions.languages.trim(),
    enlaceGoogleMaps: conditions.mapsLink.trim(),
    tecnologias: conditions.skills.map((skill) => skill.id),
  };
}
