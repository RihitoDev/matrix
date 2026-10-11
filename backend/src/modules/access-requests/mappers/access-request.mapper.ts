import type { AccessRequestsRepository } from '../repositories/access-requests.repository.js';

type AccessRequestRow = NonNullable<Awaited<ReturnType<AccessRequestsRepository['findById']>>>;

export function toAccessRequestResponse(row: AccessRequestRow) {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    idCardNumber: row.idCardNumber,
    idCardIssuedIn: row.idCardIssuedIn,
    sisCode: row.sisCode,
    email: row.email,
    phone: row.phone,
    birthDate: row.birthDate.toISOString().slice(0, 10),
    career: row.career.title,
    graduationYear: row.graduationYear,
    status: row.status.title,
    documentFileId: row.documentFileId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
