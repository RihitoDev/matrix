import { describe, expect, it } from 'vitest';
import { EventRegistrationsMapper } from '../mappers/event-registrations.mapper.js';

const entity = {
  id: 'reg-1',
  status: { title: 'Confirmada' },
  event: {
    title: 'Taller de NestJS',
    eventDate: new Date('2026-10-20T00:00:00.000Z'),
    startTime: new Date('1970-01-01T09:00:00Z'),
    endTime: new Date('1970-01-01T12:00:00Z'),
    location: 'Aula 101',
  },
};

describe('EventRegistrationsMapper', () => {
  it('mapea una inscripción a la respuesta de "Mis pases"', () => {
    expect(EventRegistrationsMapper.toMyRegistration(entity)).toEqual({
      id: 'reg-1',
      eventName: 'Taller de NestJS',
      date: new Date('2026-10-20T00:00:00.000Z'),
      startTime: new Date('1970-01-01T09:00:00Z'),
      endTime: new Date('1970-01-01T12:00:00Z'),
      location: 'Aula 101',
      status: 'Confirmada',
    });
  });

  it('mapea una lista y conserva el orden', () => {
    const second = { ...entity, id: 'reg-2' };
    const result = EventRegistrationsMapper.toMyRegistrationList([
      entity,
      second,
    ]);

    expect(result.map((r) => r.id)).toEqual(['reg-1', 'reg-2']);
  });

  it('devuelve un arreglo vacío si no hay inscripciones', () => {
    expect(EventRegistrationsMapper.toMyRegistrationList([])).toEqual([]);
  });
});
