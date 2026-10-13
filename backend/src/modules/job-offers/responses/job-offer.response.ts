export interface JobOfferCompanyResponse {
  id: string;
  name: string;
}

export interface JobOfferSkillResponse {
  id: string;
  name: string;
}

export interface JobOfferResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  modality: string;
  contractType: string;
  status: string;
  positionsAvailable: number;
  salaryRange: string;
  languages: string;
  locationUrl: string;
  expiresAt: string | null;
  createdAt: string;
  company: JobOfferCompanyResponse;
  skills: JobOfferSkillResponse[];
}
