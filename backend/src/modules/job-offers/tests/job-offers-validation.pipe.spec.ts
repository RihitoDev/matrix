import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { JobOffersValidationPipe } from '../job-offers-validation.pipe.js';

describe('JobOffersValidationPipe', () => {
  const pipe = new JobOffersValidationPipe(z.string());

  it('devuelve el valor si es válido', () => {
    expect(pipe.transform('hola')).toBe('hola');
  });

  it('usa "body" como campo cuando el error no tiene ruta', () => {
    expect(() => pipe.transform(123)).toThrow(BadRequestException);

    try {
      pipe.transform(123);
    } catch (error) {
      const response = (error as BadRequestException).getResponse() as {
        detalles: { campo: string }[];
      };
      expect(response.detalles[0]?.campo).toBe('body');
    }
  });
});