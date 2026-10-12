import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventRegistrationsRepository } from '../repositories/event-registrations.repository.js';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';

describe('EventRegistrationsRepository', () => {
  const findMany = vi.fn();
  let repository: EventRegistrationsRepository;

  beforeEach(() => {
    findMany.mockReset();
    repository = new EventRegistrationsRepository({
      eventRegistration: { findMany },
    } as unknown as PrismaService);
  });

  it('consulta por userId con el select y orden esperados', async () => {
    findMany.mockResolvedValue([]);

    await repository.findByUserId('user-1');

    expect(findMany).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        cancelledAt: null,
        status: { title: 'Confirmada' },
      },
      select: {
        id: true,
        status: { select: { title: true } },
        event: {
          select: {
            title: true,
            eventDate: true,
            startTime: true,
            endTime: true,
            location: true,
          },
        },
      },
      orderBy: { event: { eventDate: 'asc' } },
    });
  });

  it('devuelve lo que entrega Prisma', async () => {
    const rows = [{ id: 'reg-1' }];
    findMany.mockResolvedValue(rows);

    await expect(repository.findByUserId('user-1')).resolves.toBe(rows);
  });
});
