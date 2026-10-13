export type AreaId =
  | "desarrollo"
  | "cloud-devops"
  | "data-ai"
  | "qa"
  | "ciberseguridad"
  | "gobernanza-ti";

export type AreaLevel = "Bajo" | "Medio" | "Alto" | "Experto";

export interface Course {
  id: string;
  name: string;
  institution: string;
  year: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: number;
  credentialId?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  durationYears: number;
  description?: string;
}

export interface AreaDetail {
  id: AreaId;
  name: string;
  score: number;
  level: AreaLevel;
  globalAverage: number;
  gap: number;
  courses: Course[];
  certifications: Certification[];
  experience: ExperienceItem[];
  tags: string[];
}
