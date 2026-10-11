import type { AccessRequestsRepository } from '../repositories/access-requests.repository.js';

type ListRow = Awaited<ReturnType<AccessRequestsRepository['findPage']>>['rows'][number];

// Sin C.I., teléfono ni contenido del archivo
export function toAccessRequestListItem(row: ListRow) {
  return {
    id: row.id,
    requestCode: row.requestCode,
    fullName: `${row.firstName} ${row.lastName}`.trim(),
    email: row.email,
    sisCode: row.sisCode,
    documentType: row.documentType?.title ?? null,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    status: row.status.title,
  };
}
