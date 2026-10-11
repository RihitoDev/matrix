import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../../../common/prisma/prisma.service.js';
import { MENTOR_ROLE_NAME } from '../constants/mentor.constants.js';
import { MentorsRepository } from '../repositories/mentors.repository.js';

describe('MentorsRepository', () => {
  it('busca solo el id del rol mentor', async () => {
    const role = { id: 'mentor-role-id' };
    const findUnique = vi.fn().mockResolvedValue(role);
    const prisma = { role: { findUnique } } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    const result = await repository.findMentorRole();

    expect(findUnique).toHaveBeenCalledWith({
      where: {
        name: MENTOR_ROLE_NAME,
      },
      select: {
        id: true,
      },
    });
    expect(result).toBe(role);
  });

  it('busca solo el id de la asignacion activa del rol', async () => {
    const userRole = { id: 'user-role-id' };
    const findFirst = vi.fn().mockResolvedValue(userRole);
    const prisma = { userRole: { findFirst } } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    const result = await repository.findActiveUserRole('user-1', 'role-1');

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        userId: 'user-1',
        roleId: 'role-1',
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
    expect(result).toBe(userRole);
  });

  it('valida la participacion activa del mentor autenticado', async () => {
    const now = new Date('2026-10-05T12:00:00.000Z');
    const mentor = { id: 'user-1' };
    const findFirst = vi.fn().mockResolvedValue(mentor);
    const prisma = { user: { findFirst } } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    const result = await repository.findActiveMentorParticipation(
      mentor.id,
      now,
    );

    expect(findFirst).toHaveBeenCalledWith({
      where: {
        id: mentor.id,
        isActive: true,
        roles: {
          some: {
            deletedAt: null,
            startAt: { lte: now },
            role: { name: MENTOR_ROLE_NAME },
          },
        },
      },
      select: { id: true },
    });
    expect(result).toBe(mentor);
  });

  it('consulta las areas tecnicas asociadas al mentor', async () => {
    const relations = [{ technicalArea: { id: 'area-1' } }];
    const findMany = vi.fn().mockResolvedValue(relations);
    const prisma = {
      mentorTechnicalArea: { findMany },
    } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    const result = await repository.findMentorTechnicalAreas('user-1');

    expect(findMany).toHaveBeenCalledWith({
      where: { mentorId: 'user-1' },
      select: {
        technicalArea: {
          select: { id: true, name: true, description: true },
        },
      },
      orderBy: { technicalArea: { name: 'asc' } },
    });
    expect(result).toBe(relations);
  });

  it('consulta solo orientaciones activas asociadas al mentor', async () => {
    const relations = [{ orientationType: { id: 'orientation-1' } }];
    const findMany = vi.fn().mockResolvedValue(relations);
    const prisma = {
      mentorOrientationType: { findMany },
    } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    const result = await repository.findMentorOrientationTypes('user-1');

    expect(findMany).toHaveBeenCalledWith({
      where: {
        mentorId: 'user-1',
        orientationType: { isActive: true },
      },
      select: {
        orientationType: {
          select: { id: true, name: true, description: true },
        },
      },
      orderBy: { orientationType: { name: 'asc' } },
    });
    expect(result).toBe(relations);
  });

  it('busca solo los ids de las areas tecnicas solicitadas', async () => {
    const areas = [{ id: 'area-1' }];
    const findMany = vi.fn().mockResolvedValue(areas);
    const prisma = {
      technicalArea: { findMany },
    } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    const result = await repository.findTechnicalAreas(['area-1']);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: ['area-1'],
        },
      },
      select: {
        id: true,
      },
    });
    expect(result).toBe(areas);
  });

  it('busca solo los ids de orientaciones activas solicitadas', async () => {
    const orientationTypes = [{ id: 'orientation-1' }];
    const findMany = vi.fn().mockResolvedValue(orientationTypes);
    const prisma = {
      orientationType: { findMany },
    } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    const result = await repository.findActiveOrientationTypes([
      'orientation-1',
    ]);

    expect(findMany).toHaveBeenCalledWith({
      where: {
        id: {
          in: ['orientation-1'],
        },
        isActive: true,
      },
      select: {
        id: true,
      },
    });
    expect(result).toBe(orientationTypes);
  });

  it('consulta solo mentores activos con sus areas tecnicas', async () => {
    const now = new Date('2026-10-04T20:00:00.000Z');
    const mentors = [
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
        ],
      },
    ];
    const findMany = vi.fn().mockResolvedValue(mentors);
    const prisma = { user: { findMany } } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    const result = await repository.findActiveMentors(now);

    expect(findMany).toHaveBeenCalledTimes(1);
    expect(findMany).toHaveBeenCalledWith({
      where: {
        isActive: true,
        roles: {
          some: {
            deletedAt: null,
            startAt: {
              lte: now,
            },
            role: {
              name: MENTOR_ROLE_NAME,
            },
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        headline: true,
        mentorTechnicalAreas: {
          select: {
            technicalArea: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          firstName: 'asc',
        },
        {
          lastName: 'asc',
        },
      ],
    });
    expect(result).toBe(mentors);
  });

  it('consulta el perfil publico por el id real de un mentor activo', async () => {
    const now = new Date('2026-10-05T02:00:00.000Z');
    const mentor = { id: 'user-1' };
    const findFirst = vi.fn().mockResolvedValue(mentor);
    const prisma = { user: { findFirst } } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    const result = await repository.findActiveMentorById('user-1', now);

    expect(findFirst).toHaveBeenCalledTimes(1);
    const query = findFirst.mock.calls[0]?.[0];
    expect(query?.where).toEqual({
      id: 'user-1',
      isActive: true,
      roles: {
        some: {
          deletedAt: null,
          startAt: {
            lte: now,
          },
          role: {
            name: MENTOR_ROLE_NAME,
          },
        },
      },
    });
    expect(Object.keys(query?.select ?? {}).sort()).toEqual(
      [
        'aboutMe',
        'certifications',
        'city',
        'educations',
        'firstName',
        'headline',
        'id',
        'isAvailableForMentoring',
        'lastName',
        'mentorOrientationTypes',
        'mentorTechnicalAreas',
        'photoUrl',
        'userSkills',
        'workExperiences',
      ].sort(),
    );
    expect(query?.select).not.toHaveProperty('email');
    expect(query?.select).not.toHaveProperty('password');
    expect(query?.select).not.toHaveProperty('phone');
    expect(query?.select).not.toHaveProperty('personalEmail');
    expect(query?.select?.mentorOrientationTypes).toMatchObject({
      where: {
        orientationType: {
          isActive: true,
        },
      },
      orderBy: {
        orientationType: {
          name: 'asc',
        },
      },
    });
    expect(result).toBe(mentor);
  });

  it('crea atomicamente el rol y las relaciones del mentor', async () => {
    const createUserRole = vi.fn().mockResolvedValue({ id: 'user-role-id' });
    const createTechnicalAreas = vi.fn().mockResolvedValue({ count: 2 });
    const createOrientationTypes = vi.fn().mockResolvedValue({ count: 2 });
    const updateUser = vi.fn().mockResolvedValue({
      id: 'user-1',
      isAvailableForMentoring: true,
    });
    const transaction = {
      userRole: { create: createUserRole },
      mentorTechnicalArea: { createMany: createTechnicalAreas },
      mentorOrientationType: { createMany: createOrientationTypes },
      user: { update: updateUser },
    };
    const $transaction = vi.fn(async (callback) => callback(transaction));
    const prisma = { $transaction } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    const result = await repository.activate(
      'user-1',
      'role-1',
      ['area-1', 'area-2'],
      ['orientation-1', 'orientation-2'],
    );

    expect($transaction).toHaveBeenCalledTimes(1);
    expect(createUserRole).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        roleId: 'role-1',
        deletedAt: null,
      },
    });
    expect(createTechnicalAreas).toHaveBeenCalledWith({
      data: [
        { mentorId: 'user-1', technicalAreaId: 'area-1' },
        { mentorId: 'user-1', technicalAreaId: 'area-2' },
      ],
    });
    expect(createOrientationTypes).toHaveBeenCalledWith({
      data: [
        { mentorId: 'user-1', orientationTypeId: 'orientation-1' },
        { mentorId: 'user-1', orientationTypeId: 'orientation-2' },
      ],
    });
    expect(updateUser).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
      },
      data: {
        isAvailableForMentoring: true,
      },
    });
    expect(result).toEqual({ id: 'user-1' });
  });

  it('propaga un fallo de escritura y no ejecuta escrituras posteriores', async () => {
    const writeError = new Error('write failed');
    const createUserRole = vi.fn().mockResolvedValue({ id: 'user-role-id' });
    const createTechnicalAreas = vi.fn().mockRejectedValue(writeError);
    const createOrientationTypes = vi.fn();
    const transaction = {
      userRole: { create: createUserRole },
      mentorTechnicalArea: { createMany: createTechnicalAreas },
      mentorOrientationType: { createMany: createOrientationTypes },
    };
    const $transaction = vi.fn(async (callback) => callback(transaction));
    const prisma = { $transaction } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    await expect(
      repository.activate('user-1', 'role-1', ['area-1'], ['orientation-1']),
    ).rejects.toBe(writeError);
    expect($transaction).toHaveBeenCalledTimes(1);
    expect(createUserRole).toHaveBeenCalledTimes(1);
    expect(createTechnicalAreas).toHaveBeenCalledTimes(1);
    expect(createOrientationTypes).not.toHaveBeenCalled();
  });

  it('actualiza la disponibilidad del mentor', async () => {
    const update = vi.fn().mockResolvedValue({
      id: 'user-1',
      isAvailableForMentoring: false,
    });

    const prisma = {
      user: { update },
    } as unknown as PrismaService;

    const repository = new MentorsRepository(prisma);

    const result = await repository.updateAvailability('user-1', false);

    expect(update).toHaveBeenCalledWith({
      where: {
        id: 'user-1',
      },
      data: {
        isAvailableForMentoring: false,
      },
      select: {
        id: true,
        isAvailableForMentoring: true,
      },
    });

    expect(result).toEqual({
      id: 'user-1',
      isAvailableForMentoring: false,
    });
  });

  it('reemplaza atomicamente las areas tecnicas del mentor', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const createMany = vi.fn().mockResolvedValue({ count: 2 });
    const transaction = {
      mentorTechnicalArea: { deleteMany, createMany },
    };
    const $transaction = vi.fn(async (callback) => callback(transaction));
    const prisma = { $transaction } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    await repository.replaceMentorTechnicalAreas('user-1', [
      'area-1',
      'area-2',
    ]);

    expect($transaction).toHaveBeenCalledTimes(1);
    expect(deleteMany).toHaveBeenCalledWith({
      where: { mentorId: 'user-1' },
    });
    expect(createMany).toHaveBeenCalledWith({
      data: [
        { mentorId: 'user-1', technicalAreaId: 'area-1' },
        { mentorId: 'user-1', technicalAreaId: 'area-2' },
      ],
    });
  });

  it('reemplaza atomicamente los tipos de orientacion del mentor', async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const createMany = vi.fn().mockResolvedValue({ count: 2 });
    const transaction = {
      mentorOrientationType: { deleteMany, createMany },
    };
    const $transaction = vi.fn(async (callback) => callback(transaction));
    const prisma = { $transaction } as unknown as PrismaService;
    const repository = new MentorsRepository(prisma);

    await repository.replaceMentorOrientationTypes('user-1', [
      'orientation-1',
      'orientation-2',
    ]);

    expect($transaction).toHaveBeenCalledTimes(1);
    expect(deleteMany).toHaveBeenCalledWith({
      where: { mentorId: 'user-1' },
    });
    expect(createMany).toHaveBeenCalledWith({
      data: [
        { mentorId: 'user-1', orientationTypeId: 'orientation-1' },
        { mentorId: 'user-1', orientationTypeId: 'orientation-2' },
      ],
    });
  });
});
