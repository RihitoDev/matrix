import { describe, expect, it, vi } from 'vitest';
import { INTERCEPTORS_METADATA } from '@nestjs/common/constants.js';
import { ResponseInterceptor } from '../../../common/interceptors/index.js';
import { TechnicalAreasController } from '../controllers/technical-areas.controller.js';
import type { TechnicalAreasService } from '../services/technical-areas.service.js';

describe('TechnicalAreasController', () => {
  it('aplica Standard Response a todos sus endpoints', () => {
    expect(
      Reflect.getMetadata(INTERCEPTORS_METADATA, TechnicalAreasController),
    ).toEqual([ResponseInterceptor]);
  });

  it('delega la consulta al servicio y devuelve su resultado', async () => {
    const areas = [{ id: 'area-1', name: 'Backend', description: null }];
    const findAll = vi.fn().mockResolvedValue(areas);
    const service = { findAll } as unknown as TechnicalAreasService;
    const controller = new TechnicalAreasController(service);

    const result = await controller.findAll();

    expect(findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(areas);
  });
});
