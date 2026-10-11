import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../../prisma/client.js';
import { AccessRequestsRepository } from '../repositories/access-requests.repository.js';
import { AccessRequestCatalogMissingException, AccessRequestNotFoundException } from '../exceptions/index.js';

function build() {
  const accessRequest = { findFirst: vi.fn(), update: vi.fn() };
  const prisma = { $transaction: vi.fn((fn: (tx: unknown) => unknown) => fn({ accessRequest })) };
  return { accessRequest, prisma, repository: new AccessRequestsRepository(prisma as any) };
}

const p2025 = (meta?: Record<string, unknown>) =>
  new Prisma.PrismaClientKnownRequestError('no record', { code: 'P2025', clientVersion: 'test', meta });

describe('AccessRequestsRepository (documento de respaldo)', () => {
  it('setDocument conecta archivo y tipo por título solo en borradores y devuelve el archivo anterior', async () => {
    const { accessRequest, repository } = build();
    accessRequest.findFirst.mockResolvedValue({ documentFileId: 'file-old' });
    accessRequest.update.mockResolvedValue({ id: 'id-1' });

    await expect(repository.setDocument('id-1', 'file-new', 'academic_diploma')).resolves.toBe('file-old');

    const draftWhere = { id: 'id-1', status: { title: 'draft' } };
    expect(accessRequest.findFirst).toHaveBeenCalledWith({ where: draftWhere, select: { documentFileId: true } });
    expect(accessRequest.update).toHaveBeenCalledWith({
      where: draftWhere,
      data: {
        documentFile: { connect: { id: 'file-new' } },
        documentType: { connect: { title: 'academic_diploma' } },
      },
      select: { id: true },
    });
  });

  it('setDocument devuelve null si no había archivo anterior', async () => {
    const { accessRequest, repository } = build();
    accessRequest.findFirst.mockResolvedValue({ documentFileId: null });
    accessRequest.update.mockResolvedValue({ id: 'id-1' });

    await expect(repository.setDocument('id-1', 'file-new', 'national_title')).resolves.toBeNull();
  });

  it('clearDocument desconecta archivo y tipo solo en borradores y devuelve el archivo anterior', async () => {
    const { accessRequest, repository } = build();
    accessRequest.findFirst.mockResolvedValue({ documentFileId: 'file-old' });
    accessRequest.update.mockResolvedValue({ id: 'id-1' });

    await expect(repository.clearDocument('id-1')).resolves.toBe('file-old');

    const args = accessRequest.update.mock.calls[0][0];
    expect(args.where).toEqual({ id: 'id-1', status: { title: 'draft' } });
    expect(args.data).toEqual({ documentFile: { disconnect: true }, documentType: { disconnect: true } });
    expect(args.select).toEqual({ id: true });
  });

  it.each(['setDocument', 'clearDocument'] as const)('%s con P2025 sin meta.model lanza 404', async (method) => {
    const { accessRequest, repository } = build();
    accessRequest.findFirst.mockResolvedValue(null);
    accessRequest.update.mockRejectedValue(p2025());

    const call = method === 'setDocument' ? repository.setDocument('id-1', 'f', 'national_title') : repository.clearDocument('id-1');
    await expect(call).rejects.toBeInstanceOf(AccessRequestNotFoundException);
  });

  it('setDocument con P2025 con meta.model lanza catálogo faltante', async () => {
    const { accessRequest, repository } = build();
    accessRequest.findFirst.mockResolvedValue({ documentFileId: null });
    accessRequest.update.mockRejectedValue(p2025({ model: 'AccessRequestDocumentType' }));

    await expect(repository.setDocument('id-1', 'f', 'national_title')).rejects.toBeInstanceOf(AccessRequestCatalogMissingException);
  });

  it('relanza cualquier otro error igual', async () => {
    const { accessRequest, repository } = build();
    const boom = new Error('db caída');
    accessRequest.findFirst.mockRejectedValue(boom);

    await expect(repository.clearDocument('id-1')).rejects.toBe(boom);
  });
});
