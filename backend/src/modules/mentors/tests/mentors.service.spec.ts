import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MentorsRepository } from '../repositories/mentors.repository.js';
import { MentorMapper } from '../mappers/mentor.mapper.js';
import { MentorsService } from '../services/mentors.service.js';
import {
  AlreadyMentorException,
  InvalidOrientationTypesException,
  InvalidTechnicalAreasException,
  MentorNotFoundException,
  MentorRoleNotFoundException,
} from '../exceptions/index.js';

describe('MentorsService', () => {
  const mapper = new MentorMapper();
  const toDirectoryResponseList = vi.spyOn(mapper, 'toDirectoryResponseList');
  const toProfileResponse = vi.spyOn(mapper, 'toProfileResponse');
  const toTechnicalAreasResponse = vi.spyOn(mapper, 'toTechnicalAreasResponse');
  const toOrientationTypesResponse = vi.spyOn(
    mapper,
    'toOrientationTypesResponse',
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const userId = 'user-1';
  const roleId = 'mentor-role-id';
  const data = {
    technicalAreaIds: ['0424f370-00f0-43cf-9b8a-997af81840b9'],
    orientationTypeIds: ['0fa5e6de-63a4-430e-87fb-22f5eb700ecd'],
  };

  it('transforma mentores activos al contrato del directorio', async () => {
    const findActiveMentors = vi.fn().mockResolvedValue([
      {
        id: 'user-1',
        firstName: 'Ana',
        lastName: 'Rojas',
        headline: 'Arquitecta de Software',
        mentorTechnicalAreas: [
          {
            technicalArea: {
              name: 'Backend',
            },
          },
          {
            technicalArea: {
              name: 'Cloud',
            },
          },
        ],
      },
    ]);
    const repository = {
      findActiveMentors,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    const result = await service.findAll();

    expect(toDirectoryResponseList).toHaveBeenCalledWith(
      await findActiveMentors.mock.results[0]?.value,
    );
    expect(result).toBe(toDirectoryResponseList.mock.results[0]?.value);
    expect(findActiveMentors).toHaveBeenCalledTimes(1);
    expect(findActiveMentors).toHaveBeenCalledWith(expect.any(Date));
    expect(result).toEqual([
      {
        id: 'user-1',
        fullName: 'Ana Rojas',
        headline: 'Arquitecta de Software',
        technicalAreas: ['Backend', 'Cloud'],
      },
    ]);
  });

  it('conserva headline como null cuando no esta registrado', async () => {
    const findActiveMentors = vi.fn().mockResolvedValue([
      {
        id: 'user-1',
        firstName: 'Ana',
        lastName: 'Rojas',
        headline: null,
        mentorTechnicalAreas: [],
      },
    ]);
    const repository = {
      findActiveMentors,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    const result = await service.findAll();

    expect(result).toEqual([
      {
        id: 'user-1',
        fullName: 'Ana Rojas',
        headline: null,
        technicalAreas: [],
      },
    ]);
  });

  it('devuelve una lista vacia de areas cuando el mentor no tiene areas tecnicas', async () => {
    const findActiveMentors = vi.fn().mockResolvedValue([
      {
        id: 'user-1',
        firstName: 'Ana',
        lastName: 'Rojas',
        headline: 'Arquitecta de Software',
        mentorTechnicalAreas: [],
      },
    ]);
    const repository = {
      findActiveMentors,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    const result = await service.findAll();

    expect(result[0]?.technicalAreas).toEqual([]);
  });

  it('devuelve una lista vacia cuando no existen mentores activos', async () => {
    const findActiveMentors = vi.fn().mockResolvedValue([]);
    const repository = {
      findActiveMentors,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    const result = await service.findAll();

    expect(result).toEqual([]);
  });

  it('transforma el perfil publico completo de un mentor activo', async () => {
    const startDate = new Date('2020-01-01T00:00:00.000Z');
    const issueDate = new Date('2025-06-15T00:00:00.000Z');
    const findActiveMentorById = vi.fn().mockResolvedValue({
      id: userId,
      firstName: 'Ana',
      lastName: 'Rojas',
      headline: 'Arquitecta de Software',
      aboutMe: 'Mentora de ingeniería de software.',
      isAvailableForMentoring: true,
      photoUrl: new TextEncoder().encode('https://cdn.test/ana.jpg'),
      city: { id: 'city-1', title: 'Cochabamba' },
      educations: [
        {
          id: 'education-1',
          institution: 'UMSS',
          degree: 'Ingeniería de Sistemas',
          startDate,
          endDate: null,
          description: null,
        },
      ],
      workExperiences: [
        {
          id: 'work-1',
          position: 'Tech Lead',
          startDate,
          endDate: null,
          isCurrent: true,
          description: 'Liderazgo técnico',
          company: { id: 'company-1', title: 'Acme' },
        },
      ],
      userSkills: [
        {
          skill: { id: 'skill-1', name: 'TypeScript', isCustom: false },
        },
      ],
      certifications: [
        {
          id: 'certification-1',
          name: 'Cloud Architect',
          issuingOrganization: 'Cloud Org',
          issueDate,
          documentUrl: new TextEncoder().encode('https://cdn.test/cert.pdf'),
        },
      ],
      mentorTechnicalAreas: [
        {
          technicalArea: {
            id: 'area-1',
            name: 'Arquitectura',
            description: 'Diseño de software',
          },
        },
      ],
      mentorOrientationTypes: [
        {
          orientationType: {
            id: 'orientation-1',
            name: 'Orientación técnica',
            description: 'Revisión de decisiones técnicas',
          },
        },
      ],
    });
    const repository = {
      findActiveMentorById,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    const result = await service.findOne(userId);

    expect(toProfileResponse).toHaveBeenCalledWith(
      await findActiveMentorById.mock.results[0]?.value,
    );
    expect(result).toBe(toProfileResponse.mock.results[0]?.value);
    expect(findActiveMentorById).toHaveBeenCalledWith(userId, expect.any(Date));
    expect(result).toEqual({
      id: userId,
      fullName: 'Ana Rojas',
      headline: 'Arquitecta de Software',
      aboutMe: 'Mentora de ingeniería de software.',
      isAvailable: true,
      photoUrl: 'https://cdn.test/ana.jpg',
      city: { id: 'city-1', title: 'Cochabamba' },
      educations: [
        {
          id: 'education-1',
          institution: 'UMSS',
          degree: 'Ingeniería de Sistemas',
          startDate,
          endDate: null,
          description: null,
        },
      ],
      workExperiences: [
        {
          id: 'work-1',
          position: 'Tech Lead',
          startDate,
          endDate: null,
          isCurrent: true,
          description: 'Liderazgo técnico',
          company: { id: 'company-1', title: 'Acme' },
        },
      ],
      skills: [{ id: 'skill-1', name: 'TypeScript', isCustom: false }],
      certifications: [
        {
          id: 'certification-1',
          name: 'Cloud Architect',
          issuingOrganization: 'Cloud Org',
          issueDate,
          documentUrl: 'https://cdn.test/cert.pdf',
        },
      ],
      technicalAreas: [
        {
          id: 'area-1',
          name: 'Arquitectura',
          description: 'Diseño de software',
        },
      ],
      orientationTypes: [
        {
          id: 'orientation-1',
          name: 'Orientación técnica',
          description: 'Revisión de decisiones técnicas',
        },
      ],
    });
  });

  it('responde 404 cuando el usuario no es un mentor activo', async () => {
    const findActiveMentorById = vi.fn().mockResolvedValue(null);
    const repository = {
      findActiveMentorById,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    const result = service.findOne(userId);

    await expect(result).rejects.toBeInstanceOf(MentorNotFoundException);
    await expect(result).rejects.toMatchObject({
      statusCode: 404,
      message: 'El mentor no existe o no está activo',
    });
    expect(toProfileResponse).not.toHaveBeenCalled();
  });

  it('actualiza la disponibilidad de un mentor activo', async () => {
    const findActiveMentorParticipation = vi
      .fn()
      .mockResolvedValue({ id: userId });
    const updateAvailability = vi.fn().mockResolvedValue({
      id: userId,
      isAvailableForMentoring: false,
    });
    const repository = {
      findActiveMentorParticipation,
      updateAvailability,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    const result = await service.updateAvailability(userId, false);

    expect(findActiveMentorParticipation).toHaveBeenCalledWith(
      userId,
      expect.any(Date),
    );
    expect(updateAvailability).toHaveBeenCalledWith(userId, false);
    expect(result).toEqual({
      id: userId,
      isAvailableForMentoring: false,
    });
  });

  it('rechaza actualizar disponibilidad si el usuario no es mentor activo', async () => {
    const updateAvailability = vi.fn();
    const repository = {
      findActiveMentorParticipation: vi.fn().mockResolvedValue(null),
      updateAvailability,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    await expect(
      service.updateAvailability(userId, false),
    ).rejects.toBeInstanceOf(MentorNotFoundException);
    expect(updateAvailability).not.toHaveBeenCalled();
  });

  it('devuelve las areas tecnicas del mentor autenticado activo', async () => {
    const technicalArea = {
      id: 'area-1',
      name: 'Backend',
      description: 'APIs',
    };
    const findActiveMentorParticipation = vi
      .fn()
      .mockResolvedValue({ id: userId });
    const findMentorTechnicalAreas = vi
      .fn()
      .mockResolvedValue([{ technicalArea }]);
    const repository = {
      findActiveMentorParticipation,
      findMentorTechnicalAreas,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    const result = await service.findMyTechnicalAreas(userId);

    expect(findActiveMentorParticipation).toHaveBeenCalledWith(
      userId,
      expect.any(Date),
    );
    expect(findMentorTechnicalAreas).toHaveBeenCalledWith(userId);
    expect(toTechnicalAreasResponse).toHaveBeenCalledWith([{ technicalArea }]);
    expect(result).toBe(toTechnicalAreasResponse.mock.results[0]?.value);
    expect(result).toEqual([technicalArea]);
  });

  it('reemplaza las areas tecnicas con UUID validos', async () => {
    const technicalAreaIds = [
      '0424f370-00f0-43cf-9b8a-997af81840b9',
      '0fa5e6de-63a4-430e-87fb-22f5eb700ecd',
    ];
    const findActiveMentorParticipation = vi
      .fn()
      .mockResolvedValue({ id: userId });
    const findTechnicalAreas = vi
      .fn()
      .mockResolvedValue(technicalAreaIds.map((id) => ({ id })));
    const replaceMentorTechnicalAreas = vi.fn().mockResolvedValue(undefined);
    const repository = {
      findActiveMentorParticipation,
      findTechnicalAreas,
      replaceMentorTechnicalAreas,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    const result = await service.updateMyTechnicalAreas(userId, {
      technicalAreaIds,
    });

    expect(findTechnicalAreas).toHaveBeenCalledWith(technicalAreaIds);
    expect(replaceMentorTechnicalAreas).toHaveBeenCalledWith(
      userId,
      technicalAreaIds,
    );
    expect(result).toEqual({ technicalAreaIds });
  });

  it('rechaza consultas y cambios si el usuario no es mentor activo', async () => {
    const replaceMentorTechnicalAreas = vi.fn();
    const replaceMentorOrientationTypes = vi.fn();
    const repository = {
      findActiveMentorParticipation: vi.fn().mockResolvedValue(null),
      replaceMentorTechnicalAreas,
      replaceMentorOrientationTypes,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    await expect(service.findMyTechnicalAreas(userId)).rejects.toBeInstanceOf(
      MentorNotFoundException,
    );
    await expect(
      service.updateMyTechnicalAreas(userId, {
        technicalAreaIds: ['0424f370-00f0-43cf-9b8a-997af81840b9'],
      }),
    ).rejects.toBeInstanceOf(MentorNotFoundException);
    await expect(service.findMyOrientationTypes(userId)).rejects.toBeInstanceOf(
      MentorNotFoundException,
    );
    await expect(
      service.updateMyOrientationTypes(userId, {
        orientationTypeIds: ['0fa5e6de-63a4-430e-87fb-22f5eb700ecd'],
      }),
    ).rejects.toBeInstanceOf(MentorNotFoundException);
    expect(toTechnicalAreasResponse).not.toHaveBeenCalled();
    expect(toOrientationTypesResponse).not.toHaveBeenCalled();
    expect(replaceMentorTechnicalAreas).not.toHaveBeenCalled();
    expect(replaceMentorOrientationTypes).not.toHaveBeenCalled();
  });

  it('rechaza el cambio si alguna area tecnica no existe', async () => {
    const replaceMentorTechnicalAreas = vi.fn();
    const repository = {
      findActiveMentorParticipation: vi.fn().mockResolvedValue({ id: userId }),
      findTechnicalAreas: vi.fn().mockResolvedValue([]),
      replaceMentorTechnicalAreas,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    await expect(
      service.updateMyTechnicalAreas(userId, {
        technicalAreaIds: ['0424f370-00f0-43cf-9b8a-997af81840b9'],
      }),
    ).rejects.toBeInstanceOf(InvalidTechnicalAreasException);
    expect(replaceMentorTechnicalAreas).not.toHaveBeenCalled();
  });

  it('devuelve los tipos de orientacion del mentor autenticado activo', async () => {
    const orientationType = {
      id: 'orientation-1',
      name: 'Orientación técnica',
      description: 'Decisiones técnicas',
    };
    const findActiveMentorParticipation = vi
      .fn()
      .mockResolvedValue({ id: userId });
    const findMentorOrientationTypes = vi
      .fn()
      .mockResolvedValue([{ orientationType }]);
    const repository = {
      findActiveMentorParticipation,
      findMentorOrientationTypes,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    const result = await service.findMyOrientationTypes(userId);

    expect(findActiveMentorParticipation).toHaveBeenCalledWith(
      userId,
      expect.any(Date),
    );
    expect(findMentorOrientationTypes).toHaveBeenCalledWith(userId);
    expect(toOrientationTypesResponse).toHaveBeenCalledWith([
      { orientationType },
    ]);
    expect(result).toBe(toOrientationTypesResponse.mock.results[0]?.value);
    expect(result).toEqual([orientationType]);
  });

  it('reemplaza los tipos de orientacion con UUID activos', async () => {
    const orientationTypeIds = [
      '0424f370-00f0-43cf-9b8a-997af81840b9',
      '0fa5e6de-63a4-430e-87fb-22f5eb700ecd',
    ];
    const findActiveMentorParticipation = vi
      .fn()
      .mockResolvedValue({ id: userId });
    const findActiveOrientationTypes = vi
      .fn()
      .mockResolvedValue(orientationTypeIds.map((id) => ({ id })));
    const replaceMentorOrientationTypes = vi.fn().mockResolvedValue(undefined);
    const repository = {
      findActiveMentorParticipation,
      findActiveOrientationTypes,
      replaceMentorOrientationTypes,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    const result = await service.updateMyOrientationTypes(userId, {
      orientationTypeIds,
    });

    expect(findActiveOrientationTypes).toHaveBeenCalledWith(orientationTypeIds);
    expect(replaceMentorOrientationTypes).toHaveBeenCalledWith(
      userId,
      orientationTypeIds,
    );
    expect(result).toEqual({ orientationTypeIds });
  });

  it('rechaza el cambio si alguna orientacion no existe o esta inactiva', async () => {
    const replaceMentorOrientationTypes = vi.fn();
    const repository = {
      findActiveMentorParticipation: vi.fn().mockResolvedValue({ id: userId }),
      findActiveOrientationTypes: vi.fn().mockResolvedValue([]),
      replaceMentorOrientationTypes,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    await expect(
      service.updateMyOrientationTypes(userId, {
        orientationTypeIds: ['0424f370-00f0-43cf-9b8a-997af81840b9'],
      }),
    ).rejects.toBeInstanceOf(InvalidOrientationTypesException);
    expect(replaceMentorOrientationTypes).not.toHaveBeenCalled();
  });

  it('valida los catalogos y activa al usuario autenticado', async () => {
    const activationResult = { id: userId };
    const findMentorRole = vi.fn().mockResolvedValue({ id: roleId });
    const findActiveUserRole = vi.fn().mockResolvedValue(null);
    const findTechnicalAreas = vi
      .fn()
      .mockResolvedValue([{ id: data.technicalAreaIds[0] }]);
    const findActiveOrientationTypes = vi
      .fn()
      .mockResolvedValue([{ id: data.orientationTypeIds[0] }]);
    const activate = vi.fn().mockResolvedValue(activationResult);
    const repository = {
      findMentorRole,
      findActiveUserRole,
      findTechnicalAreas,
      findActiveOrientationTypes,
      activate,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    const result = await service.activate(userId, data);

    expect(findMentorRole).toHaveBeenCalledTimes(1);
    expect(findActiveUserRole).toHaveBeenCalledWith(userId, roleId);
    expect(findTechnicalAreas).toHaveBeenCalledWith(data.technicalAreaIds);
    expect(findActiveOrientationTypes).toHaveBeenCalledWith(
      data.orientationTypeIds,
    );
    expect(activate).toHaveBeenCalledWith(
      userId,
      roleId,
      data.technicalAreaIds,
      data.orientationTypeIds,
    );
    expect(result).toBe(activationResult);
  });

  it('rechaza la activacion si no existe el rol mentor', async () => {
    const activate = vi.fn();
    const repository = {
      findMentorRole: vi.fn().mockResolvedValue(null),
      activate,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    await expect(service.activate(userId, data)).rejects.toBeInstanceOf(
      MentorRoleNotFoundException,
    );
    expect(activate).not.toHaveBeenCalled();
  });

  it('rechaza la activacion si el usuario ya es mentor', async () => {
    const activate = vi.fn();
    const repository = {
      findMentorRole: vi.fn().mockResolvedValue({ id: roleId }),
      findActiveUserRole: vi.fn().mockResolvedValue({ id: 'user-role-id' }),
      activate,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    await expect(service.activate(userId, data)).rejects.toBeInstanceOf(
      AlreadyMentorException,
    );
    expect(activate).not.toHaveBeenCalled();
  });

  it('rechaza la activacion si existen areas tecnicas invalidas', async () => {
    const activate = vi.fn();
    const repository = {
      findMentorRole: vi.fn().mockResolvedValue({ id: roleId }),
      findActiveUserRole: vi.fn().mockResolvedValue(null),
      findTechnicalAreas: vi.fn().mockResolvedValue([]),
      activate,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    await expect(service.activate(userId, data)).rejects.toBeInstanceOf(
      InvalidTechnicalAreasException,
    );
    expect(activate).not.toHaveBeenCalled();
  });

  it('rechaza la activacion si existen orientaciones invalidas o inactivas', async () => {
    const activate = vi.fn();
    const repository = {
      findMentorRole: vi.fn().mockResolvedValue({ id: roleId }),
      findActiveUserRole: vi.fn().mockResolvedValue(null),
      findTechnicalAreas: vi
        .fn()
        .mockResolvedValue([{ id: data.technicalAreaIds[0] }]),
      findActiveOrientationTypes: vi.fn().mockResolvedValue([]),
      activate,
    } as unknown as MentorsRepository;
    const service = new MentorsService(repository, mapper);

    await expect(service.activate(userId, data)).rejects.toBeInstanceOf(
      InvalidOrientationTypesException,
    );
    expect(activate).not.toHaveBeenCalled();
  });
});
