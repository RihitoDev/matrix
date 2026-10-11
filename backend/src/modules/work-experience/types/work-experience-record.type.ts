import type { WorkExperienceCompany } from './work-experience-company.type.js';

export interface WorkExperienceRecord {
  id: string;
  userId: string;
  position: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  company: WorkExperienceCompany;
}