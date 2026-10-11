import { describe, expect, it, vi } from 'vitest';
import { AccessRequestsController } from '../controllers/access-requests.controller.js';
import { toAccessRequestListItem } from '../mappers/access-request-list.mapper.js';
import { AccessRequestsRepository } from '../repositories/access-requests.repository.js';
import { AccessRequestsService } from '../services/access-requests.service.js';

const row = {
  id: 'id-1',
  requestCode: 'SOL-2026-0001',
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'ana@umss.test',
  sisCode: '2018001',
  submittedAt: new Date('2026-10-05T12:00:00.000Z'),
  status: { title: 'pending' },
  documentType: { title: 'academic_diploma' },
};

describe('toAccessRequestListItem', () => {
  it('arma el nombre completo y la fecha ISO sin datos sensibles', () => {
    const item = toAccessRequestListItem(row as never);
    expect(item).toEqual({
      id: 'id-1',
      requestCode: 'SOL-2026-0001',
      fullName: 'Ana Pérez',
      email: 'ana@umss.test',
      sisCode: '2018001',
      documentType: 'academic_diploma',
      submittedAt: '2026-10-05T12:00:00.000Z',
      status: 'pending',
    });
    expect(Object.keys(item)).not.toContain('idCardNumber');
  });

  it('tolera un documento y una fecha ausentes', () => {
    expect(toAccessRequestListItem({ ...row, documentType: null, submittedAt: null } as never)).toMatchObject({
      documentType: null,
      submittedAt: null,
    });
  });
});

describe('AccessRequestsRepository.findPage', () => {
  function build() {
    const accessRequest = { findMany: vi.fn().mockResolvedValue([row]), count: vi.fn().mockResolvedValue(25) };
    return { accessRequest, repository: new AccessRequestsRepository({ accessRequest } as any) };
  }

  it('filtra por el estado indicado, ordena por envío descendente y pagina', async () => {
    const { accessRequest, repository } = build();

    await expect(repository.findPage({ status: 'pending', page: 3, limit: 10 })).resolves.toEqual({ rows: [row], total: 25 });

    const args = accessRequest.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ status: { title: 'pending' } });
    expect(args.orderBy[0]).toEqual({ submittedAt: 'desc' });
    expect(args.skip).toBe(20);
    expect(args.take).toBe(10);
    expect(accessRequest.count).toHaveBeenCalledWith({ where: args.where });
  });

  it('sin estado lista los cuatro posteriores al envío y nunca los borradores', async () => {
    const { accessRequest, repository } = build();

    await repository.findPage({ page: 1, limit: 10 });

    const { where, select } = accessRequest.findMany.mock.calls[0][0];
    expect(where.status.title.in).toEqual(['pending', 'in_review', 'approved', 'rejected']);
    expect(where.status.title.in).not.toContain('draft');
    expect(select.documentFile).toBeUndefined();
    expect(JSON.stringify(select)).not.toContain('content');
  });
});

describe('AccessRequestsService.list y controller', () => {
  it('devuelve { data: { items, total }, page, offset } con el offset calculado', async () => {
    const repository = { findPage: vi.fn().mockResolvedValue({ rows: [row], total: 11 }) };
    const service = new AccessRequestsService(repository as any, {} as any, {} as any);

    const result = await service.list({ page: 2, limit: 10 });

    expect(repository.findPage).toHaveBeenCalledWith({ page: 2, limit: 10 });
    expect(result).toMatchObject({ page: 2, offset: 10, data: { total: 11 } });
    expect(result.data.items).toHaveLength(1);
  });

  it('el controller delega el listado al servicio', async () => {
    const service = { list: vi.fn().mockResolvedValue({ data: { items: [], total: 0 }, page: 1, offset: 0 }) };
    const controller = new AccessRequestsController(service as any);
    const query = { page: 1, limit: 10 };

    await expect(controller.list(query)).resolves.toMatchObject({ page: 1, offset: 0 });
    expect(service.list).toHaveBeenCalledWith(query);
  });
});
