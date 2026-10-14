import { describe, expect, it, vi } from 'vitest';
import type { Prisma } from '../../../prisma/client.js';
import { seedAccessRequests } from '../seeds/access-requests.seed.js';
import { ACCESS_REQUEST_DOCUMENT_TYPE, ACCESS_REQUEST_STATUS } from '../types/access-request.enum.js';
import { CAREER } from '../types/career.enum.js';

function buildTx() {
  return {
    accessRequestStatus: { createMany: vi.fn().mockResolvedValue({ count: 5 }) },
    accessRequestDocumentType: { createMany: vi.fn().mockResolvedValue({ count: 2 }) },
    career: { createMany: vi.fn().mockResolvedValue({ count: 2 }) },
  };
}

describe('seedAccessRequests', () => {
  it('siembra cada catálogo en una sola consulta sin sobrescribir los registros existentes', async () => {
    const tx = buildTx();
    await expect(seedAccessRequests(tx as unknown as Prisma.TransactionClient)).resolves.toEqual({
      statuses: 5, documentTypes: 2, careers: 2,
    });
    for (const [model, values] of [
      [tx.accessRequestStatus, Object.values(ACCESS_REQUEST_STATUS)],
      [tx.accessRequestDocumentType, Object.values(ACCESS_REQUEST_DOCUMENT_TYPE)],
      [tx.career, Object.values(CAREER)],
    ] as const) {
      expect(model.createMany).toHaveBeenCalledExactlyOnceWith({
        data: values.map((title) => ({ title })), skipDuplicates: true,
      });
    }
  });

  it('mantiene los identificadores existentes cuando se repite el seed', async () => {
    const tx = buildTx();
    const records = new Map([['approved', { id: 'existing-status', title: 'approved' }]]);
    tx.accessRequestStatus.createMany.mockImplementation(async ({ data }: { data: { title: string }[] }) => {
      let count = 0;
      for (const record of data) {
        if (records.has(record.title)) continue;
        records.set(record.title, { id: `new-${record.title}`, ...record });
        count += 1;
      }
      return { count };
    });
    await seedAccessRequests(tx as unknown as Prisma.TransactionClient);
    await seedAccessRequests(tx as unknown as Prisma.TransactionClient);
    expect(records.size).toBe(5);
    expect(records.get('approved')?.id).toBe('existing-status');
  });

  it('propaga errores sin ejecutar los catálogos siguientes', async () => {
    const tx = buildTx();
    const error = new Error('Base no disponible');
    tx.accessRequestStatus.createMany.mockRejectedValueOnce(error);
    await expect(seedAccessRequests(tx as unknown as Prisma.TransactionClient)).rejects.toBe(error);
    expect(tx.accessRequestDocumentType.createMany).not.toHaveBeenCalled();
    expect(tx.career.createMany).not.toHaveBeenCalled();
  });
});
