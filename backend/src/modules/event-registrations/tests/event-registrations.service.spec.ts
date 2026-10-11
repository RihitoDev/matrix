import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EventRegistrationsService } from '../services/event-registrations.service.js';
import type { EventRegistrationsRepository } from '../repositories/event-registrations.repository.js';

describe('EventRegistrationsService', () => {
  let service: EventRegistrationsService;
  const findByUserId = vi.fn();

  beforeEach(() => {
    findByUserId.mockReset();
    service = new EventRegistrationsService({
      findByUserId,
    } as unknown as EventRegistrationsRepository);
  });

  it('devuelve las inscripciones del usuario mapeadas', async () => {
    findByUserId.mockResolvedValue([
      {
        id: 'reg-1',
        status: { title: 'Confirmada' },
        event: {
          title: 'Taller de NestJS',
          eventDate: new Date('2026-10-20T00:00:00.000Z'),
          location: 'Aula 101',
        },
      },
    ]);

    const result = await service.findMine('user-1');

    expect(findByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toEqual([
      {
        id: 'reg-1',
        eventName: 'Taller de NestJS',
        date: new Date('2026-10-20T00:00:00.000Z'),
        location: 'Aula 101',
        status: 'Confirmada',
      },
    ]);
  });

  it('devuelve [] si el usuario no tiene inscripciones', async () => {
    findByUserId.mockResolvedValue([]);

    await expect(service.findMine('user-1')).resolves.toEqual([]);
  });
});
