import { describe, expect, it, vi } from 'vitest';
import { INTERCEPTORS_METADATA } from '@nestjs/common/constants.js';
import { ResponseInterceptor } from '../../../common/interceptors/index.js';
import { MentorsController } from '../controllers/mentors.controller.js';
import type { MentorsService } from '../services/mentors.service.js';

describe('MentorsController', () => {
  it('aplica Standard Response a todos sus endpoints', () => {
    expect(
      Reflect.getMetadata(INTERCEPTORS_METADATA, MentorsController),
    ).toEqual([ResponseInterceptor]);
  });

  it('delega la consulta del directorio al service', async () => {
    const directoryResult = [
      {
        id: 'user-1',
        fullName: 'Ana Rojas',
        headline: 'Arquitecta de Software',
        technicalAreas: ['Backend', 'Cloud'],
      },
    ];
    const findAll = vi.fn().mockResolvedValue(directoryResult);
    const service = { findAll } as unknown as MentorsService;
    const controller = new MentorsController(service);

    const result = await controller.findAll();

    expect(findAll).toHaveBeenCalledTimes(1);
    expect(result).toBe(directoryResult);
  });

  it('delega la consulta del perfil con el id real del usuario', async () => {
    const profileResult = {
      id: '0424f370-00f0-43cf-9b8a-997af81840b9',
      fullName: 'Ana Rojas',
    };
    const findOne = vi.fn().mockResolvedValue(profileResult);
    const service = { findOne } as unknown as MentorsService;
    const controller = new MentorsController(service);

    const result = await controller.findOne(profileResult.id);

    expect(findOne).toHaveBeenCalledWith(profileResult.id);
    expect(result).toBe(profileResult);
  });

  it('consulta las areas tecnicas del usuario autenticado', async () => {
    const areas = [{ id: 'area-1', name: 'Backend', description: null }];
    const findMyTechnicalAreas = vi.fn().mockResolvedValue(areas);
    const service = { findMyTechnicalAreas } as unknown as MentorsService;
    const controller = new MentorsController(service);
    const user = { id: 'user-1', email: 'mentor@test.com', roles: ['mentor'] };

    const result = await controller.findMyTechnicalAreas(user);

    expect(findMyTechnicalAreas).toHaveBeenCalledWith(user.id);
    expect(result).toBe(areas);
  });

  it('actualiza las areas tecnicas del usuario autenticado', async () => {
    const body = { technicalAreaIds: ['area-1'] };
    const updateResult = { technicalAreaIds: body.technicalAreaIds };
    const updateMyTechnicalAreas = vi.fn().mockResolvedValue(updateResult);
    const service = { updateMyTechnicalAreas } as unknown as MentorsService;
    const controller = new MentorsController(service);
    const user = { id: 'user-1', email: 'mentor@test.com', roles: ['mentor'] };

    const result = await controller.updateMyTechnicalAreas(user, body);

    expect(updateMyTechnicalAreas).toHaveBeenCalledWith(user.id, body);
    expect(result).toBe(updateResult);
  });

  it('consulta los tipos de orientacion del usuario autenticado', async () => {
    const orientationTypes = [
      { id: 'orientation-1', name: 'Orientación técnica', description: null },
    ];
    const findMyOrientationTypes = vi.fn().mockResolvedValue(orientationTypes);
    const service = { findMyOrientationTypes } as unknown as MentorsService;
    const controller = new MentorsController(service);
    const user = { id: 'user-1', email: 'mentor@test.com', roles: ['mentor'] };

    const result = await controller.findMyOrientationTypes(user);

    expect(findMyOrientationTypes).toHaveBeenCalledWith(user.id);
    expect(result).toBe(orientationTypes);
  });

  it('actualiza los tipos de orientacion del usuario autenticado', async () => {
    const body = { orientationTypeIds: ['orientation-1'] };
    const updateResult = { orientationTypeIds: body.orientationTypeIds };
    const updateMyOrientationTypes = vi.fn().mockResolvedValue(updateResult);
    const service = { updateMyOrientationTypes } as unknown as MentorsService;
    const controller = new MentorsController(service);
    const user = { id: 'user-1', email: 'mentor@test.com', roles: ['mentor'] };

    const result = await controller.updateMyOrientationTypes(user, body);

    expect(updateMyOrientationTypes).toHaveBeenCalledWith(user.id, body);
    expect(result).toBe(updateResult);
  });

  it('delega la activacion con el id del usuario autenticado', async () => {
    const activationResult = { id: 'user-1' };
    const activate = vi.fn().mockResolvedValue(activationResult);
    const service = { activate } as unknown as MentorsService;
    const controller = new MentorsController(service);
    const user = { id: 'user-1', email: 'mentor@test.com', roles: ['mentor'] };
    const body = {
      technicalAreaIds: ['0424f370-00f0-43cf-9b8a-997af81840b9'],
      orientationTypeIds: ['0fa5e6de-63a4-430e-87fb-22f5eb700ecd'],
    };

    const result = await controller.activate(user, body);

    expect(activate).toHaveBeenCalledTimes(1);
    expect(activate).toHaveBeenCalledWith('user-1', body);
    expect(result).toBe(activationResult);
  });
});
