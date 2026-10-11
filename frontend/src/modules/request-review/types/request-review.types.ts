export type ReviewStatus = "pending" | "in_review" | "approved" | "rejected";

export interface ReviewListItem {
  id: string;
  requestCode: string | null;
  fullName: string;
  email: string;
  sisCode: string;
  documentType: string | null;
  submittedAt: string | null;
  status: ReviewStatus;
}

export interface ReviewListResult {
  items: ReviewListItem[];
  total: number;
  page: number;
  offset: number;
}

export type ReviewApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

export interface ReviewDocument {
  type: string;
  name: string;
  extension: string;
  mimeType: string;
  size: number;
}

export interface ReviewDetail {
  id: string;
  requestCode: string | null;
  status: ReviewStatus;
  firstName: string;
  lastName: string;
  idCardNumber: string;
  idCardIssuedIn: string;
  sisCode: string;
  email: string;
  phone: string | null;
  birthDate: string;
  graduationYear: number;
  career: string;
  document: ReviewDocument | null;
  history: {
    submittedAt: string | null;
    reviewedAt: string | null;
    reviewedBy: string | null;
    rejectionReason: string | null;
  };
}

export interface ApproveResult {
  id: string;
  status: ReviewStatus;
  activationCodeSent: boolean;
}

export interface RejectResult {
  id: string;
  status: ReviewStatus;
  notificationSent: boolean;
}
