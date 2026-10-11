import { describe, expect, it, vi } from 'vitest';
import { seedAccessRequests } from '../seeds/access-requests.seed.js';
import { ACCESS_REQUEST_DOCUMENT_TYPE, ACCESS_REQUEST_STATUS } from '../types/access-request.enum.js';
import { CAREER } from '../types/career.enum.js';

function buildTx() {
  return {
    accessRequestStatus: { upsert: vi.fn().mockResolvedValue({}) },
    accessRequestDocumentType: { upsert: vi.fn().mockResolvedValue({}) },
    career: { upsert: vi.fn().mockResolvedValue({}) },
  };
}

const upsertArgs = (title: string) => ({ where: { title }, create: { title }, update: {} });

describe('seedAccessRequests', () => {
  it('hace upsert por title de cada estado con los valores del enum', async () => {
    const tx = buildTx();

    await seedAccessRequests(tx as any);

    expect(tx.accessRequestStatus.upsert.mock.calls.map(([args]) => args)).toEqual(
      Object.values(ACCESS_REQUEST_STATUS).map(upsertArgs),
    );
    expect(Object.values(ACCESS_REQUEST_STATUS)).toEqual(['draft', 'pending', 'in_review', 'approved', 'rejected']);
  });

  it('hace upsert por title de cada tipo de documento con los valores del enum', async () => {
    const tx = buildTx();

    await seedAccessRequests(tx as any);

    expect(tx.accessRequestDocumentType.upsert.mock.calls.map(([args]) => args)).toEqual(
      Object.values(ACCESS_REQUEST_DOCUMENT_TYPE).map(upsertArgs),
    );
    expect(Object.values(ACCESS_REQUEST_DOCUMENT_TYPE)).toEqual(['academic_diploma', 'national_title']);
  });

  it('hace upsert por title de cada carrera con los nombres oficiales del enum', async () => {
    const tx = buildTx();

    await seedAccessRequests(tx as any);

    expect(tx.career.upsert.mock.calls.map(([args]) => args)).toEqual(Object.values(CAREER).map(upsertArgs));
    expect(Object.values(CAREER)).toEqual([
      'Licenciatura en Ingeniería de Sistemas',
      'Licenciatura Ingeniería en Informática',
    ]);
  });

  it('es idempotente: update vacío en todos los upsert, así no sobrescribe filas existentes', async () => {
    const tx = buildTx();

    await seedAccessRequests(tx as any);

    for (const mock of [tx.accessRequestStatus.upsert, tx.accessRequestDocumentType.upsert, tx.career.upsert]) {
      for (const [args] of mock.mock.calls) {
        expect(args.update).toEqual({});
        expect(args.create).toEqual({ title: args.where.title });
      }
    }
  });

  it('solo usa upsert: no crea, actualiza ni borra nada más', async () => {
    const tx = buildTx();

    await seedAccessRequests(tx as any);

    expect(Object.keys(tx).sort()).toEqual(['accessRequestDocumentType', 'accessRequestStatus', 'career']);
    for (const model of Object.values(tx)) {
      expect(Object.keys(model)).toEqual(['upsert']);
    }
  });

  it('devuelve la cantidad de filas sembradas por catálogo', async () => {
    const tx = buildTx();

    await expect(seedAccessRequests(tx as any)).resolves.toEqual({ statuses: 5, documentTypes: 2, careers: 2 });
  });

  it('ejecutarlo dos veces repite los mismos upsert sin diferencias', async () => {
    const tx = buildTx();

    await seedAccessRequests(tx as any);
    const firstCalls = tx.accessRequestStatus.upsert.mock.calls.map(([args]) => args);
    await seedAccessRequests(tx as any);

    expect(tx.accessRequestStatus.upsert.mock.calls.slice(firstCalls.length).map(([args]) => args)).toEqual(firstCalls);
  });

  it('propaga el error de la base sin sembrar los catálogos siguientes', async () => {
    const tx = buildTx();
    const boom = new Error('db caída');
    tx.accessRequestStatus.upsert.mockRejectedValueOnce(boom);

    await expect(seedAccessRequests(tx as any)).rejects.toBe(boom);
    expect(tx.accessRequestDocumentType.upsert).not.toHaveBeenCalled();
    expect(tx.career.upsert).not.toHaveBeenCalled();
  });
});
