export interface EducationResponse {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
