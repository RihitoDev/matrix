import type { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CORRUPTED_FILE_ERROR_CODE } from '../../../common/constants/file-error-codes.constants.js';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CertificationDocumentsModule } from '../certification-documents.module.js';
import { CertificationDocumentsRepository } from '../repositories/certification-documents.repository.js';
import { CertificationsRepository } from '../../certifications/repositories/certifications.repository.js';

const userId = '11111111-1111-4111-8111-111111111111';
const otherUserId = '22222222-2222-4222-8222-222222222222';
const certificationId = '33333333-3333-4333-8333-333333333333';
const documentPath = `/api/certifications/${certificationId}/document`;
const pdfBytes = Buffer.from("%PDF-1.4\n" + " ".repeat(50) + "\n%%EOF\n");
const record = {
  id: certificationId,
  userId,
  name: 'AWS Solutions Architect',
  issuingOrganization: 'Amazon',
  issueDate: new Date('2024-05-10'),
  createdAt: new Date('2025-01-10T10:00:00.000Z'),
  updatedAt: new Date('2025-01-10T10:00:00.000Z'),
};

describe('Certification documents API', () => {
  let app: INestApplication;
  let token: string;
  const jwt = new JwtService({ secret: 'certifications-test-secret' });
  const repository = { findById: vi.fn() };
  const documentsRepository = {
    save: vi.fn(),
    read: vi.fn(),
    remove: vi.fn(),
    hasDocument: vi.fn(),
    findIdsWithDocument: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    repository.findById.mockResolvedValue(record);
    documentsRepository.save.mockResolvedValue(undefined);
    documentsRepository.remove.mockResolvedValue(undefined);
    documentsRepository.hasDocument.mockResolvedValue(true);
    documentsRepository.read.mockResolvedValue(pdfBytes);

    const moduleRef = await Test.createTestingModule({
      imports: [CertificationDocumentsModule],
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

  it.each([
    [
      'pdf',
      'application/pdf',
      Buffer.from('%PDF-1.4\n' + ' '.repeat(80)),
    ],
    [
      'png',
      'image/png',
      Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.alloc(80, 0x00),
      ]),
    ],
    [
      'jpg',
      'image/jpeg',
      Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(80, 0x00)]),
    ],
    ['pdf below the minimum size', 'application/pdf', Buffer.from('%PDF')],
  ])(
    'rejects a truncated %s with 400 and the corrupted file code',
    async (_name, contentType, content) => {
      const response = await request(app.getHttpServer())
        .put(documentPath)
        .set('Authorization', `Bearer ${token}`)
        .attach('file', content, { filename: 'broken', contentType })
        .expect(400);

      expect(response.body).toEqual({
        statusCode: 400,
        data: { code: CORRUPTED_FILE_ERROR_CODE },
        detail: 'File content is incomplete or corrupted',
        ok: false,
      });
      expect(documentsRepository.save).not.toHaveBeenCalled();
    },
  );

  it('uploads, downloads and removes a document through the authenticated API', async () => {
    const uploaded = await request(app.getHttpServer())
      .put(documentPath)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', pdfBytes, {
        filename: 'certificate.pdf',
        contentType: 'application/pdf',
      })
      .expect(200);
    expect(uploaded.body).toMatchObject({
      ok: true,
      data: { id: certificationId, hasDocument: true },
    });
    expect(uploaded.body.data).not.toHaveProperty('userId');
    expect(documentsRepository.save).toHaveBeenCalledWith(
      certificationId,
      pdfBytes,
    );

    const downloaded = await request(app.getHttpServer())
      .get(documentPath)
      .set('Authorization', `Bearer ${token}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => callback(null, Buffer.concat(chunks)));
      })
      .expect(200);
    expect(downloaded.headers['content-type']).toBe('application/pdf');
    expect(downloaded.headers['content-disposition']).toBe(
      `inline; filename="certification-${certificationId}.pdf"`,
    );
    expect(downloaded.body).toEqual(pdfBytes);

    const removed = await request(app.getHttpServer())
      .delete(documentPath)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(removed.body).toEqual({
      statusCode: 200,
      data: null,
      detail: 'OK',
      ok: true,
    });
    expect(documentsRepository.remove).toHaveBeenCalledWith(certificationId);
  });

  it.each(['get', 'put', 'delete'] as const)(
    'protects %s requests without a token',
    async (method) => {
      await request(app.getHttpServer())[method](documentPath).expect(401);
      expect(documentsRepository.save).not.toHaveBeenCalled();
      expect(documentsRepository.read).not.toHaveBeenCalled();
      expect(documentsRepository.remove).not.toHaveBeenCalled();
    },
  );

  it('rejects a request without a file', async () => {
    await request(app.getHttpServer())
      .put(documentPath)
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
    expect(documentsRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a file whose content is not a pdf, png or jpg', async () => {
    await request(app.getHttpServer())
      .put(documentPath)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('plain text'), {
        filename: 'certificate.pdf',
        contentType: 'application/pdf',
      })
      .expect(415);
    expect(documentsRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a file larger than the allowed size', async () => {
    await request(app.getHttpServer())
      .put(documentPath)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.concat([pdfBytes, Buffer.alloc(6 * 1024 * 1024)]), {
        filename: 'certificate.pdf',
        contentType: 'application/pdf',
      })
      .expect(413);
    expect(documentsRepository.save).not.toHaveBeenCalled();
  });

  it('returns 404 when the certification has no document', async () => {
    documentsRepository.read.mockResolvedValue(null);
    documentsRepository.hasDocument.mockResolvedValue(false);

    await request(app.getHttpServer())
      .get(documentPath)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    await request(app.getHttpServer())
      .delete(documentPath)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    expect(documentsRepository.remove).not.toHaveBeenCalled();
  });

  it('returns 404 when the certification belongs to another user', async () => {
    repository.findById.mockResolvedValue({ ...record, userId: otherUserId });

    await request(app.getHttpServer())
      .put(documentPath)
      .set('Authorization', `Bearer ${token}`)
      .attach('file', pdfBytes, {
        filename: 'certificate.pdf',
        contentType: 'application/pdf',
      })
      .expect(404);
    await request(app.getHttpServer())
      .get(documentPath)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    await request(app.getHttpServer())
      .delete(documentPath)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    expect(documentsRepository.save).not.toHaveBeenCalled();
    expect(documentsRepository.read).not.toHaveBeenCalled();
    expect(documentsRepository.remove).not.toHaveBeenCalled();
  });

  it('rejects a malformed certification id', async () => {
    await request(app.getHttpServer())
      .get('/api/certifications/not-a-uuid/document')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
