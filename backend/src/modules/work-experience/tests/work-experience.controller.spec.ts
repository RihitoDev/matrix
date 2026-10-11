import type { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { WorkExperienceRepository } from '../repositories/work-experience.repository.js';
import { WorkExperienceModule } from '../work-experience.module.js';

const userId = '11111111-1111-4111-8111-111111111111';
const otherUserId = '22222222-2222-4222-8222-222222222222';
const workExperienceId = '33333333-3333-4333-8333-333333333333';
const body = {
  companyName: ' Synapse Labs ',
  position: ' Junior web developer ',
  startDate: '2024-07-01',
  endDate: '2024-12-31',
  isCurrent: false,
  description: ' Built user interfaces ',
};
const record = {
  id: workExperienceId,
  userId,
  position: 'Junior web developer',
  startDate: new Date('2024-07-01'),
  endDate: new Date('2024-12-31'),
  isCurrent: false,
  description: 'Built user interfaces',
  createdAt: new Date('2025-01-10T10:00:00.000Z'),
  updatedAt: new Date('2025-01-10T10:00:00.000Z'),
  company: {
    id: '44444444-4444-4444-8444-444444444444',
    title: 'Synapse Labs',
  },
};

describe('WorkExperienceController', () => {
  let app: INestApplication;
  let token: string;
  const jwt = new JwtService({ secret: 'work-experience-test-secret' });
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
    repository.create.mockResolvedValue(record);
    repository.findByIdAndUserId.mockResolvedValue(record);
    repository.update.mockResolvedValue(record);
    repository.delete.mockResolvedValue(true);

    const moduleRef = await Test.createTestingModule({
      imports: [WorkExperienceModule],
      providers: [{ provide: APP_FILTER, useClass: DomainExceptionFilter }],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(JwtService)
      .useValue(jwt)
      .overrideProvider(WorkExperienceRepository)
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
      .post('/api/work-experiences')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(201);
    expect(created.body).toMatchObject({
      statusCode: 201,
      ok: true,
      data: {
        id: workExperienceId,
        companyName: 'Synapse Labs',
        startDate: '2024-07-01',
        endDate: '2024-12-31',
        isCurrent: false,
      },
    });
    expect(created.body.data).not.toHaveProperty('userId');
    expect(repository.create).toHaveBeenCalledWith(userId, {
      companyName: 'Synapse Labs',
      position: 'Junior web developer',
      startDate: record.startDate,
      endDate: record.endDate,
      isCurrent: false,
      description: 'Built user interfaces',
    });

    const listed = await request(app.getHttpServer())
      .get('/api/work-experiences')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listed.body.data).toEqual([created.body.data]);
    expect(repository.findManyByUserId).toHaveBeenCalledWith(userId);

    repository.update.mockResolvedValue({ ...record, position: 'Lead' });
    const updated = await request(app.getHttpServer())
      .patch(`/api/work-experiences/${workExperienceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ position: ' Lead ' })
      .expect(200);
    expect(updated.body.data.position).toBe('Lead');
    expect(repository.update).toHaveBeenCalledWith(
      workExperienceId,
      userId,
      { position: 'Lead' },
      { startDate: record.startDate, endDate: record.endDate, isCurrent: false },
    );

    const deleted = await request(app.getHttpServer())
      .delete(`/api/work-experiences/${workExperienceId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(deleted.body).toEqual({
      statusCode: 200,
      data: null,
      detail: 'OK',
      ok: true,
    });
    expect(repository.delete).toHaveBeenCalledWith(workExperienceId, userId);
  });

  it.each(['get', 'post', 'patch', 'delete'] as const)(
    'protects %s requests without a token',
    async (method) => {
      const path =
        method === 'patch' || method === 'delete'
          ? `/api/work-experiences/${workExperienceId}`
          : '/api/work-experiences';
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

  it('uses the token owner even when a different user header is supplied', async () => {
    await request(app.getHttpServer())
      .get('/api/work-experiences')
      .set('Authorization', `Bearer ${token}`)
      .set('x-user-id', otherUserId)
      .expect(200);
    expect(repository.findManyByUserId).toHaveBeenCalledWith(userId);
  });

  it.each([
    { ...body, companyName: ' ' },
    { ...body, startDate: '2024-02-30' },
    { ...body, isCurrent: undefined },
    { ...body, userId: otherUserId },
  ])('rejects invalid creation data before persisting', async (input) => {
    const response = await request(app.getHttpServer())
      .post('/api/work-experiences')
      .set('Authorization', `Bearer ${token}`)
      .send(input)
      .expect(400);
    expect(response.body).toMatchObject({ statusCode: 400, ok: false });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects an empty update', async () => {
    await request(app.getHttpServer())
      .patch(`/api/work-experiences/${workExperienceId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it.each(['patch', 'delete'] as const)(
    'rejects invalid UUIDs on %s',
    async (method) => {
      await request(app.getHttpServer())
        [method]('/api/work-experiences/not-a-uuid')
        .set('Authorization', `Bearer ${token}`)
        .send({ position: 'Lead' })
        .expect(400);
      expect(repository.update).not.toHaveBeenCalled();
      expect(repository.delete).not.toHaveBeenCalled();
    },
  );

  it('returns 404 on attempts to edit or delete another user record', async () => {
    const otherToken = jwt.sign({ sub: otherUserId, roleTag: 'titulado' });
    repository.findByIdAndUserId.mockResolvedValue(null);
    repository.delete.mockResolvedValue(false);

    const response = await request(app.getHttpServer())
      .patch(`/api/work-experiences/${workExperienceId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ position: 'Lead' })
      .expect(404);
    expect(response.body).toEqual({
      statusCode: 404,
      data: null,
      detail: 'Work experience not found',
      ok: false,
    });
    expect(repository.findByIdAndUserId).toHaveBeenCalledWith(
      workExperienceId,
      otherUserId,
    );
    expect(repository.update).not.toHaveBeenCalled();

    await request(app.getHttpServer())
      .delete(`/api/work-experiences/${workExperienceId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(404);
    expect(repository.delete).toHaveBeenCalledWith(
      workExperienceId,
      otherUserId,
    );
  });

  it('rejects an end date earlier than the start date with a business error', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/work-experiences')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...body, endDate: '2024-06-30' })
      .expect(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      detail: 'endDate cannot be earlier than startDate',
      ok: false,
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('documents the four endpoints in Swagger', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().addBearerAuth().build(),
    );

    expect(Object.keys(document.paths['/api/work-experiences'] ?? {})).toEqual(
      expect.arrayContaining(['get', 'post']),
    );
    expect(
      Object.keys(document.paths['/api/work-experiences/{id}'] ?? {}),
    ).toEqual(expect.arrayContaining(['patch', 'delete']));
  });
});