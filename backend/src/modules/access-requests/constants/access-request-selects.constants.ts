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
