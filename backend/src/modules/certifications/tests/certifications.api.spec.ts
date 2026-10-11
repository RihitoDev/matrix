import type { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CertificationsModule } from '../certifications.module.js';
import { CertificationDocumentsRepository } from '../../certification-documents/repositories/certification-documents.repository.js';
import { CertificationsRepository } from '../repositories/certifications.repository.js';

const userId = '11111111-1111-4111-8111-111111111111';
const otherUserId = '22222222-2222-4222-8222-222222222222';
const certificationId = '33333333-3333-4333-8333-333333333333';
const body = {
  name: 'AWS Solutions Architect',
  issuingOrganization: 'Amazon',
  issueDate: '2024-05-10',
};
const record = {
  id: certificationId,
  userId,
  name: 'AWS Solutions Architect',
  issuingOrganization: 'Amazon',
  issueDate: new Date('2024-05-10'),
  createdAt: new Date('2025-01-10T10:00:00.000Z'),
  updatedAt: new Date('2025-01-10T10:00:00.000Z'),
};

describe('Certifications API', () => {
  let app: INestApplication;
  let token: string;
  const jwt = new JwtService({ secret: 'certifications-test-secret' });
  const repository = {
    findManyByUserId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  const documentsRepository = {
    save: vi.fn(),
    read: vi.fn(),
    remove: vi.fn(),
    hasDocument: vi.fn(),
    findIdsWithDocument: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    repository.findManyByUserId.mockResolvedValue([record]);
    repository.findById.mockResolvedValue(record);
    repository.create.mockResolvedValue(record);
    repository.update.mockResolvedValue(record);
    repository.delete.mockResolvedValue(undefined);
    documentsRepository.hasDocument.mockResolvedValue(false);
    documentsRepository.findIdsWithDocument.mockResolvedValue(new Set());

    const moduleRef = await Test.createTestingModule({
      imports: [CertificationsModule],
      providers: [{ provide: APP_FILTER, useClass: DomainExceptionFilter }],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(JwtService)
      .useValue(jwt)
      .overrideProvider(CertificationsRepository)
      .useValue(repository)
      .overrideProvider(CertificationDocumentsRepository)
      .useValue(documentsRepository)
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
      .post('/api/certifications')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(201);
    expect(created.body).toMatchObject({
      statusCode: 201,
      ok: true,
      data: {
        id: certificationId,
        name: 'AWS Solutions Architect',
        issuingOrganization: 'Amazon',
        issueDate: '2024-05-10',
        hasDocument: false,
      },
    });
    expect(created.body.data).not.toHaveProperty('userId');
    expect(repository.create).toHaveBeenCalledWith(userId, {
      ...body,
      issueDate: record.issueDate,
    });

    const listed = await request(app.getHttpServer())
      .get('/api/certifications')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listed.body.data).toEqual([created.body.data]);
    expect(repository.findManyByUserId).toHaveBeenCalledWith(userId);

    repository.update.mockResolvedValue({ ...record, name: 'Updated' });
    const updated = await request(app.getHttpServer())
      .patch(`/api/certifications/${certificationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated' })
      .expect(200);
    expect(updated.body.data.name).toBe('Updated');

    const deleted = await request(app.getHttpServer())
      .delete(`/api/certifications/${certificationId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(deleted.body).toEqual({
      statusCode: 200,
      data: null,
      detail: 'OK',
      ok: true,
    });
    expect(repository.delete).toHaveBeenCalledWith(certificationId);
  });

  it.each(['get', 'post', 'patch', 'delete'] as const)(
    'protects %s requests without a token',
    async (method) => {
      const path =
        method === 'get' || method === 'post'
          ? '/api/certifications'
          : `/api/certifications/${certificationId}`;

      await request(app.getHttpServer())[method](path).expect(401);
      expect(repository.findManyByUserId).not.toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
      expect(repository.delete).not.toHaveBeenCalled();
    },
  );

  it('rejects an invalid token', async () => {
    await request(app.getHttpServer())
      .get('/api/certifications')
      .set('Authorization', 'Bearer not-a-token')
      .expect(401);
  });

  it('returns structured validation errors for an invalid body', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/certifications')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...body, name: '' })
      .expect(400);

    expect(response.body.ok).toBe(false);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('returns 404 when the certification belongs to another user', async () => {
    repository.findById.mockResolvedValue({ ...record, userId: otherUserId });

    await request(app.getHttpServer())
      .patch(`/api/certifications/${certificationId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated' })
      .expect(404);
    await request(app.getHttpServer())
      .delete(`/api/certifications/${certificationId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.delete).not.toHaveBeenCalled();
  });

  it('rejects a malformed certification id', async () => {
    await request(app.getHttpServer())
      .delete('/api/certifications/not-a-uuid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
