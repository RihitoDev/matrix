export interface CertificationRecord {
  id: string;
  userId: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
