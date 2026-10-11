export interface EducationRecord {
  id: string;
  userId: string;
  institution: string;
  degree: string;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
