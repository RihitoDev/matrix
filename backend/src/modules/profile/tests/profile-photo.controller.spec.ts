import type { INestApplication } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DomainExceptionFilter } from '../../../common/filters/domain-exception.filter.js';
import { ProfilePhotoController } from '../controllers/profile-photo.controller.js';
import { ProfilePhotoMapper } from '../mappers/profile-photo.mapper.js';
import { PhotoFileRepository } from '../repositories/photo-file.repository.js';
import { ProfileRepository } from '../repositories/profile.repository.js';
import { FileValidationService } from '../../../common/services/file-validation.service.js';
import { ProfilePhotoService } from '../services/profile-photo.service.js';

const userId = '11111111-1111-4111-8111-111111111111';
const pngBytes = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(50), Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82])]);
const pdfBytes = Buffer.from("%PDF-1.4\n" + " ".repeat(50) + "\n%%EOF\n");

describe('ProfilePhotoController', () => {
  let app: INestApplication;
  let token: string;
  let photoFileRepository: {
    save: ReturnType<typeof vi.fn>;
    read: ReturnType<typeof vi.fn>;
    exists: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    photoFileRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      read: vi.fn().mockResolvedValue(pngBytes),
      exists: vi.fn().mockResolvedValue(true),
      remove: vi.fn().mockResolvedValue(undefined),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ global: true, secret: 'test-secret' })],
      controllers: [ProfilePhotoController],
      providers: [
        ProfilePhotoService,
        FileValidationService,
        ProfilePhotoMapper,
        { provide: PhotoFileRepository, useValue: photoFileRepository },
        {
          provide: ProfileRepository,
          useValue: { findByUserId: vi.fn().mockResolvedValue({ id: userId }) },
        },
        { provide: APP_FILTER, useClass: DomainExceptionFilter },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    token = moduleRef.get(JwtService).sign({ sub: userId, roleTag: 'titulado' });
  });

  afterEach(async () => {
    await app.close();
  });

  it('uploads a png photo for the token user', async () => {
    const response = await request(app.getHttpServer())
      .put('/profile/me/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', pngBytes, { filename: 'photo.png', contentType: 'image/png' })
      .expect(200);

    expect(response.body).toEqual({
      statusCode: 200,
      data: { mimeType: 'image/png', sizeInBytes: pngBytes.length },
      detail: 'OK',
      ok: true,
    });
    expect(photoFileRepository.save).toHaveBeenCalledWith(userId, pngBytes);
  });

  it('rejects a file that is not an image even if it claims to be one', async () => {
    const response = await request(app.getHttpServer())
      .put('/profile/me/photo')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', pdfBytes, { filename: 'photo.png', contentType: 'image/png' })
      .expect(415);

    expect(response.body.ok).toBe(false);
    expect(photoFileRepository.save).not.toHaveBeenCalled();
  });

  it('rejects a request without a file', async () => {
    await request(app.getHttpServer())
      .put('/profile/me/photo')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('rejects an upload without a token', async () => {
    await request(app.getHttpServer())
      .put('/profile/me/photo')
      .attach('file', pngBytes, { filename: 'photo.png', contentType: 'image/png' })
      .expect(401);
  });

  it('returns the saved photo as an image', async () => {
    const response = await request(app.getHttpServer())
      .get('/profile/me/photo')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.headers['content-type']).toBe('image/png');
    expect(Buffer.from(response.body as Buffer)).toEqual(pngBytes);
  });

  it('returns 404 when the user has no photo', async () => {
    photoFileRepository.read.mockResolvedValue(null);

    const response = await request(app.getHttpServer())
      .get('/profile/me/photo')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);

    expect(response.body.detail).toBe('Profile photo not found');
  });

  it('removes the photo', async () => {
    const response = await request(app.getHttpServer())
      .delete('/profile/me/photo')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toEqual({ statusCode: 200, data: null, detail: 'OK', ok: true });
    expect(photoFileRepository.remove).toHaveBeenCalledWith(userId);
  });
});
