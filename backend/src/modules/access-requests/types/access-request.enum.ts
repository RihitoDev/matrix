export const ACCESS_REQUEST_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const ACCESS_REQUEST_DOCUMENT_TYPE = {
  ACADEMIC_DIPLOMA: 'academic_diploma',
  NATIONAL_TITLE: 'national_title',
} as const;
