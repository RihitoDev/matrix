import type { Prisma } from '../../../prisma/client.js';

// Nunca se selecciona el archivo adjunto: solo la referencia documentFileId
export const ACCESS_REQUEST_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  idCardNumber: true,
  idCardIssuedIn: true,
  sisCode: true,
  email: true,
  phone: true,
  birthDate: true,
  graduationYear: true,
  documentFileId: true,
  createdAt: true,
  updatedAt: true,
  status: { select: { title: true } },
  career: { select: { title: true } },
  documentType: { select: { title: true } },
} satisfies Prisma.AccessRequestSelect;

// Solo lo que muestra la consulta de estado: nunca content ni datos personales (C.I., SIS, teléfono)
export const REQUEST_STATUS_SELECT = {
  requestCode: true,
  submittedAt: true,
  reviewedAt: true,
  rejectionReason: true,
  status: { select: { title: true } },
  documentType: { select: { title: true } },
  documentFile: { select: { size: true, mimeType: true } },
} satisfies Prisma.AccessRequestSelect;

export const LIST_SELECT = {
  id: true,
  requestCode: true,
  firstName: true,
  lastName: true,
  email: true,
  sisCode: true,
  submittedAt: true,
  status: { select: { title: true } },
  documentType: { select: { title: true } },
} satisfies Prisma.AccessRequestSelect;

// Del archivo solo metadatos, nunca content
export const DETAIL_SELECT = {
  id: true,
  requestCode: true,
  firstName: true,
  lastName: true,
  idCardNumber: true,
  idCardIssuedIn: true,
  sisCode: true,
  email: true,
  phone: true,
  birthDate: true,
  graduationYear: true,
  documentFileId: true,
  submittedAt: true,
  reviewedAt: true,
  rejectionReason: true,
  status: { select: { title: true } },
  career: { select: { title: true } },
  documentType: { select: { title: true } },
  documentFile: { select: { name: true, extension: true, mimeType: true, size: true } },
  reviewedBy: { select: { firstName: true, lastName: true } },
} satisfies Prisma.AccessRequestSelect;
