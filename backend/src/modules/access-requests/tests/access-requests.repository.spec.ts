import { describe, expect, it, vi } from 'vitest';
import { Prisma } from '../../../prisma/client.js';
import { AccessRequestsRepository } from '../repositories/access-requests.repository.js';
import { AccessRequestCatalogMissingException, AccessRequestNotFoundException } from '../exceptions/index.js';

const dto = {
  firstName: 'Ana',
  lastName: 'Rojas',
  idCardNumber: '123',
  idCardIssuedIn: 'LP' as const,
  sisCode: '456',
  email: 'ana@umss.edu.bo',
  birthDate: new Date('2000-05-10T00:00:00Z'),
  career: 'Licenciatura en Ingeniería de Sistemas' as const,
  graduationYear: 2019,
};

function build() {
  const accessRequest = { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), update: vi.fn(), delete: vi.fn() };
  return { accessRequest, repository: new AccessRequestsRepository({ accessRequest } as any) };
}

describe('AccessRequestsRepository', () => {
  it('crea el borrador conectando el estado por título', async () => {
    const { accessRequest, repository } = build();
    accessRequest.create.mockResolvedValue({ id: 'id-1' });

    await repository.createDraft(dto);

    const args = accessRequest.create.mock.calls[0][0];
    expect(args.data.status).toEqual({ connect: { title: 'draft' } });
    expect(args.data.career).toEqual({ connect: { title: 'Licenciatura en Ingeniería de Sistemas' } });
    expect(args.data.graduationYear).toBe(2019);
    expect(args.select).not.toHaveProperty('documentFile');
    expect(args.select.career).toEqual({ select: { title: true } });
  });

  it('createDraft con P2025 lanza catálogo faltante (carrera o estado sin sembrar)', async () => {
    const { accessRequest, repository } = build();
    accessRequest.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('no record', { code: 'P2025', clientVersion: 'test' }));

    await expect(repository.createDraft(dto)).rejects.toBeInstanceOf(AccessRequestCatalogMissingException);
  });

  it('createDraft relanza cualquier otro error igual', async () => {
    const { accessRequest, repository } = build();
    const boom = new Error('db caída');
    accessRequest.create.mockRejectedValue(boom);

    await expect(repository.createDraft(dto)).rejects.toBe(boom);
  });

  it('busca por id', async () => {
    const { accessRequest, repository } = build();
    accessRequest.findUnique.mockResolvedValue(null);

    await expect(repository.findById('id-1')).resolves.toBeNull();
    expect(accessRequest.findUnique.mock.calls[0][0].where).toEqual({ id: 'id-1' });
  });

  it('busca duplicados solo en solicitudes pendientes, en revisión o aprobadas', async () => {
    const { accessRequest, repository } = build();
    accessRequest.findMany.mockResolvedValue([]);

    await repository.findActiveDuplicates({ email: 'ana@umss.edu.bo', idCardNumber: '123', sisCode: '456' });

    const args = accessRequest.findMany.mock.calls[0][0];
    expect(args.where.OR).toEqual([
      { email: { equals: 'ana@umss.edu.bo', mode: 'insensitive' } },
      { idCardNumber: '123' },
      { sisCode: '456' },
    ]);
    expect(args.where.status).toEqual({ title: { in: ['pending', 'in_review', 'approved'] } });
    expect(args.where).not.toHaveProperty('id');
    expect(args.select).toEqual({ email: true, idCardNumber: true, sisCode: true });
  });

  it('busca duplicados solo de los campos enviados y excluye el propio id', async () => {
    const { accessRequest, repository } = build();
    accessRequest.findMany.mockResolvedValue([]);

    await repository.findActiveDuplicates({ sisCode: '456', excludeId: 'id-1' });

    const args = accessRequest.findMany.mock.calls[0][0];
    expect(args.where.OR).toEqual([{ sisCode: '456' }]);
    expect(args.where.id).toEqual({ not: 'id-1' });
  });

  it('actualiza solo mientras el estado sea draft', async () => {
    const { accessRequest, repository } = build();
    accessRequest.update.mockResolvedValue({ id: 'id-1' });

    await repository.updateDraft('id-1', { phone: '71234567' });

    expect(accessRequest.update.mock.calls[0][0].where).toEqual({ id: 'id-1', status: { title: 'draft' } });
  });

  it('actualiza la carrera conectándola por título', async () => {
    const { accessRequest, repository } = build();
    accessRequest.update.mockResolvedValue({ id: 'id-1' });

    await repository.updateDraft('id-1', { career: 'Licenciatura Ingeniería en Informática', phone: '71234567' });

    expect(accessRequest.update.mock.calls[0][0].data).toEqual({
      phone: '71234567',
      career: { connect: { title: 'Licenciatura Ingeniería en Informática' } },
    });
  });

  it('no incluye la clave career si no viene en el PATCH', async () => {
    const { accessRequest, repository } = build();
    accessRequest.update.mockResolvedValue({ id: 'id-1' });

    await repository.updateDraft('id-1', { phone: '71234567' });

    expect(accessRequest.update.mock.calls[0][0].data).toEqual({ phone: '71234567' });
    expect(accessRequest.update.mock.calls[0][0].data).not.toHaveProperty('career');
  });

  it('updateDraft con P2025 y meta.model lanza catálogo faltante', async () => {
    const { accessRequest, repository } = build();
    accessRequest.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('no record', { code: 'P2025', clientVersion: 'test', meta: { model: 'Career' } }),
    );

    await expect(repository.updateDraft('id-1', { career: 'Licenciatura en Ingeniería de Sistemas' })).rejects.toBeInstanceOf(
      AccessRequestCatalogMissingException,
    );
  });

  it('updateDraft con P2025 y meta sin model sigue siendo 404 de dominio', async () => {
    const { accessRequest, repository } = build();
    accessRequest.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('no record', { code: 'P2025', clientVersion: 'test', meta: { operation: 'update' } }),
    );

    await expect(repository.updateDraft('id-1', { phone: '71234567' })).rejects.toBeInstanceOf(AccessRequestNotFoundException);
  });

  it('convierte P2025 en 404 de dominio', async () => {
    const { accessRequest, repository } = build();
    accessRequest.update.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('no record', { code: 'P2025', clientVersion: 'test' }));

    await expect(repository.updateDraft('id-1', { phone: '71234567' })).rejects.toBeInstanceOf(AccessRequestNotFoundException);
  });

  it('propaga cualquier otro error', async () => {
    const { accessRequest, repository } = build();
    const boom = new Error('db caída');
    accessRequest.update.mockRejectedValue(boom);

    await expect(repository.updateDraft('id-1', { phone: '71234567' })).rejects.toBe(boom);
  });

  it('elimina solo mientras el estado sea draft', async () => {
    const { accessRequest, repository } = build();
    accessRequest.delete.mockResolvedValue({ id: 'id-1' });

    await expect(repository.deleteDraft('id-1')).resolves.toBeUndefined();

    expect(accessRequest.delete.mock.calls[0][0].where).toEqual({ id: 'id-1', status: { title: 'draft' } });
  });

  it('convierte P2025 al eliminar en 404 de dominio', async () => {
    const { accessRequest, repository } = build();
    accessRequest.delete.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('no record', { code: 'P2025', clientVersion: 'test' }));

    await expect(repository.deleteDraft('id-1')).rejects.toBeInstanceOf(AccessRequestNotFoundException);
  });

  it('propaga cualquier otro error al eliminar', async () => {
    const { accessRequest, repository } = build();
    const boom = new Error('db caída');
    accessRequest.delete.mockRejectedValue(boom);

    await expect(repository.deleteDraft('id-1')).rejects.toBe(boom);
  });
});
