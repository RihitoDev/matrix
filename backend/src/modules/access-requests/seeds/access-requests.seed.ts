import type { Prisma } from '../../../prisma/client.js';
import { ACCESS_REQUEST_DOCUMENT_TYPE, ACCESS_REQUEST_STATUS } from '../types/access-request.enum.js';
import { CAREER } from '../types/career.enum.js';
import type { AccessRequestsSeedResult } from '../types/access-requests-seed-result.types.js';

async function seedStatuses(tx: Prisma.TransactionClient): Promise<number> {
  const titles = Object.values(ACCESS_REQUEST_STATUS);
  await tx.accessRequestStatus.createMany({
    data: titles.map((title) => ({ title })),
    skipDuplicates: true,
  });
  return titles.length;
}

async function seedDocumentTypes(tx: Prisma.TransactionClient): Promise<number> {
  const titles = Object.values(ACCESS_REQUEST_DOCUMENT_TYPE);
  await tx.accessRequestDocumentType.createMany({
    data: titles.map((title) => ({ title })),
    skipDuplicates: true,
  });
  return titles.length;
}

async function seedCareers(tx: Prisma.TransactionClient): Promise<number> {
  const titles = Object.values(CAREER);
  await tx.career.createMany({
    data: titles.map((title) => ({ title })),
    skipDuplicates: true,
  });
  return titles.length;
}

export async function seedAccessRequests(tx: Prisma.TransactionClient): Promise<AccessRequestsSeedResult> {
  const statuses = await seedStatuses(tx);
  const documentTypes = await seedDocumentTypes(tx);
  const careers = await seedCareers(tx);

  return { statuses, documentTypes, careers };
}
