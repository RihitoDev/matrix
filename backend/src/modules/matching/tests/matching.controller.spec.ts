import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { MatchingController } from '../controllers/matching.controller.js';
import type { MatchingService } from '../services/matching.service.js';

const EXPERIENCE_ID = '5b1f0c3e-8a4d-4f0b-9a52-1d6c7e2a9b10';

describe('MatchingController', () => {
  it('protege el controlador con JwtAuthGuard', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, MatchingController)).toEqual([JwtAuthGuard]);
  });

  it('delega el analisis al servicio con el id de la ruta y el texto del body', async () => {
    const response = { experienceId: EXPERIENCE_ID, skills: [], processingTimeMs: 3 };
    const matchingService = { analyzeExperience: vi.fn().mockResolvedValue(response) };
    const controller = new MatchingController(matchingService as unknown as MatchingService);

    const result = await controller.analyzeExperience(
      { id: EXPERIENCE_ID },
      { text: 'Python y Django' },
    );

    expect(matchingService.analyzeExperience).toHaveBeenCalledWith({
      experienceId: EXPERIENCE_ID,
      text: 'Python y Django',
    });
    expect(result).toEqual(response);
  });

  it('pasa el texto nulo al servicio sin modificarlo', async () => {
    const matchingService = {
      analyzeExperience: vi
        .fn()
        .mockResolvedValue({ experienceId: EXPERIENCE_ID, skills: [], processingTimeMs: 0 }),
    };
    const controller = new MatchingController(matchingService as unknown as MatchingService);

    await controller.analyzeExperience({ id: EXPERIENCE_ID }, { text: null });

    expect(matchingService.analyzeExperience).toHaveBeenCalledWith({
      experienceId: EXPERIENCE_ID,
      text: null,
    });
  });
});
