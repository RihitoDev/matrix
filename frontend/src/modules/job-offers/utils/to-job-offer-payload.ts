import type { ContractType, Modality, VacancyConditions } from "../types/vacancy-conditions.types";
import type { CreateJobOfferPayload } from "../types/job-offer.types";
import { parseSalary } from "./parse-salary";

export function toJobOfferPayload(conditions: VacancyConditions): CreateJobOfferPayload {
  const salary = parseSalary(conditions.salary);

  return {
    title: conditions.title.trim(),
    description: conditions.description.trim(),
    modality: conditions.modality as Modality,
    contractType: conditions.contractType as ContractType,
    category: conditions.category.trim(),
    positionsAvailable: Number.parseInt(conditions.vacancyCount, 10),
    salaryMin: salary.min ?? 0,
    ...(salary.max === null ? {} : { salaryMax: salary.max }),
    languages: conditions.languages.trim(),
    locationUrl: conditions.mapsLink.trim(),
    skillIds: conditions.skills.map((skill) => skill.id),
  };
}
