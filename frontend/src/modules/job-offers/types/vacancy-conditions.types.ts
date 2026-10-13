import type { CONTRACT_TYPES, MODALITIES } from "../constants/vacancies.constants";

export type Modality = (typeof MODALITIES)[number];
export type ContractType = (typeof CONTRACT_TYPES)[number];

export interface SkillOption {
  id: string;
  name: string;
}

export interface VacancyConditions {
  title: string;
  modality: Modality | null;
  mapsLink: string;
  contractType: string;
  category: string;
  vacancyCount: string;
  salary: string;
  languages: string;
  description: string;
  skills: SkillOption[];
}

export type VacancyErrors = Partial<Record<keyof VacancyConditions, string>>;

export type UpdateVacancyField = <Field extends keyof VacancyConditions>(
  field: Field,
  value: VacancyConditions[Field],
) => void;
