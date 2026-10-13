export interface CreateJobOfferData {
  companyId: string;
  modalityId: string;
  contractTypeId: string;
  statusId: string;
  title: string;
  description: string;
  category: string;
  positionsAvailable: number;
  salaryRange: string;
  languages: string;
  locationUrl: string;
  skillIds: string[];
}
