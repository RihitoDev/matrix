import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppointmentStatusTitle } from '../enums/appointment-status-title.enum.js';
import { AvailabilityMapper } from '../mappers/availability.mapper.js';
import {
  BlockHasAppointmentException,
  BlockNotFoundException,
  BlockNotOwnedException,
  BlockOverlapException,
} from '../exceptions/index.js';
import { AvailabilityService } from '../services/availability.service.js';
import { MentorNotFoundException } from '../../mentors/exceptions/mentor-not-found.exception.js';
import type { CreateBlockDto } from '../requests/create-block.request.js';

const QUERY = { from: '2026-10-05T04:00:00.000Z', to: '2026-10-12T03:59:59.999Z' };

const UPDATE_PAYLOAD = {
  startAt: new Date('2026-10-10T14:00:00.000Z'),
  endAt: new Date('2026-10-10T14:30:00.000Z'),
};

const block = (id: string, statuses: string[] = [], mentorId = 'mentor-1') => ({
  id,
  mentorId,
  startAt: new Date('2026-10-06T22:00:00.000Z'),
  endAt: new Date('2026-10-06T22:30:00.000Z'),
  seriesId: null,
  repeatUntil: null,
  createdAt: new Date('2026-10-01T12:00:00.000Z'),
  updatedAt: new Date('2026-10-01T12:00:00.000Z'),
  appointments: statuses.map((title) => ({ status: { title } })),
});

describe('AvailabilityService', () => {
  const availabilityRepository = {
    findMentorBlocksInRange: vi.fn(),
    findById: vi.fn(),
    update: vi.fn(),
    findMentorFreeBlocksInRange: vi.fn(),
    create: vi.fn(),
  };
  const mentorId = 'ed9934b9-1a4e-4b8d-bbed-b8772154cba8';
  const payload: CreateBlockDto = {
    startAt: new Date('2026-11-03T22:00:00.000Z'),
    endAt: new Date('2026-11-04T00:00:00.000Z'),
  };
  const savedBlock = {
    id: 'a3f1c2d4-0000-4000-8000-000000000001',
    mentorId,
    startAt: payload.startAt,
    endAt: payload.endAt,
    seriesId: null,
    repeatUntil: null,
    createdAt: new Date('2026-11-01T12:00:00.000Z'),
    updatedAt: new Date('2026-11-01T12:00:00.000Z'),
  };
  const mentorsService = { findOne: vi.fn() };
  let service: AvailabilityService;

  beforeEach(() => {
    vi.clearAllMocks();
    availabilityRepository.findMentorBlocksInRange.mockResolvedValue([]);
    availabilityRepository.create.mockResolvedValue(savedBlock);
    service = new AvailabilityService(
      availabilityRepository as never,
      new AvailabilityMapper(),
      mentorsService as never,
    );
  });

  describe('findMyBlocks', () => {
    it('consulta solo los bloques del mentor en sesión dentro del rango pedido', async () => {
      await service.findMyBlocks('mentor-1', QUERY);

      expect(availabilityRepository.findMentorBlocksInRange).toHaveBeenCalledWith(
        'mentor-1',
        new Date(QUERY.from),
        new Date(QUERY.to),
      );
    });

    it('devuelve los bloques mapeados con su estado', async () => {
      availabilityRepository.findMentorBlocksInRange.mockResolvedValue([
        block('block-1'),
        block('block-2', [AppointmentStatusTitle.PENDING]),
      ]);

      const result = await service.findMyBlocks('mentor-1', QUERY);

      expect(result.map((item) => [item.id, item.state])).toEqual([
        ['block-1', 'free'],
        ['block-2', 'pending'],
      ]);
    });

    it('devuelve una lista vacía si el mentor no tiene bloques en la semana', async () => {
      await expect(service.findMyBlocks('mentor-1', QUERY)).resolves.toEqual([]);
    });
  });

  describe('updateBlock', () => {
    it('responde 404 si el bloque no existe', async () => {
      availabilityRepository.findById.mockResolvedValue(null);

      await expect(service.updateBlock('mentor-1', 'block-1', UPDATE_PAYLOAD)).rejects.toThrow(
        BlockNotFoundException,
      );
      expect(availabilityRepository.update).not.toHaveBeenCalled();
    });

    it('responde 403 y no toca nada si el bloque es de otro mentor', async () => {
      availabilityRepository.findById.mockResolvedValue(block('block-1', [], 'otro-mentor'));

      await expect(service.updateBlock('mentor-1', 'block-1', UPDATE_PAYLOAD)).rejects.toThrow(
        BlockNotOwnedException,
      );
      expect(availabilityRepository.update).not.toHaveBeenCalled();
    });

    it('responde 409 si el bloque tiene una cita pendiente o confirmada', async () => {
      availabilityRepository.findById.mockResolvedValue(block('block-1', [AppointmentStatusTitle.PENDING]));

      await expect(service.updateBlock('mentor-1', 'block-1', UPDATE_PAYLOAD)).rejects.toThrow(
        BlockHasAppointmentException,
      );
      expect(availabilityRepository.update).not.toHaveBeenCalled();
    });

    it('actualiza un bloque propio sin citas y devuelve el bloque mapeado', async () => {
      availabilityRepository.findById.mockResolvedValue(block('block-1'));
      availabilityRepository.update.mockResolvedValue(
        block('block-1', [], 'mentor-1'),
      );

      const result = await service.updateBlock('mentor-1', 'block-1', UPDATE_PAYLOAD);

      expect(availabilityRepository.update).toHaveBeenCalledWith('block-1', {
        startAt: UPDATE_PAYLOAD.startAt,
        endAt: UPDATE_PAYLOAD.endAt,
      });
      expect(result.id).toBe('block-1');
      expect(result.state).toBe('free');
    });

    it('responde 409 si el guardado choca con la constraint de no-solape', async () => {
      availabilityRepository.findById.mockResolvedValue(block('block-1'));
      availabilityRepository.update.mockRejectedValue({ code: '23P01' });

      await expect(service.updateBlock('mentor-1', 'block-1', UPDATE_PAYLOAD)).rejects.toThrow(
        BlockOverlapException,
      );
    });

    it('relanza el error original cuando no es de solapamiento', async () => {
      availabilityRepository.findById.mockResolvedValue(block('block-1'));
      const databaseError = new Error('connection refused');
      availabilityRepository.update.mockRejectedValue(databaseError);

      await expect(service.updateBlock('mentor-1', 'block-1', UPDATE_PAYLOAD)).rejects.toBe(databaseError);
    });
  });

  describe('create', () => {
    it('crea el bloque y lo devuelve libre', async () => {
      const result = await service.create(mentorId, payload);

      expect(result).toEqual({
        id: savedBlock.id,
        mentorId,
        startAt: savedBlock.startAt.toISOString(),
        endAt: savedBlock.endAt.toISOString(),
        state: 'free',
        createdAt: savedBlock.createdAt.toISOString(),
        updatedAt: savedBlock.updatedAt.toISOString(),
      });
    });

    it('pasa al repositorio el mentor y las fechas ya convertidas a Date', async () => {
      await service.create(mentorId, payload);

      expect(availabilityRepository.create).toHaveBeenCalledWith(
        mentorId,
        payload.startAt,
        payload.endAt,
      );
      expect(payload.startAt).toBeInstanceOf(Date);
    });

    it.each([
      ['code', { code: '23P01' }],
      ['meta', { meta: { code: '23P01' } }],
      ['message', { message: 'Query failed: conflicting key 23P01' }],
      // Shape real verificado contra Postgres: ver utils/overlap-error.ts.
      ['driverAdapterError', { code: 'P2039', meta: { driverAdapterError: { cause: { code: '23P01' } } } }],
    ])('lanza BlockOverlapException cuando el 23P01 viene en %s', async (_source, errorShape) => {
      availabilityRepository.create.mockRejectedValue(Object.assign(new Error('db'), errorShape));

      await expect(service.create(mentorId, payload)).rejects.toBeInstanceOf(BlockOverlapException);
    });

    it('responde 409 con el mensaje de la historia de usuario', async () => {
      availabilityRepository.create.mockRejectedValue({ code: '23P01' });

      await expect(service.create(mentorId, payload)).rejects.toMatchObject({
        statusCode: 409,
        message: 'Ya tienes un bloque en ese horario',
      });
    });

    it('relanza el error original cuando no es de solapamiento', async () => {
      const databaseError = new Error('connection refused');
      availabilityRepository.create.mockRejectedValue(databaseError);

      await expect(service.create(mentorId, payload)).rejects.toBe(databaseError);
    });
  });

  describe('remove', () => {
    const repository = { findById: vi.fn(), delete: vi.fn() };
    let removeService: AvailabilityService;

    beforeEach(() => {
      vi.clearAllMocks();
      removeService = new AvailabilityService(
        repository as never,
        new AvailabilityMapper(),
        mentorsService as never,
      );
    });

    it('lanza 404 si el bloque no existe', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(removeService.remove('mentor-1', 'block-x')).rejects.toThrow(BlockNotFoundException);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('lanza 403 si el bloque pertenece a otro mentor', async () => {
      repository.findById.mockResolvedValue(block('block-x'));

      await expect(removeService.remove('otro-mentor', 'block-x')).rejects.toThrow(BlockNotOwnedException);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('lanza 409 si el bloque tiene citas activas', async () => {
      repository.findById.mockResolvedValue(block('block-x', [AppointmentStatusTitle.PENDING]));

      await expect(removeService.remove('mentor-1', 'block-x')).rejects.toThrow(BlockHasAppointmentException);
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('elimina el bloque y devuelve su id', async () => {
      const target = block('block-x');
      repository.findById.mockResolvedValue(target);
      repository.delete.mockResolvedValue(target);

      await expect(removeService.remove('mentor-1', 'block-x')).resolves.toEqual({ id: 'block-x' });
      expect(repository.delete).toHaveBeenCalledWith('block-x');
    });
  });

  describe('findMentorFreeBlocks', () => {
    beforeEach(() => {
      mentorsService.findOne.mockResolvedValue({ id: 'mentor-1' });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('responde 404 sin consultar bloques si el mentor no existe o no está activo', async () => {
      mentorsService.findOne.mockRejectedValue(new MentorNotFoundException());

      await expect(service.findMentorFreeBlocks('mentor-1', QUERY)).rejects.toBeInstanceOf(
        MentorNotFoundException,
      );
      expect(mentorsService.findOne).toHaveBeenCalledWith('mentor-1');
      expect(availabilityRepository.findMentorFreeBlocksInRange).not.toHaveBeenCalled();
    });

    it('consulta desde el inicio del rango cuando todavía no empezó', async () => {
      vi.useFakeTimers({ now: new Date('2026-10-01T12:00:00.000Z') });
      availabilityRepository.findMentorFreeBlocksInRange.mockResolvedValue([]);

      await service.findMentorFreeBlocks('mentor-1', QUERY);

      expect(availabilityRepository.findMentorFreeBlocksInRange).toHaveBeenCalledWith(
        'mentor-1',
        new Date(QUERY.from),
        new Date(QUERY.to),
      );
    });

    it('consulta desde ahora para no devolver bloques pasados', async () => {
      const now = new Date('2026-10-07T15:30:00.000Z');
      vi.useFakeTimers({ now });
      availabilityRepository.findMentorFreeBlocksInRange.mockResolvedValue([]);

      await service.findMentorFreeBlocks('mentor-1', QUERY);

      expect(availabilityRepository.findMentorFreeBlocksInRange).toHaveBeenCalledWith(
        'mentor-1',
        now,
        new Date(QUERY.to),
      );
    });

    it('devuelve una lista vacía sin consultar si todo el rango ya pasó', async () => {
      vi.useFakeTimers({ now: new Date('2026-10-20T12:00:00.000Z') });

      await expect(service.findMentorFreeBlocks('mentor-1', QUERY)).resolves.toEqual([]);
      expect(availabilityRepository.findMentorFreeBlocksInRange).not.toHaveBeenCalled();
    });

    it('devuelve los bloques libres mapeados sin datos de citas', async () => {
      vi.useFakeTimers({ now: new Date('2026-10-01T12:00:00.000Z') });
      availabilityRepository.findMentorFreeBlocksInRange.mockResolvedValue([block('block-1')]);

      const [result] = await service.findMentorFreeBlocks('mentor-1', QUERY);

      expect(result.state).toBe('free');
      expect(result).not.toHaveProperty('appointments');
    });
  });
});
