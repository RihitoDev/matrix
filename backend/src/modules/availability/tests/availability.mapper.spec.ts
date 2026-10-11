import { describe, expect, it } from 'vitest';
import { AppointmentStatusTitle } from '../enums/appointment-status-title.enum.js';
import { AvailabilityMapper } from '../mappers/availability.mapper.js';
import type { AvailabilityBlockWithAppointments } from '../types/availability-block-with-appointments.types.js';

const buildBlock = (statuses: string[] = []): AvailabilityBlockWithAppointments =>
  ({
    id: 'block-1',
    mentorId: 'mentor-1',
    startAt: new Date('2026-10-06T22:00:00.000Z'),
    endAt: new Date('2026-10-06T22:30:00.000Z'),
    seriesId: null,
    repeatUntil: null,
    createdAt: new Date('2026-10-01T12:00:00.000Z'),
    updatedAt: new Date('2026-10-02T12:00:00.000Z'),
    appointments: statuses.map((title) => ({ status: { title } })),
  }) as AvailabilityBlockWithAppointments;

describe('AvailabilityMapper', () => {
  const mapper = new AvailabilityMapper();

  it('arma la respuesta con fechas en ISO UTC', () => {
    expect(mapper.toResponse(buildBlock())).toEqual({
      id: 'block-1',
      mentorId: 'mentor-1',
      startAt: '2026-10-06T22:00:00.000Z',
      endAt: '2026-10-06T22:30:00.000Z',
      state: 'free',
      createdAt: '2026-10-01T12:00:00.000Z',
      updatedAt: '2026-10-02T12:00:00.000Z',
    });
  });

  it('marca como free un bloque sin citas activas', () => {
    expect(mapper.toResponse(buildBlock()).state).toBe('free');
  });

  it('marca como pending un bloque con cita pendiente', () => {
    expect(mapper.toResponse(buildBlock([AppointmentStatusTitle.PENDING])).state).toBe('pending');
  });

  it('marca como confirmed un bloque con cita confirmada', () => {
    expect(mapper.toResponse(buildBlock([AppointmentStatusTitle.CONFIRMED])).state).toBe('confirmed');
  });

  it('prioriza confirmed si el bloque tiene citas pendiente y confirmada', () => {
    const block = buildBlock([AppointmentStatusTitle.PENDING, AppointmentStatusTitle.CONFIRMED]);
    expect(mapper.toResponse(block).state).toBe('confirmed');
  });

  it('mapea una lista manteniendo el orden', () => {
    const second = { ...buildBlock([AppointmentStatusTitle.PENDING]), id: 'block-2' };
    const result = mapper.toResponseList([buildBlock(), second]);
    expect(result.map((block) => [block.id, block.state])).toEqual([
      ['block-1', 'free'],
      ['block-2', 'pending'],
    ]);
  });

  it('arma la respuesta de borrado solo con el id del bloque', () => {
    expect(mapper.toDeletedResponse(buildBlock())).toEqual({ id: 'block-1' });
  });
});
