import { beforeEach, describe, expect, it, vi } from 'vitest';
import { INTERCEPTORS_METADATA } from '@nestjs/common/constants.js';
import { ResponseInterceptor } from '../../../common/interceptors/index.js';
import { OrientationTypesController } from '../controllers/orientation-types.controller.js';
import type { OrientationTypesService } from '../services/orientation-types.service.js';

describe('OrientationTypesController', () => {
  it('aplica Standard Response a todos sus endpoints', () => {
    expect(
      Reflect.getMetadata(INTERCEPTORS_METADATA, OrientationTypesController),
    ).toEqual([ResponseInterceptor]);
  });

  const findAll = vi.fn<OrientationTypesService['findAll']>();
  const service = { findAll } as unknown as OrientationTypesService;
  let controller: OrientationTypesController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new OrientationTypesController(service);
  });

  it('delega la consulta sin parámetros y devuelve el resultado del service', async () => {
    const orientationTypes = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Orientación profesional',
        description: 'Apoyo para el desarrollo profesional',
      },
    ];
    findAll.mockResolvedValue(orientationTypes);

    await expect(controller.findAll()).resolves.toBe(orientationTypes);
    expect(findAll).toHaveBeenCalledOnce();
    expect(findAll).toHaveBeenCalledWith();
  });
});
