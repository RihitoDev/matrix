import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ACTIVE_APPOINTMENT_STATUSES } from '../constants/appointment-status.constants.js';
import { BLOCK_WITH_ACTIVE_APPOINTMENTS_INCLUDE } from '../constants/block-query.constants.js';
import { AvailabilityRepository } from '../repositories/availability.repository.js';

describe('AvailabilityRepository', () => {
  const findMany = vi.fn();
  const findUnique = vi.fn();
  const update = vi.fn();
  const deleteBlock = vi.fn();
  const prisma = {
    availabilityBlock: { findMany, findUnique, update, delete: deleteBlock },
  };
  let repository: AvailabilityRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new AvailabilityRepository(prisma as any);
  });

  describe('findMentorBlocksInRange', () => {
    it('busca los bloques del mentor dentro del rango, ordenados e incluyendo solo citas activas', async () => {
      const from = new Date('2026-10-05T04:00:00.000Z');
      const to = new Date('2026-10-12T04:00:00.000Z');
      findMany.mockResolvedValue([]);

      await repository.findMentorBlocksInRange('mentor-1', from, to);

      expect(findMany).toHaveBeenCalledWith({
        where: { mentorId: 'mentor-1', startAt: { gte: from, lt: to } },
        orderBy: { startAt: 'asc' },
        include: BLOCK_WITH_ACTIVE_APPOINTMENTS_INCLUDE,
      });
    });

    it('devuelve lo que entrega Prisma', async () => {
      const rows = [{ id: 'block-1' }];
      findMany.mockResolvedValue(rows);

      await expect(repository.findMentorBlocksInRange('mentor-1', new Date(), new Date())).resolves.toBe(rows);
    });
  });

  describe('findMentorFreeBlocksInRange', () => {
    it('busca solo los bloques sin cita pendiente ni confirmada dentro del rango', async () => {
      const from = new Date('2026-10-05T04:00:00.000Z');
      const to = new Date('2026-10-12T04:00:00.000Z');
      findMany.mockResolvedValue([]);

      await repository.findMentorFreeBlocksInRange('mentor-1', from, to);

      expect(findMany).toHaveBeenCalledWith({
        where: {
          mentorId: 'mentor-1',
          startAt: { gte: from, lt: to },
          appointments: { none: { status: { title: { in: ACTIVE_APPOINTMENT_STATUSES } } } },
        },
        orderBy: { startAt: 'asc' },
        include: BLOCK_WITH_ACTIVE_APPOINTMENTS_INCLUDE,
      });
    });
  });

  describe('findById', () => {
    it('busca por id incluyendo solo citas activas', async () => {
      findUnique.mockResolvedValue(null);

      await repository.findById('block-1');

      expect(findUnique).toHaveBeenCalledWith({
        where: { id: 'block-1' },
        include: BLOCK_WITH_ACTIVE_APPOINTMENTS_INCLUDE,
      });
    });

    it('devuelve null si no existe', async () => {
      findUnique.mockResolvedValue(null);

      await expect(repository.findById('block-1')).resolves.toBeNull();
    });

    it('devuelve el bloque que entrega Prisma', async () => {
      const row = { id: 'block-1' };
      findUnique.mockResolvedValue(row);

      await expect(repository.findById('block-1')).resolves.toBe(row);
    });
  });

  describe('update', () => {
    const data = { startAt: new Date('2026-10-10T14:00:00Z'), endAt: new Date('2026-10-10T14:30:00Z') };

    it('actualiza el bloque incluyendo solo citas activas', async () => {
      const updated = { id: 'block-1', ...data };
      update.mockResolvedValue(updated);

      await expect(repository.update('block-1', data)).resolves.toBe(updated);
      expect(update).toHaveBeenCalledWith({
        where: { id: 'block-1' },
        data,
        include: BLOCK_WITH_ACTIVE_APPOINTMENTS_INCLUDE,
      });
    });

    // La traduccion del error de solape (P2039 / 23P01) vive en el service,
    // igual que en create: el repository solo persiste y deja que el error
    // de Prisma suba tal cual.
    it('relanza cualquier error de Prisma tal cual, sin traducirlo', async () => {
      const dbError = new Error('conflicting key value violates exclusion constraint');
      update.mockRejectedValue(dbError);

      await expect(repository.update('block-1', data)).rejects.toBe(dbError);
    });
  });

  describe('delete', () => {
    it('borra el bloque por id', async () => {
      const row = { id: 'block-1' };
      deleteBlock.mockResolvedValue(row);

      await expect(repository.delete('block-1')).resolves.toBe(row);
      expect(deleteBlock).toHaveBeenCalledWith({ where: { id: 'block-1' } });
    });
  });
});
