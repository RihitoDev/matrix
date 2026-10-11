export interface WorkExperienceWriteData {
  companyName: string;
  position: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
  description: string | null;
}