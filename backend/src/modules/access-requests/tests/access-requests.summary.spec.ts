import { describe, expect, it, vi } from 'vitest';
import { AccessRequestsController } from '../controllers/access-requests.controller.js';
import { AccessRequestsRepository } from '../repositories/access-requests.repository.js';
import { AccessRequestsService } from '../services/access-requests.service.js';

describe('AccessRequestsService.getSummary', () => {
  const NOW = new Date('2026-10-08T15:00:00.000Z');

  function build(options: { counts?: Record<string, number>; times?: Array<{ submittedAt: Date | null; reviewedAt: Date | null }> } = {}) {
    const repository = {
      countByStatus: vi.fn(async (status: string, filters: { submittedBefore?: Date; reviewedFrom?: Date } = {}) => {
        const key = `${status}:${filters.submittedBefore ? 'old' : filters.reviewedFrom ? filters.reviewedFrom.toISOString() : 'all'}`;
        return options.counts?.[key] ?? 0;
      }),
      findReviewTimes: vi.fn().mockResolvedValue(options.times ?? []),
    };
    return { repository, service: new AccessRequestsService(repository as any, {} as any, {} as any, {} as any, {} as any) };
  }

  it('sin datos: ceros, tiempo medio nulo y motivo principal nulo', async () => {
    const { service } = build();
    await expect(service.getSummary(NOW)).resolves.toEqual({
      pendingCount: 0,
      pendingOver24hCount: 0,
      decidedTodayCount: 0,
      approvedTodayCount: 0,
      rejectedTodayCount: 0,
      averageReviewHours: null,
      reviewTimeGoalHours: 48,
      rejectedThisMonthCount: 0,
      topRejectionReason: null,
    });
  });

  it('calcula cada conteo con sus límites en hora de Bolivia', async () => {
    const today = '2026-10-08T04:00:00.000Z';
    const month = '2026-10-01T04:00:00.000Z';
    const { repository, service } = build({
      counts: { 'pending:all': 18, 'pending:old': 5, [`approved:${today}`]: 6, [`rejected:${today}`]: 1, [`rejected:${month}`]: 5 },
    });

    const summary = await service.getSummary(NOW);

    expect(summary).toMatchObject({
      pendingCount: 18,
      pendingOver24hCount: 5,
      decidedTodayCount: 7,
      approvedTodayCount: 6,
      rejectedTodayCount: 1,
      rejectedThisMonthCount: 5,
    });
    expect(repository.countByStatus).toHaveBeenCalledWith('pending', { submittedBefore: new Date('2026-10-07T15:00:00.000Z') });
    expect(repository.findReviewTimes).toHaveBeenCalledWith(new Date('2026-09-08T15:00:00.000Z'));
  });

  it('cambio de día: a las 02:00 UTC "hoy" sigue siendo el día anterior de Bolivia', async () => {
    const { repository, service } = build();
    await service.getSummary(new Date('2026-10-08T02:00:00.000Z'));
    expect(repository.countByStatus).toHaveBeenCalledWith('approved', { reviewedFrom: new Date('2026-10-07T04:00:00.000Z') });
  });

  it('mes anterior: el 1 de noviembre a las 02:00 UTC las rechazadas del mes cuentan desde el 1 de octubre', async () => {
    const { repository, service } = build();
    await service.getSummary(new Date('2026-11-01T02:00:00.000Z'));
    expect(repository.countByStatus).toHaveBeenCalledWith('rejected', { reviewedFrom: new Date('2026-10-01T04:00:00.000Z') });
  });

  it.each([
    ['justo antes de la medianoche de Bolivia', '2026-10-08T03:59:59.999Z', '2026-10-07T04:00:00.000Z', '2026-10-01T04:00:00.000Z'],
    ['justo en la medianoche de Bolivia', '2026-10-08T04:00:00.000Z', '2026-10-08T04:00:00.000Z', '2026-10-01T04:00:00.000Z'],
    ['el primer instante del mes en Bolivia', '2026-11-01T04:00:00.000Z', '2026-11-01T04:00:00.000Z', '2026-11-01T04:00:00.000Z'],
    ['un minuto antes del primer instante del mes', '2026-11-01T03:59:00.000Z', '2026-10-31T04:00:00.000Z', '2026-10-01T04:00:00.000Z'],
    ['el cambio de año en Bolivia', '2027-01-01T03:00:00.000Z', '2026-12-31T04:00:00.000Z', '2026-12-01T04:00:00.000Z'],
  ])('límites de hoy y del mes %s', async (_name, nowIso, today, month) => {
    const { repository, service } = build();

    await service.getSummary(new Date(nowIso));

    expect(repository.countByStatus).toHaveBeenCalledWith('approved', { reviewedFrom: new Date(today) });
    expect(repository.countByStatus).toHaveBeenCalledWith('rejected', { reviewedFrom: new Date(month) });
  });

  it('el tiempo medio promedia (dictamen menos envío) en horas y redondea a entero', async () => {
    const { service } = build({
      times: [
        { submittedAt: new Date('2026-10-05T00:00:00.000Z'), reviewedAt: new Date('2026-10-05T10:00:00.000Z') },
        { submittedAt: new Date('2026-10-06T00:00:00.000Z'), reviewedAt: new Date('2026-10-07T07:00:00.000Z') },
      ],
    });
    await expect(service.getSummary(NOW)).resolves.toMatchObject({ averageReviewHours: 21 });
  });

  it('ignora filas sin alguna de las dos fechas', async () => {
    const { service } = build({
      times: [
        { submittedAt: null, reviewedAt: new Date('2026-10-05T10:00:00.000Z') },
        { submittedAt: new Date('2026-10-05T00:00:00.000Z'), reviewedAt: null },
      ],
    });
    await expect(service.getSummary(NOW)).resolves.toMatchObject({ averageReviewHours: null });
  });
});

describe('AccessRequestsRepository: resumen', () => {
  function build() {
    const accessRequest = { count: vi.fn().mockResolvedValue(3), findMany: vi.fn().mockResolvedValue([]) };
    return { accessRequest, repository: new AccessRequestsRepository({ accessRequest } as any) };
  }

  it('countByStatus filtra por estado y, si se pide, por envío anterior o dictamen desde una fecha', async () => {
    const { accessRequest, repository } = build();
    const date = new Date('2026-10-08T04:00:00.000Z');

    await repository.countByStatus('pending');
    await repository.countByStatus('pending', { submittedBefore: date });
    await repository.countByStatus('rejected', { reviewedFrom: date });

    expect(accessRequest.count.mock.calls.map((call) => call[0].where)).toEqual([
      { status: { title: 'pending' } },
      { status: { title: 'pending' }, submittedAt: { lt: date } },
      { status: { title: 'rejected' }, reviewedAt: { gte: date } },
    ]);
  });

  it('findReviewTimes solo pide las dos fechas de las aprobadas y rechazadas desde la fecha dada', async () => {
    const { accessRequest, repository } = build();
    const since = new Date('2026-09-08T15:00:00.000Z');

    await repository.findReviewTimes(since);

    expect(accessRequest.findMany).toHaveBeenCalledWith({
      where: { status: { title: { in: ['approved', 'rejected'] } }, reviewedAt: { gte: since }, submittedAt: { not: null } },
      select: { submittedAt: true, reviewedAt: true },
    });
  });
});

describe('AccessRequestsController.getSummary', () => {
  it('delega el resumen al servicio', async () => {
    const service = { getSummary: vi.fn().mockResolvedValue({ pendingCount: 1 }) };
    await expect(new AccessRequestsController(service as any).getSummary()).resolves.toEqual({ pendingCount: 1 });
  });
});
