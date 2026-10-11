import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'node:http';
import request from 'supertest';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.types.js';
import { MentorsController } from '../controllers/mentors.controller.js';
import { MentorsService } from '../services/mentors.service.js';
import { MentorNotFoundException } from '../exceptions/mentor-not-found.exception.js';
import { AlreadyMentorException } from '../exceptions/already-mentor.exception.js';
import { TechnicalAreasController } from '../../technical-areas/controllers/technical-areas.controller.js';
import { TechnicalAreasService } from '../../technical-areas/services/technical-areas.service.js';
import { OrientationTypesController } from '../../orientation-types/controllers/orientation-types.controller.js';
import { OrientationTypesService } from '../../orientation-types/services/orientation-types.service.js';

describe('Mentorship Standard Response HTTP', () => {
  const userId = '0424f370-00f0-43cf-9b8a-997af81840b9';
  const areaId = '11111111-1111-4111-8111-111111111111';
  const orientationId = '22222222-2222-4222-8222-222222222222';
  const areas = [{ id: areaId, name: 'Backend', description: null }];
  const orientations = [
    { id: orientationId, name: 'Orientación profesional', description: null },
  ];
  const directory = [
    { id: userId, fullName: 'Ana Rojas', headline: null, technicalAreas: [] },
  ];
  const profile = { ...directory[0], technicalAreas: areas };
  const technicalPayload = { technicalAreaIds: [areaId] };
  const orientationPayload = { orientationTypeIds: [orientationId] };
  const activationPayload = { ...technicalPayload, ...orientationPayload };
  const mentorsService = {
    findAll: vi.fn().mockResolvedValue(directory),
    findOne: vi.fn().mockResolvedValue(profile),
    activate: vi.fn().mockResolvedValue({ id: userId }),
    findMyTechnicalAreas: vi.fn().mockResolvedValue(areas),
    updateMyTechnicalAreas: vi.fn().mockResolvedValue(technicalPayload),
    findMyOrientationTypes: vi.fn().mockResolvedValue(orientations),
    updateMyOrientationTypes: vi.fn().mockResolvedValue(orientationPayload),
  };

  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        MentorsController,
        TechnicalAreasController,
        OrientationTypesController,
      ],
      providers: [
        { provide: MentorsService, useValue: mentorsService },
        {
          provide: TechnicalAreasService,
          useValue: { findAll: vi.fn().mockResolvedValue(areas) },
        },
        {
          provide: OrientationTypesService,
          useValue: { findAll: vi.fn().mockResolvedValue(orientations) },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest<AuthenticatedRequest>().user = {
            id: userId,
            email: 'mentor@test.com',
            roles: ['mentor'],
          };
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
    server = app.getHttpServer<Server>();
  });

  afterAll(async () => {
    await app?.close();
  });

  it.each([
    { path: '/api/mentors', data: directory },
    { path: `/api/mentors/${userId}`, data: profile },
    { path: '/api/mentors/me/technical-areas', data: areas },
    { path: '/api/mentors/me/orientation-types', data: orientations },
    { path: '/api/technical-areas', data: areas },
    { path: '/api/orientation-types', data: orientations },
  ])('GET $path devuelve el wrapper con HTTP 200', async ({ path, data }) => {
    await request(server).get(path).expect(200).expect({
      statusCode: 200,
      ok: true,
      detail: 'Operación exitosa',
      data,
    });
  });

  it('POST /api/mentors/activate conserva HTTP 201', async () => {
    await request(server)
      .post('/api/mentors/activate')
      .send(activationPayload)
      .expect(201)
      .expect({
        statusCode: 201,
        ok: true,
        detail: 'Operación exitosa',
        data: { id: userId },
      });

    expect(mentorsService.activate).toHaveBeenCalledWith(
      userId,
      activationPayload,
    );
  });

  it.each([
    { path: '/api/mentors/me/technical-areas', data: technicalPayload },
    { path: '/api/mentors/me/orientation-types', data: orientationPayload },
  ])('PATCH $path devuelve el wrapper con HTTP 200', async ({ path, data }) => {
    await request(server).patch(path).send(data).expect(200).expect({
      statusCode: 200,
      ok: true,
      detail: 'Operación exitosa',
      data,
    });
  });

  it('conserva el error de dominio 404 sin envolverlo como exito', async () => {
    const error = new MentorNotFoundException();
    mentorsService.findOne.mockRejectedValueOnce(error);

    await request(server).get(`/api/mentors/${userId}`).expect(404).expect({
      statusCode: 404,
      ok: false,
      detail: error.message,
      data: null,
    });
  });

  it('conserva el conflicto 409 de activacion', async () => {
    const error = new AlreadyMentorException();
    mentorsService.activate.mockRejectedValueOnce(error);

    await request(server)
      .post('/api/mentors/activate')
      .send(activationPayload)
      .expect(409)
      .expect({
        statusCode: 409,
        ok: false,
        detail: error.message,
        data: null,
      });
  });

  it.each([
    {
      method: 'post' as const,
      path: '/api/mentors/activate',
      serviceMethod: 'activate' as const,
    },
    {
      method: 'patch' as const,
      path: '/api/mentors/me/technical-areas',
      serviceMethod: 'updateMyTechnicalAreas' as const,
    },
    {
      method: 'patch' as const,
      path: '/api/mentors/me/orientation-types',
      serviceMethod: 'updateMyOrientationTypes' as const,
    },
  ])(
    'rechaza payloads invalidos en $method $path con el pipe compartido',
    async ({ method, path, serviceMethod }) => {
      const previousCalls = mentorsService[serviceMethod].mock.calls.length;

      await request(server)[method](path).send({}).expect(400);

      expect(mentorsService[serviceMethod]).toHaveBeenCalledTimes(
        previousCalls,
      );
    },
  );

  it('conserva la validacion 400 de UUID invalido', async () => {
    const response = await request(server)
      .get('/api/mentors/invalid')
      .expect(400);

    expect(response.body).toEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Validation failed (uuid v 4 is expected)',
    });
  });
});
