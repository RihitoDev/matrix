import { describe, expect, it, vi } from 'vitest';
import { listAccessRequestsQuerySchema } from '../requests/list-access-requests.schema.js';
import { AccessRequestsRepository } from '../repositories/access-requests.repository.js';
import { AccessRequestsService } from '../services/access-requests.service.js';
import { CAREER } from '../types/career.enum.js';

const messagesOf = (input: unknown) => {
  const result = listAccessRequestsQuerySchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
};

describe('listAccessRequestsQuerySchema: filtros de la bandeja', () => {
  it('recorta la búsqueda y acepta una carrera y un período válidos', () => {
    expect(listAccessRequestsQuerySchema.parse({ search: '  Ana  ', career: CAREER.SYSTEMS_ENGINEERING, period: '7d' })).toMatchObject({
      search: 'Ana',
      career: CAREER.SYSTEMS_ENGINEERING,
      period: '7d',
    });
  });

  it('sin período usa "all" para no ocultar solicitudes antiguas', () => {
    expect(listAccessRequestsQuerySchema.parse({}).period).toBe('all');
  });

  it.each(['7d', '30d', 'all'])('acepta el período %s', (period) => {
    expect(listAccessRequestsQuerySchema.parse({ period }).period).toBe(period);
  });

  it('rechaza un período desconocido y una carrera inexistente', () => {
    expect(messagesOf({ period: '1y' })).toContain('period: El período no es válido');
    expect(messagesOf({ career: 'Medicina' })).toContain('career: La carrera no es válida');
  });

  it('una búsqueda o carrera vacía se trata como ausente', () => {
    const parsed = listAccessRequestsQuerySchema.parse({ search: '   ', career: '' });
    expect(parsed.search).toBeUndefined();
    expect(parsed.career).toBeUndefined();
  });

  it('exige al menos 2 caracteres y como máximo 100 en la búsqueda', () => {
    expect(messagesOf({ search: 'a' })).toContain('search: La búsqueda debe tener al menos 2 caracteres');
    expect(messagesOf({ search: 'a'.repeat(101) })).toContain('search: La búsqueda no puede superar 100 caracteres');
    expect(messagesOf({ search: 'ab' })).toEqual([]);
    expect(messagesOf({ search: 'a'.repeat(100) })).toEqual([]);
  });
});

describe('AccessRequestsRepository.findPage: filtros', () => {
  function build() {
    const accessRequest = { findMany: vi.fn().mockResolvedValue([]), count: vi.fn().mockResolvedValue(0) };
    return { accessRequest, repository: new AccessRequestsRepository({ accessRequest } as any) };
  }

  it('sin filtros adicionales el where solo lleva el estado', async () => {
    const { accessRequest, repository } = build();
    await repository.findPage({ page: 1, limit: 10 });
    expect(Object.keys(accessRequest.findMany.mock.calls[0][0].where)).toEqual(['status']);
  });

  it('combina estado, carrera y fecha de envío, y el total usa el mismo where', async () => {
    const { accessRequest, repository } = build();
    const submittedFrom = new Date('2026-10-01T00:00:00.000Z');

    await repository.findPage({ status: 'pending', career: CAREER.INFORMATICS_ENGINEERING, submittedFrom, page: 1, limit: 10 });

    const { where } = accessRequest.findMany.mock.calls[0][0];
    expect(where).toEqual({
      status: { title: 'pending' },
      career: { title: CAREER.INFORMATICS_ENGINEERING },
      submittedAt: { gte: submittedFrom },
    });
    expect(accessRequest.count).toHaveBeenCalledWith({ where });
  });

  it('la búsqueda mira nombre, apellidos, C.I. y SIS sin distinguir mayúsculas', async () => {
    const { accessRequest, repository } = build();

    await repository.findPage({ search: '2019', page: 1, limit: 10 });

    const { AND } = accessRequest.findMany.mock.calls[0][0].where;
    expect(AND).toHaveLength(1);
    expect(AND[0].OR).toEqual([
      { firstName: { contains: '2019', mode: 'insensitive' } },
      { lastName: { contains: '2019', mode: 'insensitive' } },
      { idCardNumber: { contains: '2019', mode: 'insensitive' } },
      { sisCode: { contains: '2019', mode: 'insensitive' } },
    ]);
  });

  it('escapa los comodines % y _ para que se busquen como texto literal', async () => {
    const { accessRequest, repository } = build();

    await repository.findPage({ search: '%_', page: 1, limit: 10 });

    const { AND } = accessRequest.findMany.mock.calls[0][0].where;
    expect(AND[0].OR[0]).toEqual({ firstName: { contains: '\\%\\_', mode: 'insensitive' } });
  });

  it('con varias palabras todas deben aparecer (nombre y apellido juntos) y se limitan a 5', async () => {
    const { accessRequest, repository } = build();

    await repository.findPage({ search: 'ana  maría pérez  a b c d', page: 1, limit: 10 });

    expect(accessRequest.findMany.mock.calls[0][0].where.AND).toHaveLength(5);
  });

  it('nunca selecciona el contenido del documento', async () => {
    const { accessRequest, repository } = build();
    await repository.findPage({ search: 'ana', page: 1, limit: 10 });
    expect(JSON.stringify(accessRequest.findMany.mock.calls[0][0].select)).not.toContain('content');
  });
});

describe('AccessRequestsService.list: período', () => {
  const NOW = new Date('2026-10-08T15:00:00.000Z');
  const build = () => {
    const repository = { findPage: vi.fn().mockResolvedValue({ rows: [], total: 0 }) };
    return { repository, service: new AccessRequestsService(repository as any, {} as any, {} as any, {} as any, {} as any) };
  };

  it.each([
    ['7d', '2026-10-01T15:00:00.000Z'],
    ['30d', '2026-09-08T15:00:00.000Z'],
  ])('el período %s filtra por fecha de envío desde %s', async (period, from) => {
    const { repository, service } = build();
    await service.list({ page: 1, limit: 10, period } as never, NOW);
    expect(repository.findPage.mock.calls[0][0].submittedFrom).toEqual(new Date(from));
  });

  it('"all" no limita por fecha y no pasa el período al repositorio', async () => {
    const { repository, service } = build();
    await service.list({ page: 1, limit: 10, period: 'all', search: 'ana', career: CAREER.SYSTEMS_ENGINEERING } as never, NOW);
    const args = repository.findPage.mock.calls[0][0];
    expect(args.submittedFrom).toBeUndefined();
    expect(args).not.toHaveProperty('period');
    expect(args).toMatchObject({ search: 'ana', career: CAREER.SYSTEMS_ENGINEERING });
  });
});
