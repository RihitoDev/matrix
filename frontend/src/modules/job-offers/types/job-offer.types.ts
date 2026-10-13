import type { ContractType, Modality } from "./vacancy-conditions.types";

export interface CreateJobOfferPayload {
  title: string;
  description: string;
  modality: Modality;
  contractType: ContractType;
  category: string;
  positionsAvailable: number;
  salaryMin: number;
  salaryMax?: number;
  languages: string;
  locationUrl: string;
  skillIds: string[];
}

export interface JobOfferCreatedResponse {
  id: string;
  createdAt: string;
}

export type PublishErrorKind = "network" | "validation" | "company" | "session" | "server";

export interface PublishError {
  kind: PublishErrorKind;
  message: string;
  details: string[];
}

export interface CurrentCompany {
  id: string | null;
  name: string;
  initials: string;
}
