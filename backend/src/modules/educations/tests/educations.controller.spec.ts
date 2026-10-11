import type { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { EducationsModule } from '../educations.module.js';
import { EducationsRepository } from '../repositories/educations.repository.js';

const userId = '11111111-1111-4111-8111-111111111111';
const otherUserId = '22222222-2222-4222-8222-222222222222';
const educationId = '33333333-3333-4333-8333-333333333333';
const body = {
  institution: ' UMSS ',
  degree: ' Computer Science ',
  startDate: '2020-01-01',
  endDate: '2024-01-01',
  description: ' Research ',
};
const record = {
  id: educationId,
  userId,
  institution: 'UMSS',
  degree: 'Computer Science',
  startDate: new Date('2020-01-01'),
  endDate: new Date('2024-01-01'),
  description: 'Research',
  createdAt: new Date('2024-02-01T10:00:00.000Z'),
  updatedAt: new Date('2024-02-01T10:00:00.000Z'),
};

// Exercises module wiring, JWT authentication, validation, services and HTTP responses.
describe('EducationsController', () => {
  let app: INestApplication;
  let token: string;
  const jwt = new JwtService({ secret: 'education-test-secret' });
  const repository = {
    findManyByUserId: vi.fn(),
    findByIdAndUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    repository.findManyByUserId.mockResolvedValue([record]);
    repository.findByIdAndUserId.mockResolvedValue(record);
    repository.create.mockResolvedValue(record);
    repository.update.mockResolvedValue(record);
    repository.delete.mockResolvedValue(true);

    const moduleRef = await Test.createTestingModule({
      imports: [EducationsModule],
      providers: [{ provide: APP_FILTER, useClass: DomainExceptionFilter }],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(JwtService)
      .useValue(jwt)
      .overrideProvider(EducationsRepository)
      .useValue(repository)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
    token = jwt.sign({ sub: userId, roleTag: 'titulado' });
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates, lists, updates and deletes through the authenticated API', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/educations')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(201);
    expect(created.body).toMatchObject({
      statusCode: 201,
      ok: true,
      detail: 'OK',
      data: {
        id: educationId,
        institution: 'UMSS',
        startDate: '2020-01-01',
        endDate: '2024-01-01',
      },
    });
    expect(created.body.data).not.toHaveProperty('userId');
    expect(repository.create).toHaveBeenCalledWith(userId, {
      institution: 'UMSS',
      degree: 'Computer Science',
      startDate: record.startDate,
      endDate: record.endDate,
      description: 'Research',
    });

    const listed = await request(app.getHttpServer())
      .get('/api/educations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listed.body.data).toEqual([created.body.data]);
    expect(repository.findManyByUserId).toHaveBeenCalledWith(userId);

    repository.update.mockResolvedValue({
      ...record,
      degree: 'Updated degree',
    });
    const updated = await request(app.getHttpServer())
      .patch(`/api/educations/${educationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ degree: ' Updated degree ' })
      .expect(200);
    expect(updated.body.data.degree).toBe('Updated degree');
    expect(repository.update).toHaveBeenCalledWith(educationId, userId, {
      degree: 'Updated degree',
    }, {
      startDate: record.startDate,
      endDate: record.endDate,
    });

    const deleted = await request(app.getHttpServer())
      .delete(`/api/educations/${educationId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(deleted.body).toEqual({
      statusCode: 200,
      data: null,
      detail: 'OK',
      ok: true,
    });
    expect(repository.delete).toHaveBeenCalledWith(educationId, userId);
  });

  it.each(['get', 'post', 'patch', 'delete'] as const)(
    'protects %s requests without a token',
    async (method) => {
      const path =
        method === 'patch' || method === 'delete'
          ? `/api/educations/${educationId}`
          : '/api/educations';
      const response = await request(app.getHttpServer())
        [method](path)
        .set('x-user-id', userId)
        .expect(401);
      expect(response.body.ok).toBe(false);
      expect(repository.findManyByUserId).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
      expect(repository.delete).not.toHaveBeenCalled();
    },
  );

  it('rejects an invalid token', async () => {
    await request(app.getHttpServer())
      .get('/api/educations')
      .set('Authorization', 'Bearer invalid')
      .expect(401);
    expect(repository.findManyByUserId).not.toHaveBeenCalled();
  });

  it('uses the token owner even when a different user header is supplied', async () => {
    await request(app.getHttpServer())
      .get('/api/educations')
      .set('Authorization', `Bearer ${token}`)
      .set('x-user-id', otherUserId)
      .expect(200);
    expect(repository.findManyByUserId).toHaveBeenCalledWith(userId);
  });

  it.each([
    { ...body, institution: ' ' },
    { ...body, degree: '' },
    { ...body, startDate: undefined },
    { ...body, endDate: undefined },
    { ...body, endDate: null },
    { ...body, endDate: '' },
    { ...body, startDate: '2023-02-29' },
    { ...body, endDate: '2019-01-01' },
    { ...body, userId: otherUserId },
  ])('rejects invalid creation data before persisting', async (input) => {
    const response = await request(app.getHttpServer())
      .post('/api/educations')
      .set('Authorization', `Bearer ${token}`)
      .send(input)
      .expect(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      ok: false,
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects an empty update', async () => {
    await request(app.getHttpServer())
      .patch(`/api/educations/${educationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it.each([
    { institution: ' ' }, { degree: '' }, { startDate: null },
    { endDate: null }, { endDate: '' }, { endDate: '2023-02-29' },
    { startDate: '2025-01-01', endDate: '2024-01-01' },
    { userId: otherUserId },
  ])('rejects invalid partial edits without persisting', async (input) => {
    await request(app.getHttpServer())
      .patch(`/api/educations/${educationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(input)
      .expect(400);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it('checks a partial date update against the stored date', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/educations/${educationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ startDate: '2025-01-01' })
      .expect(400);
    expect(response.body.detail).toBe(
      'endDate cannot be earlier than startDate',
    );
    expect(repository.update).not.toHaveBeenCalled();
  });

  it.each(['patch', 'delete'] as const)(
    'rejects invalid UUIDs on %s',
    async (method) => {
      const response = await request(app.getHttpServer())
        [method]('/api/educations/not-a-uuid')
        .set('Authorization', `Bearer ${token}`)
        .send({ degree: 'Updated' })
        .expect(400);
      expect(response.body.ok).toBe(false);
      expect(repository.findByIdAndUserId).not.toHaveBeenCalled();
      expect(repository.delete).not.toHaveBeenCalled();
    },
  );

  it('returns 404 on attempts to edit or delete another user record', async () => {
    const otherToken = jwt.sign({ sub: otherUserId, roleTag: 'titulado' });
    repository.findByIdAndUserId.mockResolvedValue(null);
    repository.delete.mockResolvedValue(false);

    const response = await request(app.getHttpServer())
      .patch(`/api/educations/${educationId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ degree: 'Updated' })
      .expect(404);
    expect(response.body).toEqual({
      statusCode: 404,
      data: null,
      detail: 'Education not found',
      ok: false,
    });
    expect(repository.findByIdAndUserId).toHaveBeenCalledWith(
      educationId,
      otherUserId,
    );
    expect(repository.update).not.toHaveBeenCalled();

    await request(app.getHttpServer())
      .delete(`/api/educations/${educationId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
    expect(repository.delete).toHaveBeenCalledWith(educationId, otherUserId);
  });

  it('documents the four endpoints and request fields in Swagger', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().addBearerAuth().build(),
    );
    expect(document.paths['/api/educations'].get).toBeDefined();
    expect(document.paths['/api/educations'].post).toMatchObject({
      security: [{ bearer: [] }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              required: ['institution', 'degree', 'startDate', 'endDate'],
              properties: { startDate: { type: 'string', format: 'date' } },
            },
          },
        },
      },
    });
    expect(document.paths['/api/educations/{id}'].patch).toBeDefined();
    expect(document.paths['/api/educations/{id}'].patch?.responses?.['409']).toBeDefined();
    expect(document.paths['/api/educations/{id}'].delete).toBeDefined();
  });

  it('returns a standard conflict response when the validated dates changed', async () => {
    repository.update.mockResolvedValue(null);
    const response = await request(app.getHttpServer())
      .patch(`/api/educations/${educationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ startDate: '2023-01-01' })
      .expect(409);
    expect(response.body).toMatchObject({ statusCode: 409, ok: false, data: null });
    expect(repository.update).toHaveBeenCalledTimes(1);
  });

  it('edits a legacy record without requiring or replacing its missing end date', async () => {
    repository.findByIdAndUserId.mockResolvedValue({ ...record, endDate: null });
    repository.update.mockResolvedValue({ ...record, endDate: null, description: 'Updated' });
    const response = await request(app.getHttpServer())
      .patch(`/api/educations/${educationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Updated' })
      .expect(200);
    expect(response.body.data).toMatchObject({ endDate: null, description: 'Updated' });
  });
});
