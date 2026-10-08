import { describe, it, expect, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { JobOffersController } from '../job-offers.controller.js';
import { JobOffersValidationPipe } from '../job-offers-validation.pipe.js';
import { createJobOfferSchema } from '../create-job-offer.schema.js';
import type { JobOffersService } from '../job-offers.service.js';
import type { CreateJobOfferPayload } from '../create-job-offer.schema.js';

describe('JobOffersController', () => {
  it('delega la creación en el servicio con la empresa y el payload', async () => {
    const created = { id: 'j1', mensaje: 'Oferta publicada correctamente' };
    const service = { create: vi.fn().mockResolvedValue(created) };
    const controller = new JobOffersController(
      service as unknown as JobOffersService,
    );
    const payload = { tituloPuesto: 'Dev' } as CreateJobOfferPayload;

    const result = await controller.create('empresa-1', payload);

    expect(service.create).toHaveBeenCalledWith('empresa-1', payload);
    expect(result).toBe(created);
  });
});

describe('JobOffersValidationPipe', () => {
  const pipe = new JobOffersValidationPipe(createJobOfferSchema);

  it('lanza un error con el detalle por campo si el cuerpo es inválido', () => {
    expect(() => pipe.transform({})).toThrow(BadRequestException);

    try {
      pipe.transform({});
    } catch (error) {
      const response = (error as BadRequestException).getResponse() as {
        error: string;
        detalles: { campo: string; mensaje: string }[];
      };
      expect(response.error).toBe('VALIDATION_ERROR');
      expect(response.detalles.length).toBeGreaterThan(0);
      expect(response.detalles[0]).toHaveProperty('campo');
    }
  });
});