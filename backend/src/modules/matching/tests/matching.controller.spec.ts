import { describe, expect, it, vi } from 'vitest';
import { MatchingController } from '../controllers/matching.controller.js';
import type { MatchingService } from '../services/matching.service.js';

const EXPERIENCE_ID = '5b1f0c3e-8a4d-4f0b-9a52-1d6c7e2a9b10';

describe('MatchingController', () => {
  it('delega el analisis al servicio con el id de la ruta y el texto del body', () => {
    const response = { experienceId: EXPERIENCE_ID, skills: [], processingTimeMs: 3 };
    const matchingService = { analyzeExperience: vi.fn().mockReturnValue(response) };
    const controller = new MatchingController(matchingService as unknown as MatchingService);

    const result = controller.analyzeExperience({ id: EXPERIENCE_ID }, { text: 'Python y Django' });

    expect(matchingService.analyzeExperience).toHaveBeenCalledWith({
      experienceId: EXPERIENCE_ID,
      text: 'Python y Django',
    });
    expect(result).toEqual(response);
  });

  it('pasa el texto nulo al servicio sin modificarlo', () => {
    const matchingService = {
      analyzeExperience: vi
        .fn()
        .mockReturnValue({ experienceId: EXPERIENCE_ID, skills: [], processingTimeMs: 0 }),
    };
    const controller = new MatchingController(matchingService as unknown as MatchingService);

    controller.analyzeExperience({ id: EXPERIENCE_ID }, { text: null });

    expect(matchingService.analyzeExperience).toHaveBeenCalledWith({
      experienceId: EXPERIENCE_ID,
      text: null,
    });
  });
});
