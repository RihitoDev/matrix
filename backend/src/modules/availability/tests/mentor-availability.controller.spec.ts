import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { ROLES_KEY } from '../../../common/constants/roles.constants.js';
import { MentorAvailabilityController } from '../controllers/mentor-availability.controller.js';

const MENTOR_ID = '6f1c2b8e-3d4a-4f5b-9c6d-7e8f9a0b1c2d';
const QUERY = { from: '2026-10-05T04:00:00.000Z', to: '2026-10-12T03:59:59.999Z' };

describe('MentorAvailabilityController', () => {
  it('delega al servicio con el id del mentor de la ruta y el rango recibido', async () => {
    const blocks = [{ id: 'block-1', state: 'free' }];
    const availabilityService = { findMentorFreeBlocks: vi.fn().mockResolvedValue(blocks) };
    const controller = new MentorAvailabilityController(availabilityService as any);

    const result = await controller.findMentorFreeBlocks({ id: MENTOR_ID }, QUERY);

    expect(availabilityService.findMentorFreeBlocks).toHaveBeenCalledWith(MENTOR_ID, QUERY);
    expect(result).toBe(blocks);
  });

  it('exige el rol titulado en findMentorFreeBlocks', () => {
    const handler = Object.getOwnPropertyDescriptor(
      MentorAvailabilityController.prototype,
      'findMentorFreeBlocks',
    )?.value;
    const roles = new Reflector().get<string[]>(ROLES_KEY, handler);
    expect(roles).toEqual(['titulado']);
  });
});
