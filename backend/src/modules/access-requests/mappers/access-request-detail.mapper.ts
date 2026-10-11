import type { AccessRequestsRepository } from '../repositories/access-requests.repository.js';

type DetailRow = NonNullable<Awaited<ReturnType<AccessRequestsRepository['findDetailById']>>>;

// Datos declarados, estado e historial básico; del archivo solo metadatos, nunca el contenido
export function toAccessRequestDetail(row: DetailRow) {
  return {
    id: row.id,
    requestCode: row.requestCode,
    status: row.status.title,
    firstName: row.firstName,
    lastName: row.lastName,
    idCardNumber: row.idCardNumber,
    idCardIssuedIn: row.idCardIssuedIn,
    sisCode: row.sisCode,
    email: row.email,
    phone: row.phone,
    birthDate: row.birthDate.toISOString().slice(0, 10),
    graduationYear: row.graduationYear,
    career: row.career.title,
    document:
      row.documentType && row.documentFile
        ? {
            type: row.documentType.title,
            name: row.documentFile.name,
            extension: row.documentFile.extension,
            mimeType: row.documentFile.mimeType,
            size: row.documentFile.size,
          }
        : null,
    history: {
      submittedAt: row.submittedAt?.toISOString() ?? null,
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      reviewedBy: row.reviewedBy ? `${row.reviewedBy.firstName} ${row.reviewedBy.lastName}`.trim() : null,
      rejectionReason: row.rejectionReason,
    },
  };
}
