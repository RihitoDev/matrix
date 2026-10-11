import type { AccessRequestsRepository } from '../repositories/access-requests.repository.js';

type RequestStatusRow = NonNullable<Awaited<ReturnType<AccessRequestsRepository['findByRequestCode']>>>;

// No incluye C.I., SIS, teléfono ni el contenido del archivo
export function toRequestStatusResponse(row: RequestStatusRow) {
  return {
    requestCode: row.requestCode,
    status: row.status.title,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    rejectionReason: row.rejectionReason,
    document:
      row.documentType && row.documentFile
        ? { type: row.documentType.title, size: row.documentFile.size, mimeType: row.documentFile.mimeType }
        : null,
  };
}
