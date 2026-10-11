export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  hasDocument?: boolean;
  createdAt: string;
  updatedAt: string;
}
